'use client'

import { useState } from 'react'

interface DownloadButtonProps {
  imageUrl: string
  title: string
  filename?: string
}

export default function DownloadButton({ imageUrl, title, filename }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Fetch the image
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a')
      link.href = url
      
      // Use provided filename or generate one from title
      const downloadFilename = filename || `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${blob.type.split('/')[1] || 'jpg'}`
      link.download = downloadFilename
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Failed to download image. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="bg-gold text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      title="Download artwork"
    >
      {downloading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
    </button>
  )
}

