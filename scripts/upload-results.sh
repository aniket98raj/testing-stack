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

# Count files
FILE_COUNT=$(find "$RESULTS_DIR" -type f | wc -l)
echo "📁 Found $FILE_COUNT result files"

# Build the curl command with individual files
# Allure Docker Service expects each file as a separate files[] field
CURL_ARGS=""
for file in $(find "$RESULTS_DIR" -type f); do
    CURL_ARGS="$CURL_ARGS -F files[]=@$file"
done

# Upload results
echo "📤 Uploading $FILE_COUNT files..."
UPLOAD_RESPONSE=$(curl -s -X POST \
    "${ALLURE_SERVER}/allure-docker-service/send-results?project_id=${PROJECT_ID}" \
    -H "Content-Type: multipart/form-data" \
    $CURL_ARGS)

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

# Clear results for next run
rm -rf ${RESULTS_DIR}/*
echo "🧹 Cleared results directory for next run"
