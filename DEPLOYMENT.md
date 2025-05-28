# 🚀 TechLearn Solutions - Deployment Guide

This guide will help you deploy your TechLearn project to production using Vercel for the frontend and Railway for the backend.

## 📋 Deployment Strategy

### Option 1: Frontend on Vercel + Backend on Railway (Recommended)

This approach separates concerns and provides optimal performance:
- **Frontend**: Deployed on Vercel (fast CDN, automatic deployments)
- **Backend**: Deployed on Railway (database support, Python environment)

## 🔧 Step 1: Deploy Backend to Railway

### 1.1 Prepare Backend for Railway

Create a `railway.json` file in your project root:

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "python app.py",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 1.2 Create Procfile

Create a `Procfile` in your project root:

```
web: python app.py
```

### 1.3 Update requirements.txt

Ensure your `requirements.txt` includes all dependencies:

```
Flask==2.3.3
Flask-CORS==4.0.0
mysql-connector-python==8.1.0
bcrypt==4.0.1
python-dotenv==1.0.0
```

### 1.4 Deploy to Railway

1. **Sign up for Railway**: Go to [railway.app](https://railway.app)
2. **Connect GitHub**: Link your GitHub repository
3. **Create New Project**: Click "New Project" → "Deploy from GitHub repo"
4. **Select Repository**: Choose your TechLearn repository
5. **Add Database**: Click "Add Service" → "Database" → "MySQL"
6. **Environment Variables**: Add these variables in Railway dashboard:
   ```
   MYSQL_HOST=<railway-mysql-host>
   MYSQL_USER=<railway-mysql-user>
   MYSQL_PASSWORD=<railway-mysql-password>
   MYSQL_DATABASE=<railway-mysql-database>
   MYSQL_PORT=<railway-mysql-port>
   FLASK_ENV=production
   ```
7. **Deploy**: Railway will automatically deploy your backend

### 1.5 Get Backend URL

After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Update Configuration

Update `frontend/config.js` with your Railway backend URL:

```javascript
const config = {
    development: {
        API_BASE_URL: 'http://127.0.0.1:5000'
    },
    production: {
        API_BASE_URL: 'https://your-app-name.railway.app' // Replace with your Railway URL
    }
};
```

### 2.2 Update vercel.json

Update the `vercel.json` file with your backend URL:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/frontend/index.html"
    },
    {
      "src": "/dashboard",
      "dest": "/frontend/dashboard.html"
    },
    {
      "src": "/compiler",
      "dest": "/frontend/compiler.html"
    },
    {
      "src": "/frontend/(.*)",
      "dest": "/frontend/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### 2.3 Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

   Or use the Vercel dashboard:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: Other
     - Root Directory: `./`
     - Build Command: `echo "Static site"`
     - Output Directory: `frontend`

## 🔒 Step 3: Configure CORS and Security

### 3.1 Update Flask CORS Settings

In your `app.py`, update CORS configuration:

```python
from flask_cors import CORS

# Update CORS configuration for production
CORS(app, origins=[
    'https://your-vercel-app.vercel.app',  # Your Vercel frontend URL
    'http://localhost:3000',  # For local development
    'http://127.0.0.1:5000'   # For local development
], credentials=True)
```

### 3.2 Update Session Configuration

```python
# Production session configuration
app.config['SESSION_COOKIE_SECURE'] = True  # HTTPS only
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # For cross-origin requests
```

## 🧪 Step 4: Testing Deployment

### 4.1 Test Backend

Visit your Railway URL and test these endpoints:
- `GET /` - Should return "TechLearn Backend is running!"
- `GET /exercises` - Should return exercises list
- `POST /signup` - Test user registration

### 4.2 Test Frontend

Visit your Vercel URL and test:
- User registration and login
- Dashboard loading
- Exercise navigation
- Code compiler functionality

## 🔧 Step 5: Environment-Specific Configuration

### 5.1 Database Configuration

For production, update your database configuration in `app.py`:

```python
import os

# Production database configuration
db_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DATABASE', 'techlearn_auth'),
    'port': int(os.getenv('MYSQL_PORT', 3306))
}
```

### 5.2 Production Optimizations

Add these optimizations to your Flask app:

```python
# Production optimizations
if os.getenv('FLASK_ENV') == 'production':
    app.config['DEBUG'] = False
    app.config['TESTING'] = False
    
    # Add security headers
    @app.after_request
    def after_request(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response
```

## 📊 Step 6: Monitoring and Maintenance

### 6.1 Set Up Monitoring

- **Railway**: Monitor logs and metrics in Railway dashboard
- **Vercel**: Monitor deployments and analytics in Vercel dashboard

### 6.2 Database Backups

Set up automatic database backups in Railway:
1. Go to your MySQL service in Railway
2. Enable automatic backups
3. Configure backup retention period

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure frontend URL is added to CORS origins
   - Check that credentials are properly configured

2. **Database Connection Issues**:
   - Verify environment variables in Railway
   - Check database connection string format

3. **Session Issues**:
   - Ensure session cookies are configured for cross-origin
   - Check HTTPS/HTTP configuration

4. **API Endpoint Not Found**:
   - Verify API_BASE_URL in frontend config
   - Check that backend routes are properly defined

### Debug Commands

```bash
# Check Railway logs
railway logs

# Check Vercel deployment logs
vercel logs

# Test backend endpoints
curl https://your-app-name.railway.app/exercises

# Test frontend build
vercel dev
```

## 🎉 Success!

Your TechLearn application should now be live:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-app-name.railway.app`

## 📝 Next Steps

1. **Custom Domain**: Configure custom domain in Vercel
2. **SSL Certificate**: Ensure HTTPS is properly configured
3. **Performance Monitoring**: Set up analytics and monitoring
4. **Backup Strategy**: Implement regular database backups
5. **CI/CD Pipeline**: Set up automatic deployments on code changes

---

**Need Help?** Check the troubleshooting section or create an issue in the repository.
