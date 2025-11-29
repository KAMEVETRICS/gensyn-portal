import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/admin'

// GET - Get all users (admin only)
export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isAdmin: true,
        isPaused: true,
        createdAt: true,
        _count: {
          select: {
            artworks: true,
            folders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

