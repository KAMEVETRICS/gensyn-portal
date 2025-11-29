import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/admin'
import { unlink } from 'fs/promises'
import { join } from 'path'

// DELETE - Delete user and all their content (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { userId } = await params

    // Prevent admin from deleting themselves
    if (userId === admin.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own admin account' },
        { status: 400 }
      )
    }

    // Get user's artworks to delete files
    const artworks = await prisma.artwork.findMany({
      where: { creatorId: userId },
      select: { imageUrl: true },
    })

    // Delete artwork files
    for (const artwork of artworks) {
      try {
        const filepath = join(process.cwd(), 'public', artwork.imageUrl)
        await unlink(filepath)
      } catch (error) {
        // File might not exist, continue
      }
    }

    // Delete user (cascade will delete artworks and folders)
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user (pause/unpause, etc.) (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { userId } = await params
    const { isPaused, isAdmin: setAdmin } = await request.json()

    // Prevent admin from removing their own admin status
    if (userId === admin.id && setAdmin === false) {
      return NextResponse.json(
        { error: 'Cannot remove admin status from your own account' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (typeof isPaused === 'boolean') {
      updateData.isPaused = isPaused
    }
    if (typeof setAdmin === 'boolean') {
      updateData.isAdmin = setAdmin
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isPaused: true,
        _count: {
          select: {
            artworks: true,
            folders: true,
          },
        },
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

