#!/bin/bash

# One-Command Deployment Script
# Ultra-simple, 100% automatic deployment

echo "🚀 Assets in Control - One-Command Deployment"
echo "=============================================="
echo ""

# Install dependencies and deploy
bash deploy.sh

# Start the application
echo ""
echo "🎯 Starting application..."
echo ""

export NODE_ENV=production
node server/index.js
