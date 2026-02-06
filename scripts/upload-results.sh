#!/bin/bash
# =============================================================================
# Upload test results to Allure Docker Service
# =============================================================================

ALLURE_SERVER="${ALLURE_SERVER_URL:-http://allure:5050}"
RESULTS_DIR="${1:-./allure-results}"
PROJECT_ID="${2:-default}"

echo "================================================"
echo "  Uploading results to Allure Server"
echo "  Server: $ALLURE_SERVER"
echo "  Results: $RESULTS_DIR"
echo "  Project: $PROJECT_ID"
echo "================================================"

# Check if results exist
if [ ! -d "$RESULTS_DIR" ] || [ -z "$(ls -A $RESULTS_DIR 2>/dev/null)" ]; then
    echo "❌ No test results found in $RESULTS_DIR"
    exit 1
fi

# Create zip of results
cd "$RESULTS_DIR"
zip -r /tmp/allure-results.zip . -x "*.zip"
cd -

# Upload results
echo "📤 Uploading results..."
UPLOAD_RESPONSE=$(curl -s -X POST \
    "${ALLURE_SERVER}/allure-docker-service/send-results?project_id=${PROJECT_ID}" \
    -H "Content-Type: multipart/form-data" \
    -F "allureResults=@/tmp/allure-results.zip;type=application/zip")

echo "Upload response: $UPLOAD_RESPONSE"

# Generate report
echo "📊 Generating report..."
REPORT_RESPONSE=$(curl -s -X GET \
    "${ALLURE_SERVER}/allure-docker-service/generate-report?project_id=${PROJECT_ID}")

echo "Report response: $REPORT_RESPONSE"

# Get report URL
REPORT_URL="${ALLURE_SERVER}/allure-docker-service/projects/${PROJECT_ID}/reports/latest/index.html"
echo ""
echo "================================================"
echo "  ✅ Report available at:"
echo "  $REPORT_URL"
echo "================================================"

# Cleanup
rm -f /tmp/allure-results.zip

# Clear results for next run
rm -rf ${RESULTS_DIR}/*
echo "🧹 Cleared results directory for next run"
