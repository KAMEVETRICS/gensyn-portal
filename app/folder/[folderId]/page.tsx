import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Folder Header */}
        <div className="dark-card rounded-lg p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="mb-4">
            <Link
              href={`/artist/${folder.creator.id}`}
              className="text-xs sm:text-sm text-pink-accent hover:underline mb-2 inline-block"
            >
              ← Back to {folder.creator.name}'s profile
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {folder.name}
          </h1>
          {folder.description && (
            <p className="text-sm sm:text-base text-gray-400 mb-4">
              {folder.description}
            </p>
          )}
          <div className="flex items-center">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-dark-card border border-dark-border mr-3">
              {folder.creator.avatarUrl ? (
                <SafeImage
                  src={folder.creator.avatarUrl}
                  alt={folder.creator.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-pink-accent">
                  {folder.creator.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <Link
              href={`/artist/${folder.creator.id}`}
              className="text-sm sm:text-base text-gray-300 hover:text-pink-accent transition-colors"
            >
              by {folder.creator.name}
            </Link>
          </div>
        </div>

        {/* Artworks */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            Artwork ({folder.artworks.length})
          </h2>

          {folder.artworks.length === 0 ? (
            <div className="text-center py-8 sm:py-12 dark-card rounded-lg">
              <p className="text-sm sm:text-base text-gray-400">
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
                  <div className="relative w-full h-48 sm:h-64">
                    <SafeImage
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Download button overlay */}
                    <div className="absolute top-2 right-2 z-10">
                      <DownloadButton
                        imageUrl={artwork.imageUrl}
                        title={artwork.title}
                        filename={artwork.filename}
                      />
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                      {artwork.title}
                    </h3>
                    {artwork.description && (
                      <p className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-2">
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

