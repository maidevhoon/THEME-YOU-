#!/bin/bash

# Theme You - Deployment Script
echo "🎨 Theme You - Building for deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Running TypeScript type check..."
npm run type-check

# Build the project
echo "🏗️ Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files are in the 'dist' directory"
    echo ""
    echo "🚀 To deploy to GitHub Pages:"
    echo "1. Push your changes to the main branch"
    echo "2. GitHub Actions will automatically deploy to gh-pages"
    echo "3. Your site will be available at: https://[your-username].github.io/BOT/"
    echo ""
    echo "🔧 To preview locally: npm run preview"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi 