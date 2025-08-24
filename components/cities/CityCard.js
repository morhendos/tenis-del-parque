'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/lib/hooks/useLocale'

// Generic fallback for city images - consistent and professional
const getGenericCityFallback = () => {
  // Use a consistent gradient background for all cities without images
  const svgContent = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10B981;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#cityGrad)"/>
      <text x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white" opacity="0.9">🏙️</text>
      <text x="400" y="340" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="white" opacity="0.8">Ciudad</text>
    </svg>
  `.trim()
  
  // Use URL encoding instead of base64 - more efficient and no environment issues
  const encodedSvg = encodeURIComponent(svgContent)
    
  return `data:image/svg+xml,${encodedSvg}`
}

export default function CityCard({ city, leagueCount = 0, className = '' }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const { locale } = useLocale()

  // Get the main city image with proper fallback handling
  const getCityImage = () => {
    if (city.images?.main && !imageError) {
      // If it's a Google photo reference, use the public proxy
      if (city.images?.googlePhotoReference) {
        return `/api/cities/photo?photo_reference=${city.images.googlePhotoReference}&maxwidth=800`
      }
      // Otherwise use the direct image URL
      return city.images.main
    }
    
    // Check if there are Google photos available even without a direct main image
    if (city.googleData?.photos && city.googleData.photos.length > 0 && !imageError) {
      const firstPhoto = city.googleData.photos[0]
      if (firstPhoto.photo_reference) {
        return `/api/cities/photo?photo_reference=${firstPhoto.photo_reference}&maxwidth=800`
      }
    }
    
    // Generic, consistent fallback for all cities
    return getGenericCityFallback()
  }

  const handleImageError = () => {
    console.log('Image failed to load for city:', city.name?.es || city.displayName)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // Handle missing league count
  const displayLeagueCount = leagueCount || city.leagueCount || 0

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      {/* City Image */}
      <div className="relative h-48 bg-gray-200">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parque-purple"></div>
          </div>
        )}
        
        <Image
          src={getCityImage()}
          alt={`${city.name?.es || city.displayName} - Tennis city`}
          fill
          className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* League count badge - only show if there are leagues */}
        {displayLeagueCount > 0 && (
          <div className="absolute top-2 left-2">
            <div className="bg-parque-purple text-white rounded-full px-3 py-1 text-sm font-medium shadow-lg">
              {displayLeagueCount} liga{displayLeagueCount !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
      
      {/* City Information */}
      <div className="p-6">
        <div className="mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {city.name?.es || city.displayName}
          </h3>
          {city.name?.es !== city.name?.en && city.name?.en && (
            <p className="text-sm text-gray-600">{city.name.en}</p>
          )}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{city.province || 'España'}, España</span>
        </div>
        
        {/* City stats */}
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-5a1 1 0 011-1h4a1 1 0 011 1v5m-4-8h.01M12 8h.01" />
            </svg>
            <span>{city.clubCount || 0} clubes</span>
          </div>
          
          {/* Show league availability instead of GPS */}
          {displayLeagueCount > 0 && (
            <div className="flex items-center text-green-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Con Ligas</span>
            </div>
          )}
        </div>
        
        {/* Action button */}
        <div className="mt-4">
          {displayLeagueCount > 0 ? (
            <Link 
              href={`/${locale}/${locale === 'es' ? 'ligas' : 'leagues'}`}
              className="block w-full bg-parque-purple text-white py-2 px-4 rounded-lg hover:bg-parque-purple/90 transition-colors font-medium text-center"
            >
              {locale === 'es' ? 'Ver Ligas de Tenis' : 'View Tennis Leagues'}
            </Link>
          ) : (
            <Link 
              href={`/${locale}/clubs/${city.slug || city.name?.es?.toLowerCase() || 'ciudad'}`}
              className="block w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
            >
              {locale === 'es' ? 'Explorar Clubes' : 'Explore Clubs'}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
