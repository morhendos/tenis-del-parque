'use client'

import { useState, useEffect } from 'react'
import { getCityOptions, getAreasForCity, generateDisplayName } from '@/lib/utils/areaMapping'

export default function LocationSection({ formData, handleChange }) {
  const [cityOptions, setCityOptions] = useState([])
  const [availableAreas, setAvailableAreas] = useState([])

  // Load city options
  useEffect(() => {
    const options = getCityOptions()
    setCityOptions(options)
  }, [])

  // Update available areas when city changes
  useEffect(() => {
    if (formData.location.city) {
      const areas = getAreasForCity(formData.location.city)
      setAvailableAreas(areas.map(area => ({
        value: area,
        label: area.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      })))
      
      // Reset area if not available for selected city
      if (formData.location.area && !areas.includes(formData.location.area)) {
        handleChange('location.area', '')
      }
    }
  }, [formData.location.city])

  // Auto-generate display name
  useEffect(() => {
    if (formData.location.city) {
      const displayName = generateDisplayName(formData.location.area, formData.location.city)
      handleChange('location.displayName', displayName)
    }
  }, [formData.location.area, formData.location.city])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Details</h2>
        <p className="text-gray-600">Specify where the club is located</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* City and Area Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main City (League) *
            </label>
            <select
              value={formData.location.city}
              onChange={(e) => handleChange('location.city', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
              required
            >
              {cityOptions.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Determines which league this club belongs to
            </p>
          </div>

          {availableAreas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Area/Neighborhood
              </label>
              <select
                value={formData.location.area}
                onChange={(e) => handleChange('location.area', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
              >
                <option value="">Select area...</option>
                {availableAreas.map(area => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Optional: Specific neighborhood within {cityOptions.find(c => c.value === formData.location.city)?.label}
              </p>
            </div>
          )}
        </div>

        {/* Display Name Preview */}
        {formData.location.displayName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Location will display as:</p>
                <p className="text-lg font-semibold text-blue-800">
                  {formData.location.displayName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Address Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={formData.location.address}
              onChange={(e) => handleChange('location.address', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
              placeholder="e.g., Calle Example 123"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.location.postalCode}
                onChange={(e) => handleChange('location.postalCode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
                placeholder="29600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.location.coordinates.lat || ''}
                onChange={(e) => handleChange('location.coordinates.lat', parseFloat(e.target.value) || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
                placeholder="36.5095"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.location.coordinates.lng || ''}
                onChange={(e) => handleChange('location.coordinates.lng', parseFloat(e.target.value) || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
                placeholder="-4.8863"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps URL
            </label>
            <input
              type="url"
              value={formData.location.googleMapsUrl}
              onChange={(e) => handleChange('location.googleMapsUrl', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>

        {/* Map Preview (placeholder for future implementation) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <span className="text-4xl">🗺️</span>
          <p className="mt-2 text-sm text-gray-600">
            Map preview will appear here
          </p>
          {formData.location.coordinates.lat && formData.location.coordinates.lng && (
            <p className="mt-1 text-xs text-gray-500">
              {formData.location.coordinates.lat}, {formData.location.coordinates.lng}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}