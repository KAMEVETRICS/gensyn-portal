# Railway Deployment Guide - Step by Step

## Prerequisites

✅ Your code is on GitHub (you've already done this!)

## Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (recommended - easiest way)
4. Authorize Railway to access your GitHub account

## Step 2: Create New Project

1. In Railway dashboard, look for:
   - **"New Project"** button (usually top-right or center)
   - Or **"Start New Project"** button
   - Or a **"+"** icon/button
2. Click it and select **"Deploy from GitHub repo"** or **"GitHub Repo"**
3. You'll see a list of your GitHub repositories
4. Find and select **"gensyn-art-portal"** (or whatever you named it)
5. Click on it

**Alternative:** If you see **"Deploy Template"** or **"Browse Templates"**, you can also:
- Click **"Empty Project"** first
- Then go to **"Settings"** → **"Connect GitHub"**
- Select your repository

Railway will automatically:
- Clone your repository
- Detect it's a Next.js app
- Start building

## Step 3: Add PostgreSQL Database

**Important:** Your app currently uses SQLite, but Railway works best with PostgreSQL.

### Method 1: Using the Template Button

1. In your Railway project dashboard, look for:
   - A **"New"** button (top right or in the project view)
   - Or a **"Template"** button
   - Or a **"+"** icon/button
2. Click it and select **"Database"** or **"PostgreSQL"**
3. Railway will automatically:
   - Create a PostgreSQL database
   - Add `DATABASE_URL` environment variable to your app
   - Connect everything

### Method 2: Using the Project Menu

1. In your Railway project, look at the left sidebar or top menu
2. Find **"Services"** or **"Resources"** section
3. Look for a button that says:
   - **"Add Service"**
   - **"New Service"**
   - **"Provision"**
   - Or a **"+"** icon next to Services
4. Click it and select **"PostgreSQL"** or **"Database"**

### Method 3: Direct Database Provision

1. In your project dashboard, look for a section that says **"Add Service"** or **"Provision"**
2. You might see options like:
   - **"PostgreSQL"**
   - **"Database"**
   - **"Add Resource"**
3. Click on **"PostgreSQL"** directly

### Method 4: If You Still Can't Find It

1. Make sure you're inside a **project** (not the main dashboard)
2. Look for any button with a **"+"** symbol
3. Or try clicking on your **web service** first, then look for **"Add Database"** option
4. Sometimes it's in the **"Settings"** or **"Resources"** tab

**What it looks like:**
- The button might be labeled: "New", "Add", "Provision", "+", or have a database icon
- It's usually in the top-right area of the project view, or in a sidebar

**After adding PostgreSQL:**
Railway will automatically:
- Create a PostgreSQL database
- Add `DATABASE_URL` environment variable to your app
- Connect everything

## Step 4: Update Prisma Schema for PostgreSQL

Before deploying, you need to update your Prisma schema:

1. **Locally**, edit `prisma/schema.prisma`
2. Change this:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```
   
   To this:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Commit and push to GitHub:**
   ```bash
   git add prisma/schema.prisma
   git commit -m "Update to PostgreSQL for Railway deployment"
   git push
   ```

Railway will automatically redeploy when you push!

## Step 5: Set Environment Variables

1. In Railway, click on your **web service** (not the database)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add:
   - **Name:** `JWT_SECRET`
   - **Value:** Generate a strong secret (see below)
   - Click **"Add"**

### Generate JWT_SECRET:

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Or use an online generator:**
- Go to: https://generate-secret.vercel.app/32
- Copy the generated string

**Or manually create a long random string** (at least 32 characters)

## Step 6: Configure Build Settings

Railway usually auto-detects Next.js, but verify:

1. Click on your **web service**
2. Go to **"Settings"** tab
3. Check **"Build Command"** - should be: `npm install && npm run db:generate && npx prisma migrate deploy && npm run build`
4. Check **"Start Command"** - should be: `npm start`

If not set correctly, update them.

## Step 7: Deploy!

1. Railway will automatically deploy when you:
   - Push code to GitHub
   - Or click **"Deploy"** button

2. Watch the **"Deploy Logs"** to see progress:
   - Installing dependencies
   - Generating Prisma client
   - Running migrations
   - Building Next.js app
   - Starting server

3. Wait for **"Deploy successful"** message

## Step 8: Get Your URL

1. Once deployed, Railway gives you a URL like:
   - `https://gensyn-art-portal-production.up.railway.app`

2. Click on the URL or the **"Generate Domain"** button

3. Your app is now live! 🎉

## Step 9: Set Up Database (First Time)

After first deployment, you need to initialize the database:

### Option A: Using Railway CLI (Recommended)

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Option B: Using Railway Dashboard

1. In Railway, go to your **web service**
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Go to **"Logs"**
5. You should see Prisma migrations running automatically

If migrations don't run automatically, you can add this to your build command:
```
npm install && npm run db:generate && npx prisma migrate deploy && npm run build
```

## Step 10: Make Yourself Admin

After deployment:

1. Sign up on your live site
2. Connect to your Railway database:
   - Use Railway's database connection string
   - Or use Prisma Studio: `railway run npx prisma studio`

3. Update your user:
   ```sql
   UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
   ```

Or use Prisma Studio to edit your user and set `isAdmin = true`

## Troubleshooting

### Build Fails

**Error: "Prisma Client not generated"**
- Solution: Make sure build command includes `npm run db:generate`

**Error: "Database connection failed"**
- Solution: Check that `DATABASE_URL` is set (Railway auto-sets this from PostgreSQL service)

### App Crashes on Start

**Error: "Cannot find module"**
- Solution: Make sure all dependencies are in `package.json`

**Error: "Database schema mismatch"**
- Solution: Run `npx prisma migrate deploy` via Railway CLI

### Images Not Uploading

**Problem: Uploads disappear after redeploy**
- **Solution:** Railway uses ephemeral storage. You need persistent storage:
  1. In Railway, go to your service
  2. Click **"Settings"**
  3. Scroll to **"Volumes"**
  4. Click **"Add Volume"**
  5. Mount path: `/app/public/uploads`
  6. Size: Choose based on your needs (start with 1GB)

### Can't Access Admin Panel

- Make sure you've set `isAdmin = true` in the database
- Check that `JWT_SECRET` is set correctly
- Try logging out and back in

## Railway Pricing

- **Free Tier:** $5 credit/month
- **Hobby Plan:** $5/month (if you exceed free credits)
- **Pro Plan:** $20/month (for teams)

**Storage:** 
- Database: Included
- File uploads: Use volumes (charged per GB)

## Custom Domain (Optional)

1. In Railway, go to your service
2. Click **"Settings"** → **"Domains"**
3. Click **"Custom Domain"**
4. Enter your domain name
5. Follow DNS instructions Railway provides

## Monitoring

- **Logs:** View real-time logs in Railway dashboard
- **Metrics:** See CPU, memory, and network usage
- **Deployments:** Track all deployments and rollback if needed

## Next Steps

✅ Your app is live!
✅ Set up persistent storage for uploads (volumes)
✅ Configure custom domain (optional)
✅ Set up monitoring and alerts (optional)

## Quick Reference Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run commands in Railway environment
railway run npx prisma studio
railway run npx prisma migrate deploy

# View logs
railway logs
```

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check deployment logs in Railway dashboard


