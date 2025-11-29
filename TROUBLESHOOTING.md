# Troubleshooting Guide

## Error: Cannot upload images or create folders

If you're getting errors when trying to upload images or create folders, follow these steps:

### Step 1: Stop the Development Server
If your dev server is running, stop it first (Ctrl+C in the terminal).

### Step 2: Regenerate Prisma Client
```bash
npm run db:generate
```

### Step 3: Push Database Schema (if needed)
```bash
npm run db:push
```

### Step 4: Restart Development Server
```bash
npm run dev
```

## Common Errors

### "Table 'Folder' does not exist"
**Solution:** Run `npm run db:push` to update your database schema.

### "Prisma Client not generated"
**Solution:** Run `npm run db:generate` to regenerate the Prisma client.

### "EPERM: operation not permitted"
**Solution:** This happens when the dev server is running. Stop the server, run the commands, then restart.

### "Unauthorized" error
**Solution:** Make sure you're logged in. Try logging out and logging back in.

## Database Reset (if needed)

If you need to completely reset the database:

1. Stop the dev server
2. Delete `prisma/dev.db` and `prisma/dev.db-journal`
3. Run `npm run db:push`
4. Restart the dev server

**Warning:** This will delete all your data!

