#!/bin/bash

# Byit Real Estate Platform Setup Script
# This script sets up the entire development environment

set -e

echo "🏗️  Setting up Byit Real Estate Platform..."
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) is installed"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed. Please install PostgreSQL and create a database."
    echo "You can install PostgreSQL with:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/"
fi

print_status "Installing root dependencies..."
npm install

print_status "Installing backend dependencies..."
cd backend
npm install
print_success "Backend dependencies installed"

print_status "Installing frontend dependencies..."
cd ../frontend
npm install
print_success "Frontend dependencies installed"

cd ..

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    print_warning "Backend .env file not found. Please copy backend/.env.example to backend/.env and configure your database."
    echo "Example:"
    echo "  cp backend/.env.example backend/.env"
    echo "  # Then edit backend/.env with your database credentials"
fi

print_status "Generating Prisma client..."
cd backend
npx prisma generate
print_success "Prisma client generated"

print_success "Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Configure your database in backend/.env"
echo "2. Run database migrations: npm run db:migrate"
echo "3. Seed the database: npm run seed"
echo "4. Start development servers: npm run dev"
echo ""
echo "📖 Useful commands:"
echo "  npm run dev          - Start both frontend and backend in development mode"
echo "  npm run build        - Build both frontend and backend for production"
echo "  npm run db:studio    - Open Prisma Studio to browse your database"
echo "  npm run lint         - Run linting on the frontend"
echo ""
echo "🌐 Default URLs:"
echo "  Frontend: http://localhost:3003"
echo "  Backend:  http://localhost:4000"
echo "  Health:   http://localhost:4000/health"
echo ""
print_success "Happy coding! 🎉"
