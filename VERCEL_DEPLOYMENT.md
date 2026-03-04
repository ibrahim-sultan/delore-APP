# Vercel Deployment Guide for Delore App

This guide walks you through deploying your fullstack React + Node.js + Express + MongoDB application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket Repository**: Your code should be in a Git repository
3. **MongoDB Database**: You'll need a MongoDB instance (MongoDB Atlas recommended)

## Deployment Steps

### Step 1: Prepare Your MongoDB

If you don't have MongoDB already, create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas):

1. Create a free account
2. Create a free cluster (选择免费选项)
3. Create a database user with username/password
4. Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/deloredb?retryWrites=true&w=majority`

### Step 2: Generate JWT Secret

Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3: Push Code to Git

```bash
git init
git add .
git commit -m "Configure for Vercel deployment"
# Create a repository on GitHub/GitLab and push
git remote add origin https://github.com/yourusername/deloreapp.git
git push -u origin main
```

### Step 4: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure the project:

   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

### Step 5: Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Your generated JWT secret |
| `EMAIL_USER` | Your email (optional) |
| `EMAIL_PASS` | Your email app password (optional) |
| `NODE_ENV` | `production` |

### Step 6: Deploy

Click "Deploy" and wait for the build to complete.

## Important Notes

### 1. File Uploads
For production, consider using cloud storage (AWS S3, Cloudinary, etc.) for file uploads since Vercel has ephemeral filesystem storage.

### 2. Cold Starts
Serverless functions may have cold start delays. Consider upgrading to Vercel Pro for faster responses.

### 3. MongoDB Connection
The API is configured to maintain a persistent connection. If you experience connection issues, the connection will retry automatically.

### 4. Custom Domain (Optional)

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed by Vercel

## Troubleshooting

### "MongoDB connection error"
- Verify your `MONGODB_URI` is correct
- Ensure your IP is whitelisted in MongoDB Atlas (Network Access)
- Check that the database user credentials are correct

### "Function timeout"
- Increase the function timeout in Project Settings → Functions → Timeout (max 60 seconds on free tier)

### "404 on refresh"
- Ensure the `vercel.json` routes are configured correctly
- The SPA fallback should handle client-side routing

## Project Structure

```
deloreApp/
├── api/                 # Vercel serverless API
│   └── index.js        # Express app entry point
├── client/             # React frontend
│   ├── src/            # React source code
│   └── build/          # Production build (generated)
├── server/             # Original Node.js server (for local dev)
│   ├── routes/         # API routes
│   ├── models/         # Mongoose models
│   └── uploads/        # File uploads
├── vercel.json         # Vercel configuration
├── package.json        # Root package.json
└── .env.example        # Environment variables template
```

## After Deployment

Once deployed, access your app at:
- Frontend: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api`

Create your first admin user by visiting:
`https://your-project.vercel.app/api/auth/create-admin`

Default credentials:
- Email: `admin@delore.com`
- Password: `delore@123`

**Important**: Change the admin password immediately after first login!
