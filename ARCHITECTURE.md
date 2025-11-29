# Gallery System Architecture Documentation

## Overview

This is a comprehensive web gallery system built with Next.js 14, TypeScript, Prisma, and SQLite. Artists can upload, organize, and manage their artwork through folders/categories, while visitors can browse and discover art.

## File Structure

```
gensyn-wallpapers/
├── app/
│   ├── api/                          # API Routes
│   │   ├── artists/
│   │   │   ├── [artistId]/
│   │   │   │   └── route.ts         # GET artist profile
│   │   │   └── route.ts             # GET all artists
│   │   ├── artworks/
│   │   │   ├── [artworkId]/
│   │   │   │   └── route.ts         # GET, PUT, DELETE artwork
│   │   │   ├── my-artworks/
│   │   │   │   └── route.ts         # GET user's artworks
│   │   │   └── route.ts             # GET all, POST create
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts         # POST login
│   │   │   ├── logout/
│   │   │   │   └── route.ts         # POST logout
│   │   │   └── signup/
│   │   │       └── route.ts         # POST signup
│   │   ├── folders/
│   │   │   ├── [folderId]/
│   │   │   │   └── route.ts         # GET, PUT, DELETE folder
│   │   │   └── route.ts             # GET all, POST create
│   │   ├── upload/
│   │   │   ├── avatar/
│   │   │   │   └── route.ts         # POST avatar upload
│   │   │   └── route.ts             # POST artwork upload
│   │   └── user/
│   │       └── me/
│   │           └── route.ts         # GET current user
│   ├── artist/
│   │   └── [artistId]/
│   │       └── page.tsx             # Artist profile page
│   ├── folder/
│   │   └── [folderId]/
│   │       └── page.tsx             # Folder view page
│   ├── portal/
│   │   └── page.tsx                 # Creator dashboard
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── signup/
│   │   └── page.tsx                 # Signup page
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home/Gallery page
│   └── globals.css                  # Global styles
├── lib/
│   ├── prisma.ts                     # Prisma client
│   ├── auth.ts                      # Auth utilities
│   └── jwt.ts                       # JWT utilities
├── prisma/
│   └── schema.prisma                # Database schema
├── public/
│   └── uploads/
│       ├── avatars/                 # Profile pictures
│       └── [artworks]               # Artwork images
└── components/
    └── LogoutButton.tsx             # Logout component
```

## Database Schema

### Models

#### User (Artist)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed with bcrypt
  name      String
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  artworks  Artwork[]
  folders   Folder[]
}
```

**Fields:**
- `id`: Unique identifier
- `email`: Unique email address
- `password`: Hashed password
- `name`: Display name (required)
- `avatarUrl`: Optional profile picture URL
- `artworks`: One-to-many relationship with Artwork
- `folders`: One-to-many relationship with Folder

#### Folder (Category)
```prisma
model Folder {
  id          String   @id @default(cuid())
  name        String
  description String?
  creatorId   String
  creator     User     @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  artworks    Artwork[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Fields:**
- `id`: Unique identifier
- `name`: Folder name (required)
- `description`: Optional description
- `creatorId`: Foreign key to User
- `artworks`: One-to-many relationship with Artwork
- Cascade delete: When user is deleted, folders are deleted

#### Artwork
```prisma
model Artwork {
  id          String   @id @default(cuid())
  title       String
  description String?
  imageUrl    String
  filename    String
  creatorId   String
  creator     User     @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  folderId    String?
  folder      Folder?  @relation(fields: [folderId], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Fields:**
- `id`: Unique identifier
- `title`: Artwork title (required)
- `description`: Optional description
- `imageUrl`: Path to image file
- `filename`: Original filename
- `creatorId`: Foreign key to User (required)
- `folderId`: Foreign key to Folder (optional)
- Cascade delete: When user is deleted, artworks are deleted
- SetNull: When folder is deleted, artwork's folderId is set to null

## API Routes

### Authentication

#### POST `/api/auth/signup`
Create a new artist account.

**Request:**
```json
{
  "email": "artist@example.com",
  "password": "password123",
  "name": "Artist Name"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "artist@example.com",
    "name": "Artist Name",
    "avatarUrl": null
  },
  "message": "User created successfully"
}
```

#### POST `/api/auth/login`
Authenticate and get JWT token.

**Request:**
```json
{
  "email": "artist@example.com",
  "password": "password123"
}
```

**Response:**
- Sets HTTP-only cookie with JWT token
- Returns user object (without password)

#### POST `/api/auth/logout`
Logout and clear session cookie.

### Artists

#### GET `/api/artists`
Get all artists who have uploaded artwork.

**Response:**
```json
{
  "artists": [
    {
      "id": "...",
      "name": "Artist Name",
      "email": "artist@example.com",
      "avatarUrl": "/uploads/avatars/...",
      "_count": {
        "artworks": 10,
        "folders": 3
      }
    }
  ]
}
```

#### GET `/api/artists/[artistId]`
Get artist profile with folders.

**Response:**
```json
{
  "artist": {
    "id": "...",
    "name": "Artist Name",
    "email": "artist@example.com",
    "avatarUrl": "/uploads/avatars/...",
    "folders": [...],
    "_count": {
      "artworks": 10,
      "folders": 3
    }
  }
}
```

### Artworks

#### GET `/api/artworks`
Get all artworks (public).

**Response:**
```json
{
  "artworks": [
    {
      "id": "...",
      "title": "Artwork Title",
      "description": "Description",
      "imageUrl": "/uploads/...",
      "creator": {...}
    }
  ]
}
```

#### GET `/api/artworks/[artworkId]`
Get single artwork details.

#### POST `/api/artworks`
Create new artwork (requires auth).

**Request:**
```json
{
  "title": "Artwork Title",
  "description": "Optional description",
  "imageUrl": "/uploads/filename.jpg",
  "filename": "filename.jpg",
  "folderId": "optional-folder-id"
}
```

#### PUT `/api/artworks/[artworkId]`
Update artwork (requires auth and ownership).

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "folderId": "new-folder-id" // or null to remove from folder
}
```

#### DELETE `/api/artworks/[artworkId]`
Delete artwork (requires auth and ownership).
- Deletes file from filesystem
- Removes record from database

#### GET `/api/artworks/my-artworks`
Get current user's artworks (requires auth).

### Folders

#### GET `/api/folders`
Get folders.
- `?creatorId=me` - Current user's folders (requires auth)
- `?creatorId=userId` - Specific user's folders
- No query - All public folders

#### GET `/api/folders/[folderId]`
Get folder with artworks.

#### POST `/api/folders`
Create folder (requires auth).

**Request:**
```json
{
  "name": "Folder Name",
  "description": "Optional description"
}
```

#### PUT `/api/folders/[folderId]`
Update folder (requires auth and ownership).

**Request:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### DELETE `/api/folders/[folderId]`
Delete folder (requires auth and ownership).
- Artworks in folder have folderId set to null (SetNull)

### Upload

#### POST `/api/upload`
Upload artwork image file (requires auth).

**Request:** FormData with `file` field

**Response:**
```json
{
  "success": true,
  "filename": "timestamp-filename.jpg",
  "imageUrl": "/uploads/timestamp-filename.jpg"
}
```

#### POST `/api/upload/avatar`
Upload profile picture (requires auth).

**Request:** FormData with `file` field

**Response:**
```json
{
  "success": true,
  "avatarUrl": "/uploads/avatars/timestamp-filename.jpg"
}
```

## Frontend Pages

### `/` - Home/Gallery
- Displays all artworks in a grid
- Shows artist information
- Links to browse by artist
- Public access (no auth required)

### `/artist/[artistId]` - Artist Profile
- Artist header with avatar and stats
- List of folders created by artist
- Click folder to view artworks inside
- Public access

### `/folder/[folderId]` - Folder View
- Folder header with name and description
- Grid of artworks in the folder
- Link back to artist profile
- Public access

### `/portal` - Creator Dashboard
- **Profile Section:**
  - Avatar upload
  - Profile picture preview
- **Upload Artwork Tab:**
  - Form to upload new artwork
  - Folder selection dropdown
  - File upload with validation
- **Manage Folders Tab:**
  - Create new folders
  - List of user's folders
  - Edit/Delete folders (future)
- **My Artworks Section:**
  - Grid of all user's artworks
  - Delete functionality
  - Edit functionality (future)
- Requires authentication

### `/login` - Login Page
- Email and password form
- Link to signup

### `/signup` - Signup Page
- Name, email, and password form
- Link to login
- Auto-login after signup

## Security Features

1. **Authentication:**
   - JWT tokens stored in HTTP-only cookies
   - Password hashing with bcrypt (10 rounds)
   - Session management

2. **Authorization:**
   - Users can only edit/delete their own content
   - Folder ownership verification
   - Artwork ownership verification

3. **File Upload:**
   - File type validation (images only)
   - File size limits (10MB for artworks, 5MB for avatars)
   - Unique filename generation
   - Secure file storage

4. **Data Validation:**
   - Required field validation
   - Type checking
   - Error handling

## Future Enhancements

### Planned Features

1. **Search & Filter:**
   - Search artworks by title/description
   - Filter by artist, folder, date
   - Tag system

2. **Social Features:**
   - Like/favorite artworks
   - Comments on artworks
   - Follow artists
   - Share functionality

3. **Advanced Organization:**
   - Nested folders
   - Tags/categories
   - Collections
   - Featured artworks

4. **Analytics:**
   - View counts
   - Popular artworks
   - Artist statistics

5. **UI Improvements:**
   - Lightbox for image viewing
   - Image zoom
   - Slideshow mode
   - Responsive improvements

6. **Performance:**
   - Image optimization
   - Lazy loading
   - Caching strategies
   - CDN integration

## Code Quality

- **TypeScript:** Full type safety
- **Modular:** Separated concerns (API, UI, utilities)
- **Scalable:** Easy to add new features
- **Error Handling:** Comprehensive error messages
- **Code Organization:** Clear file structure
- **Documentation:** Inline comments and docs

## Database Management

### Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Migration Strategy

Currently using `prisma db push` for development. For production:
1. Use `prisma migrate dev` for migrations
2. Create migration files
3. Apply migrations in production

## Environment Variables

Create a `.env` file:

```env
JWT_SECRET=your-super-secret-key-change-in-production
DATABASE_URL="file:./dev.db"
```

## Getting Started

1. Install dependencies: `npm install`
2. Generate Prisma client: `npm run db:generate`
3. Push database schema: `npm run db:push`
4. Start dev server: `npm run dev`
5. Open http://localhost:3000

## Testing the System

1. **Sign up** as a new artist
2. **Upload avatar** in portal
3. **Create folders** (e.g., "Digital Art", "Sketches")
4. **Upload artworks** with/without folders
5. **View gallery** on homepage
6. **Visit artist profile** to see folders
7. **Open folder** to see artworks inside
8. **Edit/Delete** artworks and folders from portal

