# Railway Build Fix

## Problem
The build was failing because `prisma migrate deploy` requires `DATABASE_URL`, which isn't available during the build phase on Railway.

## Solution
I've updated the configuration to:
1. **Remove migrations from build** - Build now only generates Prisma client and builds Next.js
2. **Run migrations at startup** - Migrations run before the app starts, when `DATABASE_URL` is available

## Changes Made

### `railway.json`
- Removed `npx prisma migrate deploy` from build command
- Updated start command to use `npm run start:prod` which runs migrations first

### `package.json`
- Removed `prisma migrate deploy` from build script
- Added `migrate` script for manual migrations
- Added `start:prod` script that runs migrations then starts the app

## Next Steps

1. **Commit and push these changes:**
   ```bash
   git add railway.json package.json
   git commit -m "Fix Railway build: move migrations to startup"
   git push
   ```

2. **Railway will automatically redeploy** when you push

3. **After first deployment**, the database tables will be created automatically when the app starts

4. **If migrations fail on first start**, you can manually run them:
   - Use Railway CLI: `railway run npm run migrate`
   - Or use Prisma Studio: `railway run npx prisma studio`

## How It Works Now

1. **Build Phase:**
   - Installs dependencies
   - Generates Prisma client (doesn't need database)
   - Builds Next.js app

2. **Start Phase:**
   - Runs database migrations (DATABASE_URL is now available)
   - Starts the Next.js server

This ensures migrations run when the database connection is available!

