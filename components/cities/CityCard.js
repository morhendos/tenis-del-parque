'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/lib/hooks/useLocale'

// Professional fallback for city images
const getGenericCityFallback = (cityName) => {
  // Create a more professional gradient-based fallback with city initial
  const initial = cityName ? cityName.charAt(0).toUpperCase() : 'C'
  
  const svgContent = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#10B981;stop-opacity:0.9" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/>
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#cityGrad)"/>
      <rect width="800" height="600" fill="url(#grid)"/>
      <circle cx="400" cy="280" r="80" fill="white" opacity="0.2"/>
      <text x="400" y="305" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white" opacity="0.95">${initial}</text>
    </svg>
  `.trim()
  
  const encodedSvg = encodeURIComponent(svgContent)
  return `data:image/svg+xml,${encodedSvg}`
}

export default function CityCard({ city, leagueCount = 0, className = '' }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const { locale } = useLocale()

  // Get the main city image with proper fallback handling
  const getCityImage = () => {
    // If there's an error or no images, return a professional fallback
    if (imageError || (!city.images?.main && !city.images?.googlePhotoReference && !city.googleData?.photos?.length)) {
      return getGenericCityFallback(city.name?.es || city.displayName || 'Ciudad')
    }

    // Check for main image - handle both Google photos and Vercel Blob URLs
    if (city.images?.main) {
      // If it's a Google photo reference, use the public proxy
      if (city.images?.googlePhotoReference) {
        return `/api/cities/photo?photo_reference=${city.images.googlePhotoReference}&maxwidth=800`
      }
      // Check if it's a Vercel Blob URL
      if (city.images.main.includes('blob.vercel-storage.com')) {
        return city.images.main
      }
      // Check if it's a relative URL (from old local uploads)
      if (city.images.main.startsWith('/')) {
        return city.images.main
      }
      // Otherwise use the URL as-is
      return city.images.main
    }
    
    // Check if there are Google photos available
    if (city.googleData?.photos && city.googleData.photos.length > 0) {
      const firstPhoto = city.googleData.photos[0]
      if (firstPhoto.photo_reference) {
        return `/api/cities/photo?photo_reference=${firstPhoto.photo_reference}&maxwidth=800`
      }
    }
    
    // Professional fallback
    return getGenericCityFallback(city.name?.es || city.displayName || 'Ciudad')
  }

  const handleImageError = (e) => {
    console.error('Image failed to load for city:', city.name?.es || city.displayName)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // Handle league count
  const displayLeagueCount = leagueCount || city.leagueCount || 0

  // Get the image URL
  const imageUrl = getCityImage()
  const isDataUrl = imageUrl.startsWith('data:')
  
  // Determine the link URL based on whether the city has leagues
  const linkUrl = displayLeagueCount > 0 
    ? `/${locale}/${locale === 'es' ? 'ligas' : 'leagues'}`
    : `/${locale}/${locale === 'es' ? 'clubes' : 'clubs'}/${city.slug || city.name?.es?.toLowerCase() || 'ciudad'}`

  return (
    <Link 
      href={linkUrl}
      className={`group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${className}`}
    >
      {/* City Image */}
      <div className="relative h-56 bg-gradient-to-br from-purple-100 to-green-100">
        {imageLoading && !isDataUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parque-purple"></div>
          </div>
        )}
        
        <Image
          src={imageUrl}
          alt={`${city.name?.es || city.displayName} - Tennis city`}
          fill
          className={`object-cover transition-all duration-700 group-hover:scale-110 ${imageLoading && !isDataUrl ? 'opacity-0' : 'opacity-100'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={isDataUrl}
        />
        
        {/* Elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* League badge - top right */}
        {displayLeagueCount > 0 && (
          <div className="absolute top-4 right-4">
            <div className="bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {displayLeagueCount} {locale === 'es' ? 'Liga' : 'League'}{displayLeagueCount > 1 ? 's' : ''}
            </div>
          </div>
        )}
        
        {/* City Info Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">
            {city.name?.es || city.displayName}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white/90 text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{city.province || 'España'}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-lg px-3 py-1.5 text-sm font-semibold">
              <span className="text-lg font-bold">{city.clubCount || 0}</span> {locale === 'es' ? 'clubes' : 'clubs'}
            </div>
          </div>
        </div>
        
        {/* Hover Indicator - Arrow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-xl">
            <svg className="w-8 h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}