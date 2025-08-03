'use client'

import { useState } from 'react'
import Image from 'next/image'

// Helper function to generate deterministic fallback images
const getFallbackImageUrl = (cityName, width = 800, height = 600) => {
  // Create a seed from city name for consistent images
  const seed = cityName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)
  return `https://picsum.photos/${width}/${height}?seed=${seed}`
}

export default function CityCard({ city, leagueCount = 0, className = '' }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Get the main city image with proper fallback handling
  const getCityImage = () => {
    if (city.images?.main && !imageError) {
      // If it's a Google photo reference, use the public proxy
      if (city.images.googlePhotoReference) {
        return `/api/cities/photo?photo_reference=${city.images.googlePhotoReference}&maxwidth=800`
      }
      // Otherwise use the direct image URL
      return city.images.main
    }
    
    // Fallback to deterministic placeholder based on city name
    const cityName = city.name?.es || city.displayName || city.slug || 'city'
    return getFallbackImageUrl(cityName, 800, 600)
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
        
        {/* Google Photo Attribution (if from Google) */}
        {city.images?.googlePhotoReference && !imageError && (
          <div className="absolute top-2 right-2">
            <div className="bg-white/90 rounded px-2 py-1 text-xs text-gray-600 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>Google</span>
            </div>
          </div>
        )}
        
        {/* League count badge */}
        {displayLeagueCount > 0 && (
          <div className="absolute top-2 left-2">
            <div className="bg-parque-purple text-white rounded-full px-3 py-1 text-sm font-medium shadow-lg">
              {displayLeagueCount} liga{displayLeagueCount !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* "Coming Soon" badge for cities without leagues */}
        {displayLeagueCount === 0 && (
          <div className="absolute top-2 left-2">
            <div className="bg-amber-500 text-white rounded-full px-3 py-1 text-sm font-medium shadow-lg">
              Próximamente
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
          
          {((city.coordinates?.lat && city.coordinates?.lng) || city.hasCoordinates) && (
            <div className="flex items-center text-green-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">GPS</span>
            </div>
          )}
        </div>
        
        {/* Action button */}
        <div className="mt-4">
          {displayLeagueCount > 0 ? (
            <button className="w-full bg-parque-purple text-white py-2 px-4 rounded-lg hover:bg-parque-purple/90 transition-colors font-medium">
              Ver Ligas de Tenis
            </button>
          ) : (
            <button className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg cursor-default font-medium">
              Próximamente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
