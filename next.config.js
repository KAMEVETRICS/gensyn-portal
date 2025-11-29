/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.railway.app',
      },
      {
        protocol: 'https',
        hostname: '*.up.railway.app',
      },
    ],
    // Enable unoptimized for Railway compatibility
    unoptimized: process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'true',
  },
}

module.exports = nextConfig

