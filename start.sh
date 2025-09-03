#!/bin/bash

echo "🏗️ Byit Real Estate Admin Panel Setup"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "\n${BLUE}1. Checking PostgreSQL...${NC}"
if pg_isready -q; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    echo -e "${YELLOW}Please start PostgreSQL first:${NC}"
    echo "  macOS: brew services start postgresql"
    echo "  Linux: sudo systemctl start postgresql"
    echo "  Windows: Start PostgreSQL service"
    exit 1
fi

# Check if database exists
echo -e "\n${BLUE}2. Setting up database...${NC}"
cd backend

# Create database if it doesn't exist
createdb byit_db 2>/dev/null && echo -e "${GREEN}✓ Database 'byit_db' created${NC}" || echo -e "${YELLOW}! Database 'byit_db' already exists${NC}"

# Run Prisma migrations
echo -e "\n${BLUE}3. Setting up database schema...${NC}"
npx prisma migrate dev --name init
npx prisma generate

# Seed the database
echo -e "\n${BLUE}4. Seeding with Egyptian market data...${NC}"
npm run seed

echo -e "\n${GREEN}✅ Backend setup completed!${NC}"

# Start backend in background
echo -e "\n${BLUE}5. Starting backend server...${NC}"
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo -e "\n${BLUE}6. Starting frontend server...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}🚀 Byit Admin Panel is starting up!${NC}"
echo -e "\n${YELLOW}Services:${NC}"
echo -e "  • Backend API: ${BLUE}http://localhost:4000${NC}"
echo -e "  • Frontend App: ${BLUE}http://localhost:3002${NC}"
echo -e "\n${YELLOW}Demo Credentials:${NC}"
echo -e "  • Super Admin: ${GREEN}admin / admin123${NC}"
echo -e "  • Manager: ${GREEN}manager / manager123${NC}"
echo -e "  • Senior User: ${GREEN}senior / senior123${NC}"

echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for user to stop
trap 'echo -e "\n${YELLOW}Stopping services...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
wait
