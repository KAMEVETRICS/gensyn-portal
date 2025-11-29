# Gensyn Wallpapers - Art Gallery Platform

A beautiful web platform where creators can upload their artwork and visitors can browse freely without signing up.

## Features

- 🎨 **Public Gallery**: Browse all artwork without needing to sign up
- 👤 **Creator Accounts**: Sign up and create your creator profile
- 📤 **Easy Uploads**: Upload artwork with title and description
- 🔐 **Secure Authentication**: Password-protected creator accounts
- 📱 **Responsive Design**: Works beautifully on all devices
- 🗄️ **Database**: SQLite database (automatically managed by Prisma)

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe code
- **Prisma** - Database ORM (works with SQLite)
- **Tailwind CSS** - Modern styling
- **JWT** - Secure authentication

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up the Database

The database will be automatically created when you run the app. First, generate the Prisma client:

```bash
npm run db:generate
```

Then push the schema to create the database:

```bash
npm run db:push
```

### 3. Set Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-super-secret-key-change-this-in-production
```

If you don't create this file, a default secret will be used (not recommended for production).

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Database

The database is automatically managed by Prisma. It uses SQLite, which means:
- No external database server needed
- Database file is stored in `prisma/dev.db`
- All tables are created automatically

**Database Tables:**
- `User` - Stores creator account information
- `Artwork` - Stores uploaded artwork metadata

### File Uploads

- Images are stored in `public/uploads/`
- Supported formats: JPEG, PNG, GIF, WebP
- Maximum file size: 10MB
- Files are automatically given unique names to prevent conflicts

### Authentication

- Creators sign up with email and password
- Passwords are securely hashed using bcrypt
- JWT tokens are used for session management
- Tokens are stored in HTTP-only cookies

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── artworks/     # Artwork endpoints
│   │   └── upload/       # File upload endpoint
│   ├── portal/           # Creator portal page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── page.tsx          # Home/gallery page
├── lib/                  # Utility functions
│   ├── prisma.ts         # Database client
│   ├── auth.ts           # Authentication helpers
│   └── jwt.ts            # JWT utilities
├── prisma/
│   └── schema.prisma     # Database schema
└── public/
    └── uploads/          # Uploaded images
```

## Usage

1. **As a Visitor:**
   - Visit the homepage to browse all artwork
   - No signup required to view artwork

2. **As a Creator:**
   - Click "Sign Up" to create an account
   - After signing up, you'll be logged in automatically
   - Go to "My Portal" to upload artwork
   - Fill in the title, optional description, and select an image
   - Click "Upload Artwork"
   - Your artwork will appear in both your portal and the public gallery

## Database Management

### View Database in Browser

```bash
npm run db:studio
```

This opens Prisma Studio where you can view and edit database records.

### Reset Database

To reset the database, delete `prisma/dev.db` and run:

```bash
npm run db:push
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options:

**Recommended: Railway** (Best for storage)
- ✅ Persistent storage for uploads
- ✅ PostgreSQL included
- ✅ Easy GitHub integration
- [Deploy on Railway](https://railway.app)

**Alternative: Render** (Good free tier)
- ✅ Free tier available
- ✅ Persistent disks
- [Deploy on Render](https://render.com)

### Before Deploying:

1. Set a strong `JWT_SECRET` in your environment variables
2. Migrate from SQLite to PostgreSQL (see DEPLOYMENT.md)
3. Consider cloud storage (AWS S3, Cloudinary) for unlimited image storage
4. Configure proper CORS and security headers

## Troubleshooting

**Database errors:**
- Make sure you've run `npm run db:generate` and `npm run db:push`
- Check that `prisma/dev.db` file exists

**Upload errors:**
- Make sure `public/uploads/` directory exists
- Check file size (max 10MB)
- Verify file type is an image

**Authentication errors:**
- Clear browser cookies and try again
- Make sure you're using the correct email/password

## License

This project is open source and available for personal and commercial use.

