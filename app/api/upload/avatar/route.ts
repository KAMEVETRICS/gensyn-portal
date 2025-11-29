import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getCurrentUser } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is paused (avatars can still be updated)
    // This is optional - you may want to allow paused users to update avatars

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

    // Validate file size (max 5MB for avatars)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create avatars directory if it doesn't exist
    const avatarsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    try {
      await mkdir(avatarsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${originalName}`
    const filepath = join(avatarsDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Return file URL
    const avatarUrl = `/uploads/avatars/${filename}`

    // Update user's avatar in database
    await prisma.user.update({
      where: { id: user.userId },
      data: { avatarUrl },
    })

    return NextResponse.json({
      success: true,
      avatarUrl,
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

