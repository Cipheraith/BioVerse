#!/bin/bash

# 🧪 BioVerse Platform Test Script
# Tests all services and integrations

echo "🧪 TESTING BIOVERSE PLATFORM"
echo "============================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() {
    echo -e "${BLUE}🔍 Testing: $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
}

print_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}⚠️  WARN: $1${NC}"
}

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_test "$test_name"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if eval "$test_command" >/dev/null 2>&1; then
        print_pass "$test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_fail "$test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Test 1: Check if services are running
echo ""
echo "📡 SERVICE AVAILABILITY TESTS"
echo "=============================="

run_test "Node.js Server (Port 3000)" "curl -f http://localhost:3000/health"
run_test "Python AI Service (Port 8000)" "curl -f http://localhost:8000/health"
run_test "React Client (Port 5173)" "curl -f http://localhost:5173"

# Test 2: API Integration Tests
echo ""
echo "🔗 API INTEGRATION TESTS"
echo "========================"

# Test health twin creation
print_test "Health Twin Creation API"
HEALTH_TWIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/health-twins/create \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "test-123",
    "vitals": {"heart_rate": 72, "systolic_bp": 120, "diastolic_bp": 80},
    "medical_history": ["hypertension"],
    "lifestyle": {"age": 30, "smoking": false}
  }' 2>/dev/null)

if echo "$HEALTH_TWIN_RESPONSE" | grep -q "success.*true"; then
    print_pass "Health Twin Creation API"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Extract health twin ID for further tests
    HEALTH_TWIN_ID=$(echo "$HEALTH_TWIN_RESPONSE" | grep -o '"health_twin_id":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$HEALTH_TWIN_ID" ]; then
        # Test health twin retrieval
        run_test "Health Twin Retrieval API" "curl -f http://localhost:8000/api/v1/health-twins/$HEALTH_TWIN_ID"
    fi
else
    print_fail "Health Twin Creation API"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 3: ML Predictions
print_test "ML Health Score Prediction"
ML_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/ml/predict/health-score \
  -H "Content-Type: application/json" \
  -d '{"features": [30, 72, 120, 80, 98.6, 70, 170, 0, 3, 1, 0, 0]}' 2>/dev/null)

if echo "$ML_RESPONSE" | grep -q "health_score"; then
    print_pass "ML Health Score Prediction"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_fail "ML Health Score Prediction"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 4: Visualization APIs
print_test "3D Health Twin Visualization"
VIZ_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/viz/3d-health-twin \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "test-viz-123",
    "patient_data": {"health_score": 75, "head_health": 80}
  }' 2>/dev/null)

if echo "$VIZ_RESPONSE" | grep -q "visualization"; then
    print_pass "3D Health Twin Visualization"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_fail "3D Health Twin Visualization"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 5: Analytics APIs
print_test "Symptom Analysis API"
SYMPTOM_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/analytics/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["headache", "fever", "fatigue"]}' 2>/dev/null)

if echo "$SYMPTOM_RESPONSE" | grep -q "analysis"; then
    print_pass "Symptom Analysis API"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_fail "Symptom Analysis API"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Test 6: Optional Services
echo ""
echo "🔧 OPTIONAL SERVICE TESTS"
echo "========================="

# Test Ollama
print_test "Ollama AI Service"
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    print_pass "Ollama AI Service (Available)"
    
    # Test if required model is available
    if ollama list | grep -q "deepseek-r1"; then
        print_pass "DeepSeek R1 Model (Available)"
    else
        print_warn "DeepSeek R1 Model (Not installed - run: ollama pull deepseek-r1:1.5b)"
    fi
else
    print_warn "Ollama AI Service (Not running - install from https://ollama.ai)"
fi

# Test Database
print_test "Database Connection"
if curl -s http://localhost:3000/health | grep -q "database.*connected"; then
    print_pass "Database Connection"
else
    print_warn "Database Connection (Check server logs)"
fi

# Test 7: Performance Tests
echo ""
echo "⚡ PERFORMANCE TESTS"
echo "==================="

# Test response times
print_test "API Response Time (<1s)"
START_TIME=$(date +%s%N)
curl -s http://localhost:3000/health >/dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 1000 ]; then
    print_pass "API Response Time (${RESPONSE_TIME}ms)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    print_fail "API Response Time (${RESPONSE_TIME}ms - too slow)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Final Results
echo ""
echo "📊 TEST RESULTS"
echo "==============="
echo "Total Tests: $TESTS_TOTAL"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Your BioVerse platform is working perfectly!${NC}"
    echo ""
    echo "🚀 Your platform is ready for:"
    echo "   • Health twin generation"
    echo "   • AI-powered predictions"
    echo "   • 3D visualizations"
    echo "   • Real-time analytics"
    echo ""
    echo "🌐 Access your platform:"
    echo "   • Frontend: http://localhost:5173"
    echo "   • API Docs: http://localhost:8000/docs"
    echo "   • Health Check: http://localhost:3000/health"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed. Check the logs for details:${NC}"
    echo "   • Server logs: logs/server.log"
    echo "   • Python AI logs: logs/python-ai.log"
    echo "   • Client logs: logs/client.log"
    echo ""
    echo "🔧 Common fixes:"
    echo "   • Restart services: ./start-bioverse.sh"
    echo "   • Check ports: lsof -i :3000,5173,8000"
    echo "   • Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh"
    exit 1
fi