'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const data = await res.json()
          setIsAdmin(data.user?.isAdmin === true)
        } else {
          // User not logged in or error
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [])

  if (loading || !isAdmin) return null

  return (
    <Link
      href="/admin"
      className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      Admin
    </Link>
  )
}

