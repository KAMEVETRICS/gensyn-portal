import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/jwt'
import { deleteFromCloudinary } from '@/lib/cloudinary'

// GET - Get single artwork
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artworkId: string }> }
) {
  try {
    const { artworkId } = await params

    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ artwork })
  } catch (error: any) {
    console.error('Error fetching artwork:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update artwork (requires auth and ownership)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ artworkId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { artworkId } = await params
    const { title, description, folderId } = await request.json()

    // Find the artwork and verify ownership
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: {
        id: true,
        creatorId: true,
      },
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    // Verify the user owns this artwork
    if (artwork.creatorId !== user.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own artworks' },
        { status: 403 }
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

    // Update artwork
    const updatedArtwork = await prisma.artwork.update({
      where: { id: artworkId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(folderId !== undefined && { folderId: folderId || null }),
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
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ artwork: updatedArtwork })
  } catch (error: any) {
    console.error('Error updating artwork:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete artwork (requires auth and ownership)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ artworkId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { artworkId } = await params

    // Find the artwork and verify ownership
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: {
        id: true,
        creatorId: true,
        filename: true,
        imageUrl: true,
      },
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      )
    }

    // Verify the user owns this artwork
    if (artwork.creatorId !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own artworks' },
        { status: 403 }
      )
    }

    // Delete the file from storage (Cloudinary or local)
    try {
      if (artwork.imageUrl.startsWith('http')) {
        // Cloudinary URL
        await deleteFromCloudinary(artwork.imageUrl)
      } else {
        // Local file
        const { unlink } = await import('fs/promises')
        const { join } = await import('path')
        const filepath = join(process.cwd(), 'public', artwork.imageUrl)
        await unlink(filepath)
      }
    } catch (fileError) {
      // Log error but continue with database deletion
      console.error('Error deleting file:', fileError)
    }

    // Delete from database
    await prisma.artwork.delete({
      where: { id: artworkId },
    })

    return NextResponse.json(
      { message: 'Artwork deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting artwork:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

