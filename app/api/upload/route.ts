import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is paused
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { isPaused: true },
    })

    if (userData?.isPaused) {
      return NextResponse.json(
        { error: 'Your account has been paused. You cannot upload new artwork.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${originalName}`

    // Upload to Cloudinary if configured, otherwise use local storage
    let imageUrl: string
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Upload to Cloudinary
      imageUrl = await uploadToCloudinary(buffer, 'artworks', filename)
    } else {
      // Fallback to local storage (for development)
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (error) {
        // Directory might already exist
      }
      const filepath = join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      imageUrl = `/uploads/${filename}`
    }

    return NextResponse.json({
      success: true,
      filename,
      imageUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

