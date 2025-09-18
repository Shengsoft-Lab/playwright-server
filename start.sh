#!/bin/bash

# Playwright Server Startup Script
# This script sets up the environment and starts the Playwright server

set -e

echo "🚀 Starting Playwright Server..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install Playwright browsers if not already installed
echo "🌐 Installing Playwright browsers..."
npx playwright install webkit chromium

# Set default environment variables if not set
export WEBKIT_START_PORT=${WEBKIT_START_PORT:-20000}
export CHROME_START_PORT=${CHROME_START_PORT:-30000}
export PORT=${PORT:-9001}

echo "⚙️  Configuration:"
echo "   Server port: ${PORT}"
echo "   WebKit start port: ${WEBKIT_START_PORT}"
echo "   Chrome start port: ${CHROME_START_PORT}"
echo ""

# Start the server
echo "🎯 Starting Playwright server..."
node src/server.js
