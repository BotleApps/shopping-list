#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Shutting down..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting Shopping List App Locally..."

# Check and setup Backend
echo "-----------------------------------"
echo "📦 Setting up Backend..."
cd server
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies found."
fi

echo "Starting Backend Server..."
# Run backend in background
PORT=5001 npm start &
cd ..

# Check and setup Frontend
echo "-----------------------------------"
echo "📦 Setting up Frontend..."
cd client
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies found."
fi

echo "Starting Frontend..."
# Run frontend in background
npm run dev &
cd ..

echo "-----------------------------------"
echo "✅ App is starting up!"
echo "Backend API: http://localhost:5001"
echo "Frontend UI: http://localhost:5173"
echo "Press Ctrl+C to stop all servers."
echo "-----------------------------------"

# Wait for all background processes
wait
