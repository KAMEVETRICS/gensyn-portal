import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/admin'
import { deleteFromCloudinary } from '@/lib/cloudinary'

// DELETE - Delete any artwork (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ artworkId: string }> }
) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { artworkId } = await params

    // Find the artwork
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: {
        id: true,
        imageUrl: true,
        filename: true,
      },
    })

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
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

