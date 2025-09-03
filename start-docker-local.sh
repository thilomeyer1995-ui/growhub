#!/bin/bash

echo "🚀 Starting GrowHub with Docker Compose (Local Database)..."

# Check if PostgreSQL is running locally
echo "🔍 Checking local PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "Please start your local PostgreSQL server first:"
    echo "  - Windows: Start PostgreSQL service"
    echo "  - macOS: brew services start postgresql"
    echo "  - Linux: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running locally"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.local-db.yml down

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker-compose -f docker-compose.local-db.yml down --rmi all

# Build and start the services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.local-db.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose -f docker-compose.local-db.yml ps

# Show logs
echo "📋 Showing logs..."
docker-compose -f docker-compose.local-db.yml logs --tail=20

echo ""
echo "✅ GrowHub is starting up!"
echo "🌐 Backend API: http://localhost:3000"
echo "🌐 Frontend: http://localhost:3001"
echo "🗄️  Database: localhost:5432 (local PostgreSQL)"
echo ""
echo "📋 To view logs: docker-compose -f docker-compose.local-db.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.local-db.yml down"
