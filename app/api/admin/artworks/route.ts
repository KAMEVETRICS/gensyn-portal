import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/admin'

// GET - Get all artworks (admin only)
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    const where: any = {}
    if (userId) {
      where.creatorId = userId
    }

    const artworks = await prisma.artwork.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            isPaused: true,
          },
        },
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

    return NextResponse.json({ artworks })
  } catch (error: any) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

