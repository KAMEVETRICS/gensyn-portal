import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/jwt'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const artworks = await prisma.artwork.findMany({
      where: {
        creatorId: user.userId,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`Found ${artworks.length} artworks for user ${user.userId}`) // Debug log
    
    return NextResponse.json({ artworks })
  } catch (error) {
    console.error('Error fetching user artworks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

