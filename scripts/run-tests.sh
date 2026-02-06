#!/bin/bash
# =============================================================================
# Run tests and upload results - called by cron or manually
# =============================================================================

set -e

echo "=========================================="
echo "  Test Run: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Target:   ${TEST_BASE_URL}"
echo "=========================================="

cd /app

# Run Playwright tests
echo "🧪 Running tests..."
npx playwright test --reporter=list,allure-playwright 2>&1 | tee /tmp/test-output.log
TEST_EXIT=$?

# Upload results to Allure regardless of test outcome
echo "📤 Uploading results to Allure..."
bash scripts/upload-results.sh ./allure-results default

if [ $TEST_EXIT -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "⚠️  Some tests failed (exit code: $TEST_EXIT)"
    echo "   Check the Allure dashboard for details."
fi

echo "=========================================="
echo "  Completed: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
