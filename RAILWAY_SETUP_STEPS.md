# Railway Setup - Step by Step

## Step 1: Add PostgreSQL Database

1. **Go to your Railway project dashboard**
   - You should see your project with the web service running

2. **Look for the "+" button or "New" button**
   - It's usually in the **top-right corner** of your project
   - Or look for **"Add Service"** or **"Provision"** button
   - Sometimes it's in the left sidebar next to "Services"

3. **Click it and select "PostgreSQL"**
   - You'll see options like: "Database", "PostgreSQL", "Add Resource"
   - Click on **"PostgreSQL"**

4. **Railway will automatically:**
   - Create a PostgreSQL database
   - Add `DATABASE_URL` environment variable to your web service
   - Connect everything

5. **Wait for the database to be created** (takes about 30 seconds)

---

## Step 2: Set JWT_SECRET Environment Variable

1. **Click on your web service** (the one with your app name, NOT the database)

2. **Go to the "Variables" tab** (at the top of the page)

3. **Click "+ New Variable"** or **"Raw Editor"**

4. **Add the variable:**
   - **Name:** `JWT_SECRET`
   - **Value:** Generate a secret (see below)

5. **Click "Add" or "Save"**

### Generate JWT_SECRET:

**Option 1 - Online Generator (Easiest):**
- Go to: https://generate-secret.vercel.app/32
- Copy the generated string
- Paste it as the value

**Option 2 - PowerShell (Windows):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Option 3 - Manual:**
- Just type any long random string (at least 32 characters)
- Example: `my-super-secret-jwt-key-for-gensyn-art-portal-2024`

---

## Step 3: Redeploy Your App

After adding the database and JWT_SECRET:

1. **Go to your web service**
2. Click **"Deployments"** tab
3. Click **"Redeploy"** or **"Deploy"** button
4. Watch the logs - it should work now!

---

## Visual Guide - Where to Find Things

### Finding the "+" Button:
- **Top-right corner** of project dashboard
- **Left sidebar** - next to "Services" section
- **Main area** - "Add Service" or "Provision" card

### Finding Variables:
- Click your **web service** (not database)
- Look for **"Variables"** tab at the top
- It's usually next to "Settings", "Deployments", "Metrics"

---

## Troubleshooting

### Can't Find "+" Button?
1. Make sure you're **inside a project** (not the main Railway dashboard)
2. Look for any button with a **"+"** symbol
3. Try clicking on your **web service** first, then look for "Add Database" option
4. Sometimes it's in **"Settings"** → **"Resources"** tab

### Can't Find Variables Tab?
1. Make sure you clicked on the **web service** (your app), not the database
2. The tabs are at the **top** of the service page
3. Look for: "Overview", "Deployments", "Variables", "Settings", "Metrics"

### Still Stuck?
- Take a screenshot of your Railway dashboard
- Or describe what you see on the screen
- I can guide you more specifically!

---

## Quick Checklist

- [ ] PostgreSQL database added
- [ ] `JWT_SECRET` environment variable set
- [ ] App redeployed
- [ ] Check deployment logs for success

---

**Once both are set up, your app should deploy successfully!** 🚀

