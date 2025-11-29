import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/jwt'

// GET - Get all folders for a creator (or all folders if public)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const creatorId = searchParams.get('creatorId')

    if (creatorId === 'me') {
      // Get folders for current user
      const user = await getCurrentUser()
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      const folders = await prisma.folder.findMany({
        where: { creatorId: user.userId },
        include: {
          _count: {
            select: { artworks: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return NextResponse.json({ folders })
    }

    if (creatorId) {
      // Get folders for a specific creator
      const folders = await prisma.folder.findMany({
        where: { creatorId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { artworks: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json({ folders })
    }

    // Get all folders (public)
    const folders = await prisma.folder.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { artworks: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ folders })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new folder (requires auth)
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
        { error: 'Your account has been paused. You cannot create new folders.' },
        { status: 403 }
      )
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      )
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        description,
        creatorId: user.userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { artworks: true },
        },
      },
    })

    return NextResponse.json({ folder }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

