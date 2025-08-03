/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'picsum.photos',          // Fallback placeholder images
      'images.unsplash.com',    // Legacy fallback images  
      'maps.googleapis.com',    // Google Maps images (though proxied)
    ],
  },
}

module.exports = nextConfig
