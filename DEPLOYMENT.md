# 🚀 Deployment Checklist

## ✅ Environment Configuration

### Backend (.env)

```
PORT=3001
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
CLIENT_URL=https://your-frontend-domain.com
GCP_PROJECT_ID=your_gcp_project_id
GCP_PRIVATE_KEY_ID=xxx
GCP_PRIVATE_KEY=xxx (must include newlines: key.replace(/\\n/g, "\n"))
GCP_CLIENT_EMAIL=xxx
GCP_CLIENT_ID=xxx
GCP_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GCP_TOKEN_URI=https://oauth2.googleapis.com/token
GCP_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GCP_CLIENT_X509_CERT_URL=xxx
GCP_UNIVERSE_DOMAIN=googleapis.com
IMAGEKIT_PUBLIC_KEY=xxx
IMAGEKIT_PRIVATE_KEY=xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### Frontend (.env)

```
VITE_API_URL=https://your-backend-domain.com
VITE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_PROJECT_ID=your_firebase_project_id
VITE_STORAGE_BUCKET=your-project.appspot.com
VITE_MESSAGING_SENDER_ID=xxx
VITE_APP_ID=xxx
VITE_MEASUREMENT_ID=xxx
```

---

## 📋 Pre-Deployment Steps

### Backend

- [ ] Verify `.env` file contains all required variables
- [ ] Test MongoDB connection: `MONGODB_URI` is valid
- [ ] Test Redis connection: `REDIS_URL` is valid
- [ ] Verify `CLIENT_URL` matches your frontend domain
- [ ] Test Firebase Admin SDK credentials are correct
- [ ] Test ImageKit credentials
- [ ] Run `npm install` to ensure no vulnerabilities
- [ ] Build check: No TypeScript/JavaScript errors
- [ ] Test locally with production env vars

### Frontend

- [ ] Verify `.env` file contains all required variables (VITE\_\* prefix)
- [ ] `VITE_API_URL` points to production backend
- [ ] Firebase credentials are correct
- [ ] Run build: `npm run build` produces optimized bundle
- [ ] No console errors or warnings in build output
- [ ] Service worker can be registered properly

---

## 🔐 Security Checklist

- [ ] ✅ No hardcoded localhost URLs in code
- [ ] ✅ All URLs use environment variables
- [ ] ✅ Firebase credentials only in .env (never in code)
- [ ] ✅ CORS configured for production domain only
- [ ] ✅ Redis URL requires authentication
- [ ] ✅ MongoDB connection string secured
- [ ] ✅ .env files in .gitignore (never commit secrets)
- [ ] Consider adding HTTPS only cookies in production

---

## 🌐 Deployment Platforms

### Option 1: Heroku / Railway

```bash
Backend: Deploy from backend/ folder
Frontend: Deploy from frontend/ folder with build command: npm run build
```

### Option 2: Docker

Create Dockerfile for backend and frontend separately.

### Option 3: Traditional Hosting

- Frontend: Build → Upload dist/ folder to CDN/static hosting
- Backend: Node.js hosting (Render, Railway, Heroku, AWS EC2)

---

## ✅ Post-Deployment Tests

- [ ] Frontend loads without errors
- [ ] Login/Signup works
- [ ] Messages send and receive
- [ ] Real-time updates via WebSocket (online status, typing indicator)
- [ ] Profile picture upload works
- [ ] Notifications are delivered
- [ ] No CORS errors in browser console
- [ ] Service worker is registered and functional

---

## 📝 Environment Variable Reference

**See `.env.example` files in `/backend` and `/frontend` directories**

Set these securely in your deployment platform's environment variables section.
