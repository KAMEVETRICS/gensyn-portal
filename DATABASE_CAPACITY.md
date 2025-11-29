# Database Capacity Information

## Current Database: SQLite

Your application uses **SQLite** as the database, which has the following capacity characteristics:

## Theoretical Limits

### SQLite Limits:
- **Maximum Database Size**: 281 TB (theoretical maximum)
- **Maximum Rows per Table**: ~2^64 rows (essentially unlimited)
- **Maximum File Size**: Limited by filesystem (typically 2GB-140TB)
- **Maximum Columns per Table**: 2,000
- **Maximum String Length**: 1 billion bytes

## Practical Capacity for Art Pieces

### What's Stored in the Database:
Each artwork record stores only **metadata**:
- ID (string)
- Title (string)
- Description (string, optional)
- Image URL (string - path to file)
- Filename (string)
- Creator ID (string)
- Folder ID (string, optional)
- Created/Updated timestamps

**Estimated size per artwork record**: ~500 bytes - 2KB (depending on title/description length)

### What's NOT Stored in the Database:
- **Actual image files** are stored in `public/uploads/` directory
- Images are limited to 10MB each (as per your upload settings)

## Real-World Capacity Estimates

### Conservative Estimate:
- **1 million artworks**: ~500MB - 2GB database file
- **10 million artworks**: ~5GB - 20GB database file
- **100 million artworks**: ~50GB - 200GB database file

### Performance Considerations:
- **< 100,000 artworks**: Excellent performance
- **100,000 - 1 million**: Good performance with proper indexing
- **1 million - 10 million**: Acceptable performance, may need optimization
- **> 10 million**: Consider migrating to PostgreSQL or MySQL

## Storage Breakdown

### Database File (`prisma/dev.db`):
- Stores only metadata (text, IDs, timestamps)
- Very efficient for text-based data
- Grows slowly as you add artworks

### File System (`public/uploads/`):
- Stores actual image files
- Each image: up to 10MB
- This is where most storage will be used

### Example Storage Calculation:
If you have **10,000 artworks** with average image size of **2MB**:
- Database: ~10-20MB
- Images: ~20GB
- **Total: ~20GB**

## When to Consider Upgrading

### Stay with SQLite if:
- ✅ < 1 million artworks
- ✅ Single server deployment
- ✅ Low to moderate concurrent users
- ✅ Simple setup preferred

### Consider PostgreSQL/MySQL if:
- ⚠️ > 1 million artworks
- ⚠️ Need better concurrent write performance
- ⚠️ Multiple servers/load balancing
- ⚠️ Need advanced features (full-text search, etc.)

## Current Setup Capacity

Based on your current setup:
- **Database can handle**: Millions of artwork records
- **File system can handle**: Limited by your server's disk space
- **Practical limit**: Usually the file system (image storage), not the database

## Recommendations

1. **For Development/Testing**: SQLite is perfect (current setup)
2. **For Small-Medium Production**: SQLite can handle 100K-1M artworks easily
3. **For Large Scale**: Consider PostgreSQL when you approach 1M+ artworks

## Monitoring Database Size

You can check your database size:
```bash
# Windows PowerShell
(Get-Item "prisma/dev.db").Length / 1MB

# Or check in Prisma Studio
npm run db:studio
```

## Summary

**Your database can theoretically hold millions of art pieces.** The practical limit is usually:
1. **Disk space** for storing image files (not the database)
2. **Performance** as the database grows very large
3. **Concurrent users** accessing the database

For most use cases, SQLite will handle your needs perfectly fine. You'll likely run out of disk space for images before hitting database limits.

