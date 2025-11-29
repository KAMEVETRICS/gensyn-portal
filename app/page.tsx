import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import { prisma } from '@/lib/prisma'

async function getArtists() {
  try {
    const artists = await prisma.user.findMany({
      where: {
        artworks: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        _count: {
          select: {
            artworks: true,
            folders: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    return artists
  } catch (error) {
    console.error('Error fetching artists:', error)
    return []
  }
}

export default async function Home() {
  const artists = await getArtists()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Discover Artists
          </h1>
          <p className="text-lg sm:text-xl text-gray-400">
            Browse artwork organized by talented creators
          </p>
        </div>

        {/* Artists Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            All Artists ({artists.length})
          </h2>

          {artists.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <p className="text-gray-400 text-base sm:text-lg mb-4">
                No artists yet. Be the first to sign up and upload!
              </p>
              <Link
                href="/signup"
                className="inline-block btn-primary px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium"
              >
                Sign Up to Upload
              </Link>
            </div>
          ) : (
            <div className="artwork-grid">
              {artists.map((artist: any) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="dark-card rounded-lg overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-dark-card border border-dark-border mr-3 sm:mr-4 flex-shrink-0">
                        {artist.avatarUrl ? (
                          <SafeImage
                            src={artist.avatarUrl}
                            alt={artist.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-pink-accent">
                            {artist.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                          {artist.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-400">
                      <span>{artist._count.artworks} artwork{artist._count.artworks !== 1 ? 's' : ''}</span>
                      <span>{artist._count.folders} folder{artist._count.folders !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

