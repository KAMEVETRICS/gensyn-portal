# 🚀 Deploy to Railway - Simple Step-by-Step Guide

## ✅ Pre-Deployment: Update Database (Do This First!)

Your app currently uses SQLite. Railway needs PostgreSQL. Let's fix this:

### Step 1: Update Prisma Schema

1. Open `prisma/schema.prisma`
2. Find this section (around line 8-11):
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

3. Change it to:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. Save the file

### Step 2: Commit and Push to GitHub

```bash
git add prisma/schema.prisma
git commit -m "Update to PostgreSQL for Railway"
git push
```

---

## 🚂 Railway Deployment Steps

### Step 1: Sign Up for Railway

1. Go to **[railway.app](https://railway.app)**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (click "Login with GitHub")
4. Authorize Railway to access your GitHub account

### Step 2: Create New Project

1. After logging in, you'll see the Railway dashboard
2. Click the **"New Project"** button (usually a big button in the center or top-right)
3. Select **"Deploy from GitHub repo"** or **"GitHub Repo"**
4. You'll see a list of your GitHub repositories
5. Find and click on **"gensyn-art-portal"** (or whatever you named your repo)
6. Railway will start deploying automatically! ⚡

**Wait for the first deployment to finish** (you'll see logs in the Railway dashboard)

### Step 3: Add PostgreSQL Database

**Important:** Your app needs a database. Here's how to add it:

1. In your Railway project dashboard, look for:
   - A **"+"** button (top-right corner)
   - Or **"New"** button
   - Or **"Add Service"** button
   - Or look in the left sidebar for **"Services"** with a **"+"** icon

2. Click it and you'll see options like:
   - **"Database"**
   - **"PostgreSQL"**
   - **"Add Resource"**

3. Click **"PostgreSQL"** or **"Database"**

4. Railway will automatically:
   - Create a PostgreSQL database
   - Add `DATABASE_URL` environment variable to your app
   - Connect everything together

**✅ You'll see a new service appear in your project (the database)**

### Step 4: Set JWT_SECRET Environment Variable

1. In Railway, click on your **web service** (the one with your app name, NOT the database)
2. Click on the **"Variables"** tab (at the top)
3. Click **"+ New Variable"** or **"Raw Editor"**
4. Add this:
   - **Name:** `JWT_SECRET`
   - **Value:** Generate a secret (see below)

**Generate JWT_SECRET:**

**Option 1 - PowerShell (Windows):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Option 2 - Online Generator:**
- Go to: https://generate-secret.vercel.app/32
- Copy the generated string

**Option 3 - Manual:**
- Create any long random string (at least 32 characters)
- Example: `my-super-secret-jwt-key-12345678901234567890`

5. Paste the value and click **"Add"** or **"Save"**

### Step 5: Redeploy Your App

After adding the database and JWT_SECRET:

1. Railway should automatically redeploy
2. If not, go to your web service
3. Click **"Deployments"** tab
4. Click **"Redeploy"** or **"Deploy"**

**Watch the logs** - you should see:
- ✅ Installing dependencies
- ✅ Generating Prisma client
- ✅ Running migrations
- ✅ Building Next.js app
- ✅ Starting server

### Step 6: Initialize Database (First Time)

After deployment, you need to create the database tables:

**Option A: Using Railway Dashboard**

1. Go to your **web service**
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Check the logs - if you see migration errors, continue to Option B

**Option B: Using Railway CLI (Recommended)**

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```
   (This will open your browser to authorize)

3. Link to your project:
   ```bash
   railway link
   ```
   (Select your project from the list)

4. Run database migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

5. If that doesn't work, try:
   ```bash
   railway run npx prisma db push
   ```

### Step 7: Get Your Live URL

1. In Railway, click on your **web service**
2. Go to **"Settings"** tab
3. Scroll to **"Domains"** section
4. You'll see a URL like: `https://gensyn-art-portal-production.up.railway.app`
5. Click on it or copy it - **Your app is live!** 🎉

---

## 🎯 Quick Checklist

- [ ] Updated `prisma/schema.prisma` to PostgreSQL
- [ ] Committed and pushed to GitHub
- [ ] Signed up for Railway
- [ ] Created new project from GitHub repo
- [ ] Added PostgreSQL database
- [ ] Set `JWT_SECRET` environment variable
- [ ] Redeployed app
- [ ] Ran database migrations
- [ ] Got live URL

---

## 🔧 Troubleshooting

### "Build Failed" Error

**Problem:** Prisma errors during build
**Solution:** Make sure you updated `prisma/schema.prisma` to PostgreSQL and pushed to GitHub

### "Database Connection Failed"

**Problem:** App can't connect to database
**Solution:** 
- Make sure you added PostgreSQL database
- Check that `DATABASE_URL` is set (Railway auto-sets this)
- Wait a few minutes for database to fully initialize

### "Cannot find module" Error

**Problem:** Missing dependencies
**Solution:** Railway should auto-install. Check build logs for errors.

### Can't Find Database Button

**Where to look:**
- Top-right corner: **"+"** or **"New"** button
- Left sidebar: **"Services"** section with **"+"** icon
- Main dashboard: **"Add Service"** or **"Provision"** button
- Sometimes it's in the **"Settings"** tab

### Images Disappear After Redeploy

**Problem:** Railway uses temporary storage by default
**Solution:** Set up persistent storage (see below)

---

## 💾 Set Up Persistent Storage for Images

Railway's default storage is temporary. To keep uploaded images:

1. In Railway, go to your **web service**
2. Click **"Settings"** tab
3. Scroll to **"Volumes"** section
4. Click **"Add Volume"**
5. Set:
   - **Mount Path:** `/app/public/uploads`
   - **Size:** Start with 1GB (you can increase later)
6. Click **"Add"**
7. Redeploy your app

---

## 🎨 Make Yourself Admin

After your app is live:

1. Sign up on your live site
2. Connect to Railway database using Railway CLI:
   ```bash
   railway run npx prisma studio
   ```
3. In Prisma Studio (opens in browser):
   - Find your user
   - Edit the `isAdmin` field
   - Set it to `true`
   - Save

Or use SQL:
```bash
railway run npx prisma db execute --stdin
```
Then paste:
```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

---

## 📊 Railway Pricing

- **Free Tier:** $5 credit/month (usually enough for small apps)
- **Hobby Plan:** $5/month if you exceed free credits
- **Storage:** ~$0.000463/GB-hour for volumes

---

## ✅ You're Done!

Your app should now be live at your Railway URL!

**Next Steps:**
- Test your app
- Make yourself admin
- Set up persistent storage for images
- Configure custom domain (optional)

---

## 🆘 Need Help?

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Check deployment logs** in Railway dashboard for errors

