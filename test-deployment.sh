#!/bin/bash

# Verification Test Script
# Tests that all components are working correctly

echo "🧪 Running verification tests..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

FAILED=0

# Test 1: Check if server files exist
echo "1️⃣  Checking server files..."
if [ -f "server/index.js" ] && [ -f "server/onChainVerification.js" ]; then
    echo -e "${GREEN}✓ Server files exist${NC}"
else
    echo -e "${RED}✗ Server files missing${NC}"
    FAILED=1
fi

# Test 2: Check if deployment scripts exist
echo "2️⃣  Checking deployment scripts..."
if [ -f "deploy.sh" ] && [ -f "quick-start.sh" ]; then
    echo -e "${GREEN}✓ Deployment scripts exist${NC}"
else
    echo -e "${RED}✗ Deployment scripts missing${NC}"
    FAILED=1
fi

# Test 3: Check if scripts are executable
echo "3️⃣  Checking script permissions..."
if [ -x "deploy.sh" ] && [ -x "quick-start.sh" ]; then
    echo -e "${GREEN}✓ Scripts are executable${NC}"
else
    echo -e "${RED}✗ Scripts need execute permission${NC}"
    chmod +x deploy.sh quick-start.sh
    echo -e "${GREEN}✓ Fixed permissions${NC}"
fi

# Test 4: Syntax check for JavaScript files
echo "4️⃣  Checking JavaScript syntax..."
if node -c server/onChainVerification.js && node -c server/routes/verification.js; then
    echo -e "${GREEN}✓ JavaScript syntax valid${NC}"
else
    echo -e "${RED}✗ JavaScript syntax errors${NC}"
    FAILED=1
fi

# Test 5: Check if dependencies are installed
echo "5️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Backend dependencies missing${NC}"
    echo "  Run: npm install"
    FAILED=1
fi

# Test 6: Start server and test endpoints
echo "6️⃣  Testing server..."
node server/index.js &
SERVER_PID=$!
sleep 3

# Test health endpoint
HEALTH=$(curl -s http://localhost:5000/api/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server health check failed${NC}"
    FAILED=1
fi

# Test verification endpoint
EXPLORERS=$(curl -s http://localhost:5000/api/verification/explorers)
if echo "$EXPLORERS" | grep -q "etherscan"; then
    echo -e "${GREEN}✓ Verification endpoints working${NC}"
else
    echo -e "${RED}✗ Verification endpoints not responding${NC}"
    FAILED=1
fi

# Stop server
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo "  System is ready for deployment 🚀"
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo "  Please fix the issues above"
    exit 1
fi
echo "═══════════════════════════════════════"
