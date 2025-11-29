import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get artist profile with folders
export async function GET(
  request: Request,
  { params }: { params: { artistId: string } }
) {
  try {
    const artist = await prisma.user.findUnique({
      where: { id: params.artistId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        folders: {
          include: {
            _count: {
              select: { artworks: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            artworks: true,
            folders: true,
          },
        },
      },
    })

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ artist })
  } catch (error) {
    console.error('Error fetching artist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

