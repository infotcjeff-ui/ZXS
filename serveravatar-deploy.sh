#!/bin/bash
# ServerAvatar Deployment Script
# This script ensures proper build and deployment

set -e  # Exit on error

echo "Starting ServerAvatar deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build for ServerAvatar
echo "Building for ServerAvatar..."
npm run build:serveravatar

# Verify build output
echo "Verifying build output..."
if [ ! -f "dist/index.html" ]; then
    echo "ERROR: dist/index.html not found!"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo "ERROR: dist/assets directory not found!"
    exit 1
fi

# Check if .htaccess was copied
if [ -f ".htaccess" ] && [ ! -f "dist/.htaccess" ]; then
    echo "Copying .htaccess to dist..."
    cp .htaccess dist/.htaccess
fi

# List build output
echo "Build output:"
ls -la dist/

echo "Deployment script completed successfully!"

