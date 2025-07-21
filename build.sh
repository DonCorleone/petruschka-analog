#!/bin/bash

# Deployment script for production builds
echo "Starting production build..."

# Set environment variables
export NODE_ENV=production
export BUILD_TIME=true

# Install dependencies
npm ci

# Build the application
npm run build:prod

echo "Build completed successfully!"
