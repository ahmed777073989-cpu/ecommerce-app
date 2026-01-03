#!/bin/bash

echo "🚀 Starting Ecommerce App Development Environment"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Start Docker services
echo "📦 Starting PostgreSQL and Redis..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
  echo "📥 Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

# Check if database is seeded
echo "🌱 Checking database seed status..."
cd backend
if ! npm run seed 2>&1 | grep -q "Super admin already exists"; then
  echo "✓ Database seeded successfully"
else
  echo "✓ Database already seeded"
fi
cd ..

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 10

# Check if backend is running
if curl -s http://localhost:3000/api/auth/me > /dev/null 2>&1; then
  echo "✅ Backend is running on http://localhost:3000"
else
  echo "⚠️  Backend may still be starting up. Check backend.log for details."
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📌 Services:"
echo "  - Backend API: http://localhost:3000"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "🔑 Default Credentials:"
echo "  - Super Admin Phone: +966500000001"
echo "  - Password: admin123"
echo ""
echo "📝 Next Steps:"
echo "  1. For mobile: cd mobile && npm install && npm start"
echo "  2. For admin: cd admin-dashboard && npm install && npm run dev"
echo "  3. Check backend logs: tail -f backend.log"
echo ""
echo "🛑 To stop: docker compose down && pkill -f 'ts-node-dev'"
