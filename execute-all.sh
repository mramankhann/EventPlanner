#!/bin/bash

# Kill all background jobs when the script exits
trap 'kill $(jobs -p)' EXIT

# Start Backend
echo "Starting Backend Server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to potentially initialize
sleep 2

# Start Frontend
echo "Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
