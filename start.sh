#!/bin/bash

# LookForX Admin Panel - Start Script
echo "🚀 Starting LookForX Admin Panel..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Kill any existing process on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use, stopping existing process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start Next.js dev server in background
echo -e "${YELLOW}🌱 Starting Next.js development server...${NC}"
nohup npm run dev > logs/admin-panel.log 2>&1 &
APP_PID=$!

echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"

# Wait for application startup (max 30 seconds)
timeout=30
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if lsof -Pi :3000 -sTCP:LISTEN -t > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Admin Panel started successfully!${NC}"
        echo -e "${GREEN}📝 Application PID: $APP_PID${NC}"
        echo -e "${GREEN}🌐 Local URL: http://localhost:3000${NC}"
        echo -e "${GREEN}📊 Logs: tail -f logs/admin-panel.log${NC}"
        echo -e "${GREEN}🛑 Stop: ./stop.sh${NC}"
        exit 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
done

echo -e "${RED}❌ Application failed to start within $timeout seconds${NC}"
echo -e "${YELLOW}Check logs/admin-panel.log for details${NC}"
exit 1
