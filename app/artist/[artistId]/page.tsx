import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import DownloadButton from '@/components/DownloadButton'

async function getArtist(artistId: string) {
  try {
    const artist = await prisma.user.findUnique({
      where: { id: artistId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        folders: {
          include: {
            _count: {
              select: { artworks: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        artworks: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            filename: true,
            createdAt: true,
            folderId: true,
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
        },
        _count: {
          select: {
            artworks: true,
            folders: true,
          },
        },
      },
    })
    return artist
  } catch (error) {
    console.error('Error fetching artist:', error)
    return null
  }
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ artistId: string }>
}) {
  const { artistId } = await params
  const artist = await getArtist(artistId)

  if (!artist) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Artist Header */}
        <div className="dark-card rounded-lg p-8 mb-8">
          <div className="flex items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-6">
              {artist.avatarUrl ? (
                <Image
                  src={artist.avatarUrl}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500 dark:text-gray-400">
                  {artist.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {artist.name}
              </h1>
              <p className="text-gray-400 mb-4">
                {artist._count.artworks} artwork{artist._count.artworks !== 1 ? 's' : ''} • {artist._count.folders} folder{artist._count.folders !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-500">
                Joined {new Date(artist.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Folders */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Art Folders
          </h2>

          {artist.folders.length === 0 ? (
            <div className="text-center py-12 dark-card rounded-lg">
              <p className="text-gray-400">
                This artist hasn't created any folders yet.
              </p>
            </div>
          ) : (
            <div className="artwork-grid">
              {artist.folders.map((folder: any) => (
                <Link
                  key={folder.id}
                  href={`/folder/${folder.id}`}
                  className="dark-card rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {folder.name}
                    </h3>
                    {folder.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {folder._count.artworks} artwork{folder._count.artworks !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* All Artworks */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            All Artworks ({artist.artworks.length})
          </h2>

          {artist.artworks.length === 0 ? (
            <div className="text-center py-12 dark-card rounded-lg">
              <p className="text-gray-400">
                This artist hasn't uploaded any artwork yet.
              </p>
            </div>
          ) : (
            <div className="artwork-grid">
              {artist.artworks.map((artwork: any) => (
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
                    {artwork.folder ? (
                      <Link
                        href={`/folder/${artwork.folder.id}`}
                        className="text-xs text-gold hover:underline mt-1 block"
                      >
                        in {artwork.folder.name}
                      </Link>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        No folder
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

