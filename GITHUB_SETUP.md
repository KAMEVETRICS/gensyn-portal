# GitHub Setup Guide

## Quick Steps to Upload to GitHub

### 1. Initialize Git (if not already done)

```bash
git init
```

### 2. Add All Files

```bash
git add .
```

### 3. Create Initial Commit

```bash
git commit -m "Initial commit: Gensyn Art Portal"
```

### 4. Create Repository on GitHub

1. Go to [github.com](https://github.com)
2. Click the "+" icon → "New repository"
3. Name it: `gensyn-art-portal` (or any name you prefer)
4. **Don't** initialize with README (you already have one)
5. Click "Create repository"

### 5. Connect and Push

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/gensyn-art-portal.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### 6. Verify

Check your GitHub repository - all files should be there (except those in `.gitignore`).

## What Gets Uploaded

✅ **Included:**
- All source code
- Configuration files
- Documentation
- Package files

❌ **Excluded (by .gitignore):**
- `node_modules/` - Dependencies
- `.env` - Environment variables (secrets)
- `prisma/dev.db` - Database file
- `public/uploads/*` - Uploaded images
- `.next/` - Build files

## Important Notes

1. **Never commit `.env` files** - They contain secrets
2. **Database file is excluded** - You'll recreate it on the hosting platform
3. **Uploads are excluded** - They'll be stored on your hosting platform
4. **Use `.env.example`** - Shows what variables are needed (without secrets)

## Next Steps

After pushing to GitHub:
1. Choose a hosting platform (see [DEPLOYMENT.md](./DEPLOYMENT.md))
2. Connect your GitHub repository
3. Deploy!

