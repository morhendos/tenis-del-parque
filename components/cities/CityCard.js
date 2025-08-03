'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function CityCard({ city, leagueCount = 0, className = '' }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Get the main city image or fallback to a default
  const getCityImage = () => {
    if (city.images?.main && !imageError) {
      return city.images.main
    }
    
    // Fallback to a default city image based on city name
    const citySlug = city.slug || city.name?.es?.toLowerCase().replace(/\s+/g, '-')
    return `https://images.unsplash.com/1200x800/?${citySlug},spain,city,landscape`
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}>
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
        {leagueCount > 0 && (
          <div className="absolute top-2 left-2">
            <div className="bg-parque-purple text-white rounded-full px-3 py-1 text-sm font-medium">
              {leagueCount} league{leagueCount !== 1 ? 's' : ''}
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
          <span>{city.province}, Spain</span>
        </div>
        
        {/* City stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-5a1 1 0 011-1h4a1 1 0 011 1v5m-4-8h.01M12 8h.01" />
            </svg>
            <span>{city.clubCount || 0} clubs</span>
          </div>
          
          {city.coordinates?.lat && city.coordinates?.lng && (
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
          <button className="w-full bg-parque-purple text-white py-2 px-4 rounded-lg hover:bg-parque-purple/90 transition-colors font-medium">
            View Tennis Leagues
          </button>
        </div>
      </div>
    </div>
  )
}
