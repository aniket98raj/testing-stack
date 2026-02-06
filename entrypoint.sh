#!/bin/bash
# =============================================================================
# Entrypoint: Sets up cron schedule + simple API for manual test triggers
# =============================================================================

set -e

echo "=========================================="
echo "  AI Testing Stack - Starting Up"
echo "  Base URL: ${TEST_BASE_URL}"
echo "  Schedule: ${CRON_SCHEDULE}"
echo "  Timezone: ${TZ:-UTC}"
echo "=========================================="

# Setup cron job for scheduled test runs
if [ -n "$CRON_SCHEDULE" ] && [ "$CRON_SCHEDULE" != "disabled" ]; then
    echo "⏰ Setting up cron schedule: $CRON_SCHEDULE"

    # Export all env vars for cron
    printenv | grep -v "no_proxy" >> /etc/environment

    # Create cron job
    echo "${CRON_SCHEDULE} cd /app && bash scripts/run-tests.sh >> /var/log/test-runner.log 2>&1" > /etc/cron.d/test-runner
    chmod 0644 /etc/cron.d/test-runner
    crontab /etc/cron.d/test-runner

    # Start cron daemon
    service cron start
    echo "✅ Cron started"
fi

# Create log file
touch /var/log/test-runner.log

# Simple HTTP API for manual triggers and health checks
echo "🌐 Starting health check API on port 3000..."

# Run a simple Node.js HTTP server for health checks and manual triggers
node -e "
const http = require('http');
const { exec } = require('child_process');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // Health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'test-runner',
      baseUrl: process.env.TEST_BASE_URL,
      schedule: process.env.CRON_SCHEDULE,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Trigger test run manually
  if (url.pathname === '/run' && req.method === 'POST') {
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Test run started', timestamp: new Date().toISOString() }));

    // Run tests in background
    exec('bash /app/scripts/run-tests.sh', (error, stdout, stderr) => {
      console.log('Test run output:', stdout);
      if (error) console.error('Test run error:', stderr);
    });
    return;
  }

  // Status / last run log
  if (url.pathname === '/logs') {
    const fs = require('fs');
    try {
      const log = fs.readFileSync('/var/log/test-runner.log', 'utf8');
      const lastLines = log.split('\n').slice(-100).join('\n');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(lastLines);
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('No logs yet');
    }
    return;
  }

  // Default
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    endpoints: {
      'GET /health': 'Health check',
      'POST /run': 'Trigger test run',
      'GET /logs': 'View last 100 lines of log'
    }
  }));
});

server.listen(3000, () => {
  console.log('API server listening on port 3000');
});
" &

echo "✅ Test Runner ready!"
echo ""
echo "Endpoints:"
echo "  GET  /health  - Health check"
echo "  POST /run     - Trigger test run"
echo "  GET  /logs    - View logs"
echo ""

# Keep container running by tailing the log
tail -f /var/log/test-runner.log
