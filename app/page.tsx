import Link from 'next/link'
import Image from 'next/image'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Discover Artists
          </h1>
          <p className="text-xl text-gray-400">
            Browse artwork organized by talented creators
          </p>
        </div>

        {/* Artists Section */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            All Artists ({artists.length})
          </h2>

          {artists.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">
                No artists yet. Be the first to sign up and upload!
              </p>
              <Link
                href="/signup"
                className="inline-block btn-primary px-6 py-3 rounded-lg font-medium"
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
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-dark-card border border-dark-border mr-4">
                        {artist.avatarUrl ? (
                          <Image
                            src={artist.avatarUrl}
                            alt={artist.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gold">
                            {artist.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {artist.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
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

