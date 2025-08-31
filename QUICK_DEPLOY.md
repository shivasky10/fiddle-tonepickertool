# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] All files are saved and working locally
- [ ] Mistral AI API key is ready
- [ ] GitHub account created
- [ ] Render account created
- [ ] Git is installed on your computer

## 🔧 Step-by-Step Deployment

### 1. Initialize Git & Push to GitHub

```bash
# Navigate to project directory
cd tonepicker

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Tone Picker Text Tool"

# Create GitHub repository at: https://github.com/YOUR_USERNAME/tone-picker-text-tool
# (Make it PUBLIC for free Render deployment)

# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/tone-picker-text-tool.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Deploy Backend to Render

1. **Go to [Render.com](https://render.com)**
2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository: `tone-picker-text-tool`
   - **Name**: `tone-picker-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

3. **Set Environment Variables**
   ```
   NODE_ENV = production
   MISTRAL_API_KEY = your_actual_mistral_api_key
   PORT = 10000
   ```

4. **Deploy** - Click "Create Web Service"
5. **Note the URL**: `https://tone-picker-backend.onrender.com`

### 3. Deploy Frontend to Render

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect GitHub repository: `tone-picker-text-tool`
   - **Name**: `tone-picker-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
   - **Plan**: Free

2. **Set Environment Variable**
   ```
   REACT_APP_API_URL = https://tone-picker-backend.onrender.com/api
   ```

3. **Deploy** - Click "Create Static Site"
4. **Note the URL**: `https://tone-picker-frontend.onrender.com`

### 4. Update Configuration (After Deployment)

Update these files with your actual Render URLs:

**In `client/src/services/api.js`:**
```javascript
baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://tone-picker-backend.onrender.com/api' 
  : 'http://localhost:5000/api'),
```

**In `server/index.js`:**
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://tone-picker-frontend.onrender.com'] 
  : ['http://localhost:3000'],
```

### 5. Final Push

```bash
git add .
git commit -m "Update deployment URLs"
git push
```

## ✅ Verification Steps

1. **Test Backend API**
   ```bash
   curl https://tone-picker-backend.onrender.com/api/health
   ```

2. **Test Frontend**
   - Open: `https://tone-picker-frontend.onrender.com`
   - Test text editing and tone adjustment
   - Verify all 9 matrix positions work

3. **Check Logs**
   - Monitor Render dashboard for any errors
   - Check build and deployment logs

## 🎯 Your Live URLs

- **Frontend**: `https://tone-picker-frontend.onrender.com`
- **Backend API**: `https://tone-picker-backend.onrender.com`
- **Health Check**: `https://tone-picker-backend.onrender.com/api/health`

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build fails | Check package.json dependencies |
| API not working | Verify MISTRAL_API_KEY is set |
| CORS errors | Check frontend URL in backend CORS config |
| 404 errors | Ensure all routes are properly configured |

## 📞 Need Help?

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **GitHub Help**: [help.github.com](https://help.github.com)
- **Mistral AI**: [docs.mistral.ai](https://docs.mistral.ai)

---

**🎉 Success!** Your Tone Picker Text Tool is now live and accessible worldwide!
