# Separate Deployment: Frontend (Netlify) + Backend (Vercel)

## Architecture Overview

```
Browser
  ↓
Netlify CDN (React Frontend)
  ↓ (API calls to)
Vercel Serverless (Express Backend)
  ↓
MongoDB Atlas
```

---

## Part 1: Deploy Backend (Express API) to Vercel

### 1.1 Setup Vercel for Backend Only

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New"** → **"Project"**
3. Select **delore-APP** repository
4. **DO NOT import yet** — scroll to configure:
   - **Root Directory**: `./`
   - **Framework Preset**: `Other`
   - Leave Build/Output settings empty (we use `vercel.json`)

5. Click **"Environment Variables"** and add:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Your generated JWT secret |
| `FRONTEND_URL` | `https://your-netlify-domain.netlify.app` (get this after Netlify deploy) |
| `NODE_ENV` | `production` |
| `EMAIL_USER` | (optional) |
| `EMAIL_PASS` | (optional) |

6. Click **"Deploy"**

### 1.2 Verify Backend is Working

After Vercel deployment:

```bash
# Get your Vercel backend URL (e.g., https://delore-api.vercel.app)
# Test the health endpoint:
curl https://delore-api.vercel.app/api/health

# Expected response:
# {"message":"Delore server is running!"}
```

**Save your backend URL** — you'll need it for the frontend.

---

## Part 2: Deploy Frontend (React) to Netlify

### 2.1 Create Netlify Account and Connect GitHub

1. Go to [netlify.com](https://www.netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize
4. Select **delore-APP** repository

### 2.2 Configure Build Settings

When Netlify prompts for build settings:

- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `build`

**Important:** Do NOT override these if they auto-detect correctly.

### 2.3 Add Environment Variables

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add variable:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://your-vercel-backend-url.vercel.app` |

Replace `your-vercel-backend-url` with the actual Vercel domain from Step 1.2.

3. Click **"Deploy site"** (or wait for auto-deploy)

### 2.4 Verify Frontend is Working

After Netlify deployment:

1. Visit your Netlify URL (e.g., https://delore-app-abc.netlify.app)
2. ✅ Frontend should load without 404
3. ✅ Login should work (connects to your Vercel backend API)
4. ✅ All API calls should succeed

---

## Step 3: Update Backend FRONTEND_URL in Vercel

After Netlify deploys, you have your frontend URL. Update Vercel:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Update `FRONTEND_URL` to your Netlify domain:
   - Example: `https://delore-app-abc.netlify.app`
3. Click the **⋮** menu on any deployment → **Redeploy from cache**

This ensures CORS header matches your Netlify domain.

---

## Troubleshooting

### Frontend Shows API Errors (401, 403, etc.)

**Check:**
1. `REACT_APP_API_URL` in Netlify environment matches your Vercel backend
2. Verify backend `FRONTEND_URL` matches your Netlify domain
3. Browser dev console → Network tab → check CORS headers

**Fix:**
```bash
curl -H "Origin: https://your-netlify-url.netlify.app" \
     https://your-vercel-backend.vercel.app/api/health
```

### MongoDB Connection Error

**Solution:**
- Verify `MONGODB_URI` is set in Vercel environment
- Check MongoDB Atlas allows Vercel IP (Settings → Network Access → Add IP 0.0.0.0/0 for development)

### Build Fails on Netlify

**Check build logs:**
1. Netlify → Deployments → click failed deployment
2. Look for ESLint or missing dependency errors
3. Fix locally and push to GitHub — auto-redeploy

### CORS / "Access Denied"

**Verify CORS headers:**
```bash
curl -i https://your-backend.vercel.app/api/health
# Look for: Access-Control-Allow-Origin header
```

**If missing:**
- Vercel `FRONTEND_URL` not set or incorrect
- Redeploy Vercel after setting `FRONTEND_URL`

---

## File Structure After Separation

```
delore-app/
├── api/                    # Vercel deployment (backend only)
│   └── index.js
├── server/                 # Express routes/models
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── uploads/
│   └── package.json
├── client/                 # Netlify deployment (frontend only)
│   ├── public/
│   ├── src/
│   ├── build/             # Generated on Netlify
│   ├── .env.example
│   └── package.json
├── vercel.json            # Backend-only config
├── netlify.toml           # Frontend-only config
└── .env.example           # Backend env vars
```

---

## Environment Variables Quick Reference

### Backend (Vercel) - Required

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/deloredb
JWT_SECRET=<your-secret>
FRONTEND_URL=https://your-netlify-domain.netlify.app
NODE_ENV=production
```

### Frontend (Netlify) - Required

```
REACT_APP_API_URL=https://your-vercel-backend.vercel.app
```

---

## Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] Backend `/api/health` returns 200
- [ ] Frontend deployed to Netlify
- [ ] Frontend loads without 404
- [ ] Updated Vercel `FRONTEND_URL` to Netlify domain
- [ ] Redeployed Vercel after FRONTEND_URL change
- [ ] Logged in to app successfully
- [ ] API calls work (check Network tab)

---

## Performance & Scaling

✅ **Netlify** — Perfect for static React app
- Global CDN caching
- Instant deployments
- Automatic HTTPS + redirects

✅ **Vercel** — Perfect for API server
- Serverless Node.js
- Auto-scales to traffic
- Integrated MongoDB support

✅ **MongoDB Atlas** — Cloud database
- Free 512MB tier
- Auto-backups
- Global availability

This setup is production-ready and scales automatically!
