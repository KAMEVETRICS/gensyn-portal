# Deployment Guide

This guide will help you deploy Gensyn Art Portal to various hosting platforms.

## Pre-Deployment Checklist

### 1. Prepare for GitHub

✅ **Your `.gitignore` is already set up correctly** - it excludes:
- Database files (`prisma/dev.db`)
- Environment variables (`.env`)
- Uploaded images
- Node modules

### 2. Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Gensyn Art Portal"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/gensyn-art-portal.git
git branch -M main
git push -u origin main
```

### 3. Environment Variables Needed

You'll need to set these in your hosting platform:
- `JWT_SECRET` - A strong random string (generate with: `openssl rand -base64 32`)
- `DATABASE_URL` - Database connection string (varies by platform)

---

## Hosting Options (Ranked by Storage Capacity)

### 🥇 **Railway** (Recommended for Storage)

**Why Railway:**
- ✅ **Persistent storage** - Your uploads won't disappear
- ✅ **Easy setup** - Connects directly to GitHub
- ✅ **Free tier** - $5 credit/month
- ✅ **PostgreSQL included** - Better than SQLite for production
- ✅ **Automatic deployments** - Deploys on every push

**Storage:** Unlimited (within reasonable limits)

**Pricing:** 
- Free: $5 credit/month
- Paid: $0.000463/GB-hour for storage

**Setup Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add PostgreSQL database (Railway will auto-add `DATABASE_URL`)
6. Add environment variable: `JWT_SECRET` (generate a strong secret)
7. Railway will auto-deploy!

**Note:** You'll need to migrate from SQLite to PostgreSQL. Railway provides a PostgreSQL database automatically.

---

### 🥈 **Render** (Great Free Tier)

**Why Render:**
- ✅ **Free tier available** - Good for getting started
- ✅ **Persistent disks** - Your uploads stay
- ✅ **PostgreSQL included** - Free tier includes database
- ✅ **Easy GitHub integration**

**Storage:** 
- Free: 512MB disk space
- Paid: $0.25/GB-month

**Pricing:**
- Free tier: Limited hours/month
- Paid: $7/month for web service + $7/month for PostgreSQL

**Setup Steps:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - **Build Command:** `npm install && npm run db:generate && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
6. Add PostgreSQL database (separate service)
7. Add environment variables:
   - `JWT_SECRET`
   - `DATABASE_URL` (from PostgreSQL service)
8. Deploy!

---

### 🥉 **Fly.io** (Good Storage Options)

**Why Fly.io:**
- ✅ **Persistent volumes** - Dedicated storage
- ✅ **Global edge network** - Fast worldwide
- ✅ **Good free tier**

**Storage:** 
- Free: 3GB volume
- Paid: $0.15/GB-month

**Pricing:**
- Free: 3 shared-cpu VMs, 3GB volumes
- Paid: Pay as you go

**Setup Steps:**
1. Install Fly CLI: `npm install -g @fly/cli`
2. Sign up: `fly auth signup`
3. Initialize: `fly launch` (in your project directory)
4. Add PostgreSQL: `fly postgres create`
5. Attach database: `fly postgres attach <db-name> -a <app-name>`
6. Set `JWT_SECRET` in secrets: `fly secrets set JWT_SECRET=your-secret`
7. Deploy: `fly deploy`

---

### **DigitalOcean App Platform**

**Why DigitalOcean:**
- ✅ **Good storage options**
- ✅ **PostgreSQL available**
- ✅ **Simple pricing**

**Storage:** 
- Basic: 1GB included
- Professional: 10GB+ available

**Pricing:** $5-12/month

**Setup Steps:**
1. Go to [digitalocean.com](https://www.digitalocean.com)
2. Create App → Connect GitHub
3. Select repository
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

---

### **Vercel** (Easy but Limited Storage)

**Why Vercel:**
- ✅ **Easiest Next.js deployment**
- ✅ **Free tier**
- ❌ **No persistent storage** - Uploads will be lost on redeploy

**Storage:** None (ephemeral)

**Note:** You'd need to use external storage (AWS S3, Cloudinary) with Vercel.

**If using Vercel:**
- Use Cloudinary for image storage (free tier: 25GB)
- Or AWS S3 for unlimited storage

---

## Migration from SQLite to PostgreSQL

Since most hosting platforms use PostgreSQL, you'll need to migrate:

### Option 1: Use Prisma Migrate (Recommended)

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Create migration:
```bash
npx prisma migrate dev --name init
```

3. Deploy migration in production:
```bash
npx prisma migrate deploy
```

### Option 2: Keep SQLite (Limited Platforms)

Some platforms support SQLite with persistent storage:
- Railway (with volume)
- Fly.io (with volume)
- Self-hosted VPS

---

## Recommended Setup: Railway + PostgreSQL

**Best for:** Maximum storage, easy setup, production-ready

### Steps:

1. **Sign up at Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**
   - In your project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway automatically sets `DATABASE_URL`

4. **Set Environment Variables**
   - In your service settings, go to "Variables"
   - Add: `JWT_SECRET` (generate with: `openssl rand -base64 32`)

5. **Update Prisma Schema**
   - Change `provider = "sqlite"` to `provider = "postgresql"`
   - Commit and push to GitHub

6. **Deploy**
   - Railway auto-deploys on push
   - Or click "Deploy" manually

7. **Run Migrations**
   - In Railway, open your service
   - Go to "Deploy Logs"
   - Add build command: `npm run db:generate && npx prisma migrate deploy`

---

## Environment Variables Reference

Create these in your hosting platform:

```env
JWT_SECRET=your-strong-random-secret-here
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
```

**Generate JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## Post-Deployment

### 1. Make Yourself Admin

After deployment, you'll need to make your account admin:

1. Connect to your database (Railway provides a connection string)
2. Use Prisma Studio: `npx prisma studio`
3. Or use SQL: `UPDATE User SET isAdmin = true WHERE email = 'your-email@example.com';`

### 2. Test Everything

- ✅ Sign up
- ✅ Upload artwork
- ✅ Create folders
- ✅ Access admin panel
- ✅ Test image uploads

### 3. Set Up Custom Domain (Optional)

Most platforms allow custom domains:
- Railway: Settings → Domains
- Render: Settings → Custom Domain
- Fly.io: `fly domains add yourdomain.com`

---

## Storage Considerations

### Current Setup (Local Storage)
- Images stored in `public/uploads/`
- **Problem:** Lost on redeploy (ephemeral storage)

### Solutions:

**Option 1: Persistent Volumes** (Railway, Fly.io)
- Your uploads directory persists
- No code changes needed
- Limited by volume size

**Option 2: Cloud Storage** (Recommended for Scale)
- AWS S3, Cloudinary, or similar
- Unlimited storage
- Requires code changes to upload API

**Option 3: External Database for Files**
- Store file metadata in database
- Use external file storage
- More complex setup

---

## Quick Comparison

| Platform | Free Tier | Storage | Ease | Best For |
|----------|-----------|---------|------|----------|
| **Railway** | $5 credit | Unlimited* | ⭐⭐⭐⭐⭐ | Best overall |
| **Render** | Limited | 512MB free | ⭐⭐⭐⭐ | Good free option |
| **Fly.io** | 3GB | 3GB free | ⭐⭐⭐ | Global edge |
| **DigitalOcean** | No | 1GB+ | ⭐⭐⭐⭐ | Simple pricing |
| **Vercel** | Yes | None | ⭐⭐⭐⭐⭐ | Need external storage |

*Within reasonable limits

---

## Need Help?

- Check platform-specific documentation
- Review error logs in hosting dashboard
- Test locally first with PostgreSQL
- Use Prisma Studio to verify database

---

## Next Steps

1. ✅ Choose a hosting platform (Railway recommended)
2. ✅ Push code to GitHub
3. ✅ Set up database (PostgreSQL)
4. ✅ Configure environment variables
5. ✅ Deploy!
6. ✅ Make yourself admin
7. ✅ Start uploading art! 🎨

