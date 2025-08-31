# 🚀 Deployment Guide - GitHub & Render

This guide will walk you through deploying the Tone Picker Text Tool to GitHub and Render.

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Mistral AI API key
- Git installed on your computer

## 🔧 Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository
```bash
# Navigate to your project directory
cd tonepicker

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Tone Picker Text Tool"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it: `tone-picker-text-tool`
4. Make it **Public** (for free Render deployment)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 1.3 Push to GitHub
```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/tone-picker-text-tool.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Deploy to Render

### 2.1 Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email

### 2.2 Deploy Backend Service

1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `tone-picker-text-tool`

2. **Configure Backend Service**
   - **Name**: `tone-picker-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

3. **Environment Variables**
   - Click "Environment" tab
   - Add these variables:
     ```
     NODE_ENV = production
     MISTRAL_API_KEY = your_mistral_api_key_here
     PORT = 10000
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Note the URL: `https://tone-picker-backend.onrender.com`

### 2.3 Deploy Frontend Service

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select `tone-picker-text-tool`

2. **Configure Frontend Service**
   - **Name**: `tone-picker-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
   - **Plan**: Free

3. **Environment Variables**
   - Click "Environment" tab
   - Add this variable:
     ```
     REACT_APP_API_URL = https://tone-picker-backend.onrender.com/api
     ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment (2-3 minutes)
   - Note the URL: `https://tone-picker-frontend.onrender.com`

## 🔗 Step 3: Update Configuration

### 3.1 Update API URLs
After deployment, update these files with your actual Render URLs:

**In `client/src/services/api.js`:**
```javascript
baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://YOUR_BACKEND_APP_NAME.onrender.com/api' 
  : 'http://localhost:5000/api'),
```

**In `server/index.js`:**
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://YOUR_FRONTEND_APP_NAME.onrender.com'] 
  : ['http://localhost:3000'],
```

### 3.2 Commit and Push Changes
```bash
git add .
git commit -m "Update deployment URLs"
git push
```

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend API
```bash
# Test health endpoint
curl https://YOUR_BACKEND_APP_NAME.onrender.com/api/health
```

### 4.2 Test Frontend
1. Open your frontend URL in browser
2. Test the application functionality
3. Verify API calls work correctly

## 🔧 Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain
4. Update DNS records as instructed

## 📊 Monitoring & Maintenance

### 5.1 Monitor Logs
- Render provides real-time logs
- Check for errors and performance issues
- Monitor API usage and costs

### 5.2 Update Application
```bash
# Make changes locally
git add .
git commit -m "Update application"
git push

# Render will automatically redeploy
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Render
   - Verify all dependencies are in package.json
   - Ensure build commands are correct

2. **API Connection Issues**
   - Verify environment variables are set
   - Check CORS configuration
   - Test API endpoints directly

3. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match code
   - Verify API keys are valid

4. **Performance Issues**
   - Monitor Render service logs
   - Check API response times
   - Optimize code if needed

## 📞 Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **GitHub Help**: [help.github.com](https://help.github.com)
- **Mistral AI Docs**: [docs.mistral.ai](https://docs.mistral.ai)

---

**🎉 Congratulations!** Your Tone Picker Text Tool is now deployed and accessible worldwide!
