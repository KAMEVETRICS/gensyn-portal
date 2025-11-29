import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/jwt'
import LogoutButton from '@/components/LogoutButton'
import AdminLink from '@/components/AdminLink'

export const metadata: Metadata = {
  title: 'Gensyn Art portal - Art Gallery',
  description: 'Upload and discover beautiful artwork',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body>
        <div className="golden-accent"></div>
        <nav className="nav-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-gold">
                  Gensyn Art portal
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Gallery
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/portal"
                      className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      My Portal
                    </Link>
                    <AdminLink />
                    <LogoutButton />
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-300 hover:text-gold px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-primary px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}

