import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/jwt'

// GET - Get all artworks (public)
export async function GET() {
  try {
    const artworks = await prisma.artwork.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ artworks })
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new artwork (requires auth)
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

    const { title, description, imageUrl, filename, folderId } = await request.json()

    if (!title || !imageUrl || !filename) {
      return NextResponse.json(
        { error: 'Title, imageUrl, and filename are required' },
        { status: 400 }
      )
    }

    // Verify folder belongs to user if folderId is provided
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          creatorId: user.userId,
        },
      })
      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found or access denied' },
          { status: 403 }
        )
      }
    }

    const artwork = await prisma.artwork.create({
      data: {
        title,
        description,
        imageUrl,
        filename,
        creatorId: user.userId,
        folderId: folderId || null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ artwork }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating artwork:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

