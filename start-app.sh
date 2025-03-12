#!/bin/bash

# Kill any processes running on ports 3001 and 8000
echo "Stopping any existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Start the server
echo "Starting server on port 8000..."
cd server
npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Start the client
echo "Starting client on port 3001..."
cd ../client
npm run start &
CLIENT_PID=$!

echo "Application started!"
echo "Server running on http://localhost:8000"
echo "Client running on http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both processes"

# Wait for user to press Ctrl+C
trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait 