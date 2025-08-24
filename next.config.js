/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // Legacy domain for existing static images
      'images.unsplash.com',
    ],
  },
}

module.exports = nextConfig
