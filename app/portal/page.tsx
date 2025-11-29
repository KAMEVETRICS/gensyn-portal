'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SafeImage from '@/components/SafeImage'
import Link from 'next/link'

interface Artwork {
  id: string
  title: string
  description: string | null
  imageUrl: string
  createdAt: string
  folderId: string | null
  folder?: {
    id: string
    name: string
  } | null
}

interface Folder {
  id: string
  name: string
  description: string | null
  _count: { artworks: number }
}

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export default function PortalPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    folderId: '',
  })
  const [folderFormData, setFolderFormData] = useState({
    name: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'artworks' | 'folders'>('artworks')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch user info, artworks, and folders
      const [userRes, artworksRes, foldersRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/artworks/my-artworks'),
        fetch('/api/folders?creatorId=me'),
      ])

      if (artworksRes.status === 401 || userRes.status === 401) {
        router.push('/login')
        return
      }

      if (!userRes.ok) {
        const errorData = await userRes.json().catch(() => ({ error: 'Unknown error' }))
        console.error('User fetch error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch user data')
      }
      if (!artworksRes.ok) {
        const errorData = await artworksRes.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Artworks fetch error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch artworks')
      }
      if (!foldersRes.ok) {
        const errorData = await foldersRes.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Folders fetch error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch folders')
      }

      const userData = await userRes.json()
      const artworksData = await artworksRes.json()
      const foldersData = await foldersRes.json()

      console.log('Fetched artworks:', artworksData) // Debug log
      console.log('Artworks array:', artworksData.artworks) // Debug log
      
      setUser(userData.user)
      setArtworks(artworksData.artworks || [])
      setFolders(foldersData.folders || [])
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to load data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] })
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    setUploadingAvatar(true)
    setError('')
    setSuccess('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', e.target.files[0])

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      setSuccess('Avatar updated successfully!')
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUploading(true)

    if (!formData.file || !formData.title) {
      setError('Please provide a title and select an image file')
      setUploading(false)
      return
    }

    try {
      // Step 1: Upload the file
      const uploadFormData = new FormData()
      uploadFormData.append('file', formData.file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadData = await uploadRes.json()

      // Step 2: Create artwork record
      const artworkRes = await fetch('/api/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          imageUrl: uploadData.imageUrl,
          filename: uploadData.filename,
          folderId: formData.folderId || null,
        }),
      })

      if (!artworkRes.ok) {
        const errorData = await artworkRes.json()
        throw new Error(errorData.error || 'Failed to create artwork')
      }

      const artworkData = await artworkRes.json()
      console.log('Artwork created:', artworkData) // Debug log
      
      setSuccess('Artwork uploaded successfully!')
      setFormData({ title: '', description: '', file: null, folderId: '' })
      const fileInput = document.getElementById('file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      // Refresh the artworks list
      await fetchData()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreatingFolder(true)

    if (!folderFormData.name) {
      setError('Folder name is required')
      setCreatingFolder(false)
      return
    }

    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folderFormData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create folder')
      }

      setSuccess('Folder created successfully!')
      setFolderFormData({ name: '', description: '' })
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setCreatingFolder(false)
    }
  }

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return
    }

    setDeletingId(artworkId)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/artworks/${artworkId}`, {
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
      setDeletingId(null)
    }
  }

  const handleMoveArtwork = async (artworkId: string, newFolderId: string | null) => {
    setMovingId(artworkId)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/artworks/${artworkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderId: newFolderId,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to move artwork')
      }

      const folderName = newFolderId 
        ? folders.find(f => f.id === newFolderId)?.name || 'folder'
        : 'main gallery'
      setSuccess(`Artwork moved to ${folderName} successfully!`)
      await fetchData()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setMovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Creator Portal
        </h1>

        {/* Avatar Upload Section */}
        <div className="dark-card rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Profile Picture
          </h2>
          <div className="flex items-center space-x-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-dark-card border border-dark-border">
              {user?.avatarUrl ? (
                <SafeImage
                  src={user.avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-pink-accent">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <label className="block">
                <span className="sr-only">Choose avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-pink-accent file:text-black
                    hover:file:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </label>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {uploadingAvatar ? 'Uploading...' : 'Upload a new profile picture (max 5MB)'}
              </p>
            </div>
          </div>
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
              onClick={() => setActiveTab('artworks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'artworks'
                  ? 'border-pink-accent text-pink-accent'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Upload Artwork
            </button>
            <button
              onClick={() => setActiveTab('folders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'folders'
                  ? 'border-pink-accent text-pink-accent'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Manage Folders
            </button>
          </nav>
        </div>

        {/* Upload Artwork Tab */}
        {activeTab === 'artworks' && (
          <div className="dark-card rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Upload New Artwork
          </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-dark-border rounded-md text-foreground bg-dark-card focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Enter artwork title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-dark-border rounded-md text-foreground bg-dark-card focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Enter artwork description (optional)"
                />
              </div>

              <div>
                <label htmlFor="folderId" className="block text-sm font-medium text-gray-300 mb-1">
                  Folder (optional)
                </label>
                <select
                  id="folderId"
                  value={formData.folderId}
                  onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
                  className="w-full px-3 py-2 border border-dark-border rounded-md text-foreground bg-dark-card focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="">No folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-1">
                  Image File * (Max 10MB)
                </label>
                <input
                  id="file"
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-dark-border rounded-md text-foreground bg-dark-card focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full btn-primary px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Artwork'}
              </button>
            </form>
          </div>
        )}

        {/* Manage Folders Tab */}
        {activeTab === 'folders' && (
          <div className="space-y-6">
            {/* Create Folder Form */}
            <div className="dark-card rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Create New Folder
              </h2>
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label htmlFor="folderName" className="block text-sm font-medium text-gray-300 mb-1">
                    Folder Name *
                  </label>
                  <input
                    id="folderName"
                    type="text"
                    required
                    value={folderFormData.name}
                    onChange={(e) => setFolderFormData({ ...folderFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-dark-border rounded-md text-foreground bg-dark-card focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Enter folder name"
                  />
                </div>
                <div>
                  <label htmlFor="folderDescription" className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="folderDescription"
                    value={folderFormData.description}
                    onChange={(e) => setFolderFormData({ ...folderFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-dark-border rounded-md text-foreground bg-dark-card focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Enter folder description (optional)"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingFolder}
                  className="w-full btn-primary px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingFolder ? 'Creating...' : 'Create Folder'}
                </button>
              </form>
            </div>

            {/* My Folders */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                My Folders ({folders.length})
              </h2>
              {folders.length === 0 ? (
                <div className="text-center py-12 dark-card rounded-lg">
                  <p className="text-gray-400">
                    You haven't created any folders yet. Create one above!
                  </p>
                </div>
              ) : (
                <div className="artwork-grid">
                  {folders.map((folder) => (
                    <Link
                      key={folder.id}
                      href={`/folder/${folder.id}`}
                      className="dark-card rounded-lg p-6"
                    >
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
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Artworks */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            My Artworks ({artworks.length})
          </h2>

          {artworks.length === 0 ? (
            <div className="text-center py-12 dark-card rounded-lg">
              <p className="text-gray-400">
                You haven't uploaded any artwork yet. Upload your first piece above!
              </p>
            </div>
          ) : (
            <div className="artwork-grid">
              {artworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="dark-card rounded-lg overflow-hidden relative group image-container"
                >
                  <div className="relative w-full h-40 sm:h-48">
                    <SafeImage
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Delete button overlay */}
                    <button
                      onClick={() => handleDeleteArtwork(artwork.id)}
                      disabled={deletingId === artwork.id}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete artwork"
                    >
                      {deletingId === artwork.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {artwork.title}
                    </h3>
                    {artwork.description && (
                      <p className="text-sm text-gray-400 mb-2">
                        {artwork.description}
                      </p>
                    )}
                    
                    {/* Move to Folder */}
                    <div className="mb-2">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Move to folder:
                      </label>
                      <select
                        value={artwork.folderId || ''}
                        onChange={(e) => handleMoveArtwork(artwork.id, e.target.value || null)}
                        disabled={movingId === artwork.id}
                        className="w-full text-xs px-2 py-1 border border-dark-border rounded-md text-foreground bg-dark-card focus:outline-none focus:ring-1 focus:ring-pink-accent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">No folder (Main Gallery)</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                      {artwork.folder && (
                        <p className="text-xs text-gray-500 mt-1">
                          Currently in: {artwork.folder.name}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Uploaded {new Date(artwork.createdAt).toLocaleDateString()}
                    </p>
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
