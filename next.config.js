/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // Legacy domain for existing static images
      'images.unsplash.com',
      // Vercel Blob Storage domains
      '*.public.blob.vercel-storage.com',
      'public.blob.vercel-storage.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  
  // Rewrite Spanish "clubes" URLs to use the unified "clubs" implementation
  async rewrites() {
    return [
      {
        source: '/:locale(es)/clubes',
        destination: '/:locale/clubs'
      },
      {
        source: '/:locale(es)/clubes/:city',
        destination: '/:locale/clubs/:city'
      },
      {
        source: '/:locale(es)/clubes/:city/area/:area',
        destination: '/:locale/clubs/:city/area/:area'
      },
      {
        source: '/:locale(es)/clubes/:city/:slug',
        destination: '/:locale/clubs/:city/:slug'
      }
    ]
  }
}

module.exports = nextConfig
