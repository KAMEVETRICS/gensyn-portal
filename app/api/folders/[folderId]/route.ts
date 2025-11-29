import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/jwt'

// GET - Get folder with artworks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        artworks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ folder })
  } catch (error: any) {
    console.error('Error fetching folder:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update folder (requires auth and ownership)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { folderId } = await params
    const { name, description } = await request.json()

    // Find the folder and verify ownership
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      select: {
        id: true,
        creatorId: true,
      },
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Verify the user owns this folder
    if (folder.creatorId !== user.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own folders' },
        { status: 403 }
      )
    }

    // Update folder
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
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

    return NextResponse.json({ folder: updatedFolder })
  } catch (error: any) {
    console.error('Error updating folder:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete folder (requires auth and ownership)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { folderId } = await params

    // Find the folder and verify ownership
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      select: {
        id: true,
        creatorId: true,
      },
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Verify the user owns this folder
    if (folder.creatorId !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own folders' },
        { status: 403 }
      )
    }

    // Delete folder (artworks will have folderId set to null due to onDelete: SetNull)
    await prisma.folder.delete({
      where: { id: folderId },
    })

    return NextResponse.json(
      { message: 'Folder deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

