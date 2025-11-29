'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
}

export default function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  sizes,
  priority = false,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      // Try to reload the image once
      setTimeout(() => {
        setImgSrc(`${src}?t=${Date.now()}`)
      }, 1000)
    }
  }

  if (hasError && imgSrc === src) {
    // Show placeholder if image fails to load
    return (
      <div
        className={`bg-dark-card flex items-center justify-center ${fill ? 'absolute inset-0' : ''} ${className}`}
        style={!fill && width && height ? { width, height } : {}}
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto text-gray-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500">Image unavailable</p>
        </div>
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        onError={handleError}
        unoptimized={process.env.NODE_ENV === 'production'}
        priority={priority}
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      onError={handleError}
      unoptimized={process.env.NODE_ENV === 'production'}
      priority={priority}
    />
  )
}

