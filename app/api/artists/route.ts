import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all artists with their folders and artwork counts
export async function GET() {
  try {
    const artists = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        _count: {
          select: {
            artworks: true,
            folders: true,
          },
        },
      },
      where: {
        artworks: {
          some: {},
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ artists })
  } catch (error) {
    console.error('Error fetching artists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

