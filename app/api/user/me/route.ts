import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let userData
    try {
      userData = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          isAdmin: true,
          isPaused: true,
        },
      })
    } catch (error: any) {
      // If schema fields don't exist yet, fetch without them
      if (error.message?.includes('Unknown argument') || error.message?.includes('Unknown field')) {
        console.warn('Schema may be out of sync, fetching user without new fields')
        userData = await prisma.user.findUnique({
          where: { id: user.userId },
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        })
        // Add default values for new fields
        if (userData) {
          userData = { ...userData, isAdmin: false, isPaused: false } as any
        }
      } else {
        throw error
      }
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
