#!/bin/bash

# Blue Horizon API Test Runner
# Run this script to validate all API endpoints

BASE_URL="http://localhost:3001"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌊 Blue Horizon API Test Suite${NC}"
echo "================================="
echo ""

# Helper function to run a test
run_test() {
    local test_name="$1"
    local url="$2"
    local expected_status="$3"
    local validation_jq="$4"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing: $test_name... "
    
    # Make the request and capture response
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url")
    http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed "s/HTTPSTATUS:$http_code//")
    
    # Check HTTP status
    if [ "$http_code" != "$expected_status" ]; then
        echo -e "${RED}FAIL${NC} (HTTP $http_code, expected $expected_status)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
    
    # Validate JSON structure if jq query provided
    if [ -n "$validation_jq" ]; then
        if ! echo "$body" | jq -e "$validation_jq" > /dev/null 2>&1; then
            echo -e "${RED}FAIL${NC} (Invalid JSON structure)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    fi
    
    echo -e "${GREEN}PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
}

echo -e "${YELLOW}🏥 Health Checks${NC}"
echo "---------------"
run_test "Server Health Check" "$BASE_URL/" "200"
echo ""

echo -e "${YELLOW}📈 Trends API Tests${NC}"
echo "-------------------"
run_test "24h Trends" "$BASE_URL/api/trends/WQ-001?range=24h" "200" '.deviceId and .range and .data and .summary'
run_test "7d Trends" "$BASE_URL/api/trends/WQ-001?range=7d" "200" '.deviceId and .range and .data and .summary'
run_test "30d Trends" "$BASE_URL/api/trends/WQ-001?range=30d" "200" '.deviceId and .range and .data and .summary'
run_test "Default Range" "$BASE_URL/api/trends/WQ-001" "200" '.range == "24h"'
echo ""

echo -e "${YELLOW}❌ Error Handling Tests${NC}"
echo "----------------------"
run_test "Invalid Range" "$BASE_URL/api/trends/WQ-001?range=invalid" "400" '.error'
run_test "Non-existent Device" "$BASE_URL/api/trends/FAKE-DEVICE" "200" '.data | length == 0'
echo ""

echo -e "${YELLOW}📊 Data Quality Tests${NC}"
echo "---------------------"

# Test that 24h data has correct structure
echo -n "Testing: Data Structure Validation... "
response=$(curl -s "$BASE_URL/api/trends/WQ-001?range=24h")
if echo "$response" | jq -e '.data[0] | has("t") and has("ph") and has("ntu") and has("tds")' > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}FAIL${NC} (Missing required data fields)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test that timestamps are in correct format
echo -n "Testing: Timestamp Format... "
if echo "$response" | jq -e '.data[0].t | test("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.*Z$")' > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}FAIL${NC} (Invalid timestamp format)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test that pH values are in realistic range
echo -n "Testing: pH Value Range (6-9)... "
if echo "$response" | jq -e '.data[0].ph >= 6 and .data[0].ph <= 9' > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}FAIL${NC} (pH out of realistic range)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "================================="
echo -e "${BLUE}📋 Test Results Summary${NC}"
echo "================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check your API implementation.${NC}"
    exit 1
fi