# Admin Panel Setup Guide

## Making Yourself an Admin

To make your account an admin, you have two options:

### Option 1: Using Prisma Studio (Recommended)

1. Run Prisma Studio:
   ```bash
   npm run db:studio
   ```

2. Open the `User` table
3. Find your user account
4. Edit the `isAdmin` field and set it to `true`
5. Save the changes

### Option 2: Using SQL (Direct Database)

1. Open the database file: `prisma/dev.db` with a SQLite browser
2. Run this SQL:
   ```sql
   UPDATE User SET isAdmin = 1 WHERE email = 'your-email@example.com';
   ```

### Option 3: Using the Script

1. Make sure you have `ts-node` installed:
   ```bash
   npm install -D ts-node
   ```

2. Run the script:
   ```bash
   npx ts-node scripts/make-admin.ts your-email@example.com
   ```

## Admin Panel Features

Once you're an admin, you can:

1. **View All Users** - See all registered creators
2. **Pause/Unpause Users** - Prevent users from posting new content
3. **Delete User Profiles** - Remove users and all their content
4. **Make/Remove Admins** - Promote or demote users to admin status
5. **View All Artworks** - See all uploaded artworks across the platform
6. **Delete Any Artwork** - Remove any artwork from the platform

## Accessing the Admin Panel

1. Log in with your admin account
2. Click the "Admin" link in the navigation bar
3. You'll see the admin panel with two tabs:
   - **Users**: Manage all user accounts
   - **Artworks**: View and delete any artwork

## Security Notes

- Only users with `isAdmin: true` can access the admin panel
- Admins cannot delete their own account
- Admins cannot remove their own admin status
- Paused users cannot upload new artworks or create folders
- All admin actions are logged in the console

