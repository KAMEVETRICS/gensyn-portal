# Quick Fix for Login Error and Admin Access

## Issue 1: "Failed to load data" Error

This happens because the Prisma client needs to be regenerated after adding new fields (`isAdmin` and `isPaused`).

### Solution:

1. **Stop the dev server** (press `Ctrl+C` in the terminal where it's running)

2. **Regenerate Prisma client:**
   ```bash
   npm run db:generate
   ```

3. **If that fails**, use the fix script:
   ```powershell
   .\fix-prisma.ps1
   ```

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

5. **Refresh your browser** and try logging in again

## Issue 2: Admin Link Not Showing

The admin link only appears for users who have `isAdmin: true` in the database.

### To Make Yourself an Admin:

**Option 1: Using Prisma Studio (Easiest)**

1. Stop the dev server
2. Run:
   ```bash
   npm run db:studio
   ```
3. In Prisma Studio, open the `User` table
4. Find your user account (by email)
5. Click on your user row to edit
6. Find the `isAdmin` field and change it from `false` to `true`
7. Click "Save 1 change"
8. Close Prisma Studio
9. Restart your dev server
10. Log out and log back in
11. The "Admin" link should now appear in the navigation

**Option 2: Direct SQL (If you have a SQLite browser)**

1. Open `prisma/dev.db` with a SQLite browser (like DB Browser for SQLite)
2. Run this SQL (replace with your email):
   ```sql
   UPDATE User SET isAdmin = 1 WHERE email = 'your-email@example.com';
   ```
3. Save and close
4. Restart dev server
5. Log out and log back in

## After Making Yourself Admin

1. You should see the "Admin" link in the navigation bar
2. Click it to access the admin panel
3. You can now:
   - View all users
   - Pause/unpause users
   - Delete users
   - Make other users admins
   - View and delete any artwork

