#!/bin/bash

# LookForX Admin Panel - Stop Script
echo "🛑 Stopping LookForX Admin Panel..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if port 3000 is in use
if lsof -Pi :3000 -sTCP:LISTEN -t > /dev/null 2>&1; then
    echo -e "${YELLOW}⏳ Stopping processes on port 3000...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    
    # Wait a moment and verify
    sleep 1
    if ! lsof -Pi :3000 -sTCP:LISTEN -t > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Admin Panel stopped successfully${NC}"
    else
        echo -e "${RED}❌ Failed to stop some processes${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}ℹ️  No process found running on port 3000${NC}"
fi

# Also kill any npm/node processes related to this project
pkill -f "next dev" 2>/dev/null && echo -e "${GREEN}✅ Stopped Next.js dev server${NC}"

echo -e "${GREEN}✨ All admin panel processes stopped${NC}"
