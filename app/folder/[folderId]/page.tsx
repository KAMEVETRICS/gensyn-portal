import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import DownloadButton from '@/components/DownloadButton'

async function getFolder(folderId: string) {
  try {
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
    return folder
  } catch (error) {
    console.error('Error fetching folder:', error)
    return null
  }
}

export default async function FolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>
}) {
  const { folderId } = await params
  const folder = await getFolder(folderId)

  if (!folder) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Folder Header */}
        <div className="dark-card rounded-lg p-8 mb-8">
          <div className="mb-4">
            <Link
              href={`/artist/${folder.creator.id}`}
              className="text-sm text-gold hover:underline mb-2 inline-block"
            >
              ← Back to {folder.creator.name}'s profile
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {folder.name}
          </h1>
          {folder.description && (
            <p className="text-gray-400 mb-4">
              {folder.description}
            </p>
          )}
          <div className="flex items-center">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-dark-card border border-dark-border mr-3">
              {folder.creator.avatarUrl ? (
                <Image
                  src={folder.creator.avatarUrl}
                  alt={folder.creator.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gold">
                  {folder.creator.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <Link
              href={`/artist/${folder.creator.id}`}
              className="text-gray-300 hover:text-gold transition-colors"
            >
              by {folder.creator.name}
            </Link>
          </div>
        </div>

        {/* Artworks */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Artwork ({folder.artworks.length})
          </h2>

          {folder.artworks.length === 0 ? (
            <div className="text-center py-12 dark-card rounded-lg">
              <p className="text-gray-400">
                This folder is empty.
              </p>
            </div>
          ) : (
            <div className="artwork-grid">
              {folder.artworks.map((artwork: any) => (
                <div
                  key={artwork.id}
                  className="dark-card rounded-lg overflow-hidden relative group image-container"
                >
                  <div className="relative w-full h-64">
                    <Image
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {/* Download button overlay */}
                    <div className="absolute top-2 right-2">
                      <DownloadButton
                        imageUrl={artwork.imageUrl}
                        title={artwork.title}
                        filename={artwork.filename}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {artwork.title}
                    </h3>
                    {artwork.description && (
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                        {artwork.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

