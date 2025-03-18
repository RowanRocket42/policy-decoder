#!/bin/bash

# restart-server.sh - A script to safely restart the Policy Decoder server
# Created to help with server connection issues

echo "🔄 Policy Decoder Server Restart Utility"
echo "----------------------------------------"

# Check if server is already running on port 5005
SERVER_PID=$(lsof -ti :5005)

if [ -n "$SERVER_PID" ]; then
  echo "✅ Found server running with PID: $SERVER_PID"
  echo "🛑 Stopping server process..."
  kill $SERVER_PID
  
  # Wait to make sure the process is terminated
  sleep 2
  
  # Check if process is still running
  if ps -p $SERVER_PID > /dev/null; then
    echo "⚠️ Server process is still running. Forcing termination..."
    kill -9 $SERVER_PID
    sleep 1
  fi
  
  echo "✅ Server process stopped."
else
  echo "ℹ️ No server running on port 5005."
fi

# Navigate to the server directory
cd "$(dirname "$0")/server"

# Check if we're in the right directory
if [ ! -f "index.js" ]; then
  echo "❌ Error: index.js not found in current directory."
  echo "Please run this script from the project root directory."
  exit 1
fi

echo "🚀 Starting server..."
echo "----------------------------------------"

# Start the server in the background
npm start &

# Wait a moment for the server to start
sleep 3

# Check if server started successfully
if lsof -ti :5005 > /dev/null; then
  echo "✅ Server started successfully!"
  echo "----------------------------------------"
  echo "📡 Server is now running at http://localhost:5005"
  echo "🏥 Health check available at http://localhost:5005/health"
  echo "📝 Use this script again to restart the server if needed."
else
  echo "❌ Error: Server failed to start."
  echo "Check the server logs for more information."
fi

echo "----------------------------------------"
echo "To start the client, run: cd client && npm start" 