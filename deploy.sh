#!/bin/bash

# 🚀 Tone Picker Text Tool - Deployment Script
# This script helps you deploy to GitHub and prepare for Render deployment

echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "Update: Tone Picker Text Tool - Production ready"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No remote origin found!"
    echo "Please run: git remote add origin https://github.com/YOUR_USERNAME/tone-picker-text-tool.git"
    echo "Replace YOUR_USERNAME with your actual GitHub username"
    exit 1
fi

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Render.com and create an account"
echo "2. Create a new Web Service for the backend"
echo "3. Create a new Static Site for the frontend"
echo "4. Set up environment variables"
echo "5. Deploy!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
