'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  isAdmin: boolean
  isPaused: boolean
  createdAt: string
  _count: {
    artworks: number
    folders: number
  }
}

interface Artwork {
  id: string
  title: string
  description: string | null
  imageUrl: string
  createdAt: string
  creator: {
    id: string
    name: string
    email: string
    isPaused: boolean
  }
  folder: {
    id: string
    name: string
  } | null
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'artworks'>('users')
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [deletingArtworkId, setDeletingArtworkId] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const res = await fetch('/api/admin/check')
      if (!res.ok || res.status === 403) {
        router.push('/')
        return
      }
      fetchData()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchData = async () => {
    try {
      const [usersRes, artworksRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/artworks'),
      ])

      if (usersRes.status === 403 || artworksRes.status === 403) {
        router.push('/')
        return
      }

      if (!usersRes.ok || !artworksRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const usersData = await usersRes.json()
      const artworksData = await artworksRes.json()

      setUsers(usersData.users || [])
      setArtworks(artworksData.artworks || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This will delete all their artworks and folders. This action cannot be undone.`)) {
      return
    }

    setDeletingUserId(userId)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      setSuccess('User deleted successfully!')
      await fetchData()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleTogglePause = async (userId: string, currentPaused: boolean) => {
    setUpdatingUserId(userId)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPaused: !currentPaused,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      setSuccess(`User ${!currentPaused ? 'paused' : 'unpaused'} successfully!`)
      await fetchData()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleToggleAdmin = async (userId: string, currentAdmin: boolean) => {
    setUpdatingUserId(userId)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAdmin: !currentAdmin,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      setSuccess(`User ${!currentAdmin ? 'promoted to admin' : 'removed from admin'} successfully!`)
      await fetchData()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleDeleteArtwork = async (artworkId: string, artworkTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${artworkTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeletingArtworkId(artworkId)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/artworks/${artworkId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete artwork')
      }

      setSuccess('Artwork deleted successfully!')
      await fetchData()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setDeletingArtworkId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-400">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-400">
            Manage users, artworks, and platform content
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/20 border border-green-800 text-green-400 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-dark-border mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('artworks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'artworks'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Artworks ({artworks.length})
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full dark-card rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-dark-card/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-dark-card border border-dark-border mr-3">
                            {user.avatarUrl ? (
                              <Image
                                src={user.avatarUrl}
                                alt={user.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {user.name}
                              {user.isAdmin && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-gold text-black rounded">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isPaused ? (
                          <span className="px-2 py-1 text-xs font-medium bg-red-900/20 text-red-400 rounded">
                            Paused
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-green-900/20 text-green-400 rounded">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {user._count.artworks} artworks • {user._count.folders} folders
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleTogglePause(user.id, user.isPaused)}
                          disabled={updatingUserId === user.id}
                          className={`px-3 py-1 rounded text-xs ${
                            user.isPaused
                              ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
                              : 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingUserId === user.id
                            ? 'Updating...'
                            : user.isPaused
                            ? 'Unpause'
                            : 'Pause'}
                        </button>
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                          disabled={updatingUserId === user.id}
                          className={`px-3 py-1 rounded text-xs ${
                            user.isAdmin
                              ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/30'
                              : 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingUserId === user.id
                            ? 'Updating...'
                            : user.isAdmin
                            ? 'Remove Admin'
                            : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={deletingUserId === user.id || user.isAdmin}
                          className="px-3 py-1 rounded text-xs bg-red-900/20 text-red-400 hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Artworks Tab */}
        {activeTab === 'artworks' && (
          <div>
            <div className="artwork-grid">
              {artworks.map((artwork) => (
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
                    {artwork.creator.isPaused && (
                      <div className="absolute top-2 left-2 bg-red-900/80 text-red-200 px-2 py-1 rounded text-xs">
                        Creator Paused
                      </div>
                    )}
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
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        by {artwork.creator.name}
                      </p>
                      <button
                        onClick={() => handleDeleteArtwork(artwork.id, artwork.title)}
                        disabled={deletingArtworkId === artwork.id}
                        className="px-3 py-1 rounded text-xs bg-red-900/20 text-red-400 hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingArtworkId === artwork.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

