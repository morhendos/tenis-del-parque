'use client'

import { useState, useEffect } from 'react'

export default function CityFormModal({ isOpen, onClose, city, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchMode, setSearchMode] = useState(!city) // Start in search mode for new cities
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  
  const [formData, setFormData] = useState({
    slug: '',
    name: {
      es: '',
      en: ''
    },
    province: 'Málaga',
    country: 'Spain',
    coordinates: {
      lat: null,
      lng: null
    },
    status: 'active',
    displayOrder: 0,
    importSource: 'manual'
  })

  // Initialize form data when editing
  useEffect(() => {
    if (city) {
      setSearchMode(false) // Editing mode, skip search
      setFormData({
        slug: city.slug || '',
        name: {
          es: city.name?.es || '',
          en: city.name?.en || ''
        },
        province: city.province || 'Málaga',
        country: city.country || 'Spain',
        coordinates: {
          lat: city.coordinates?.lat || null,
          lng: city.coordinates?.lng || null
        },
        status: city.status || 'active',
        displayOrder: city.displayOrder || 0,
        importSource: city.importSource || 'manual'
      })
    } else {
      // Reset to initial state for new city
      setSearchMode(true)
      setFormData({
        slug: '',
        name: {
          es: '',
          en: ''
        },
        province: 'Málaga',
        country: 'Spain',
        coordinates: {
          lat: null,
          lng: null
        },
        status: 'active',
        displayOrder: 0,
        importSource: 'manual'
      })
    }
    setError(null)
    setSearchQuery('')
    setSearchResults([])
    setSelectedResult(null)
  }, [city, isOpen])

  // Search for cities using Google Maps
  const handleCitySearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a city name to search')
      return
    }

    setSearchLoading(true)
    setError(null)
    setSearchResults([])

    try {
      const response = await fetch('/api/admin/cities/search-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery + ', Spain', // Add Spain to get Spanish cities
          types: ['locality', 'administrative_area_level_2'] // City types
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search cities')
      }

      setSearchResults(data.results || [])
      
      if (data.results?.length === 0) {
        setError('No cities found. Try a different search term.')
      }

    } catch (err) {
      console.error('City search error:', err)
      setError(err.message)
    } finally {
      setSearchLoading(false)
    }
  }

  // Select a city from search results
  const handleSelectCity = (result) => {
    setSelectedResult(result)
    
    // Extract city and province from Google result
    const addressComponents = result.address_components || []
    let cityName = result.name
    let province = 'Málaga' // default
    
    // Find province from address components
    const provinceComponent = addressComponents.find(
      comp => comp.types.includes('administrative_area_level_2')
    )
    if (provinceComponent) {
      province = provinceComponent.long_name
    }

    // Generate slug from city name
    const slug = generateSlug(cityName)

    // Pre-fill form with Google data
    setFormData({
      slug: slug,
      name: {
        es: cityName,
        en: cityName // Will be manually adjusted if needed
      },
      province: province,
      country: 'Spain',
      coordinates: {
        lat: result.geometry?.location?.lat || null,
        lng: result.geometry?.location?.lng || null
      },
      status: 'active',
      displayOrder: 0,
      importSource: 'google'
    })
  }

  // Switch to manual mode
  const handleManualMode = () => {
    setSearchMode(false)
    setSelectedResult(null)
    // Keep any pre-filled data from search
  }

  // Generate slug from Spanish name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  const handleChange = (field, value) => {
    setFormData(prev => {
      const keys = field.split('.')
      const newData = { ...prev }
      let current = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      
      // Auto-generate slug when Spanish name changes (only for new cities)
      if (field === 'name.es' && !city) {
        newData.slug = generateSlug(value)
      }
      
      // Auto-fill English name if empty (only for new cities)
      if (field === 'name.es' && !city && !newData.name.en) {
        newData.name.en = value
      }
      
      return newData
    })
  }

  const validateForm = () => {
    if (!formData.slug) {
      setError('Slug is required')
      return false
    }
    
    if (!formData.name.es) {
      setError('Spanish name is required')
      return false
    }
    
    if (!formData.name.en) {
      setError('English name is required')
      return false
    }
    
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const dataToSend = {
        ...formData,
        // Clean up coordinates
        coordinates: {
          lat: formData.coordinates.lat ? parseFloat(formData.coordinates.lat) : undefined,
          lng: formData.coordinates.lng ? parseFloat(formData.coordinates.lng) : undefined
        }
      }

      // Remove undefined coordinates
      if (!dataToSend.coordinates.lat || !dataToSend.coordinates.lng) {
        delete dataToSend.coordinates
      }

      // Add Google-specific data if selected from search
      if (selectedResult) {
        dataToSend.formattedAddress = selectedResult.formatted_address
        dataToSend.googlePlaceId = selectedResult.place_id
        dataToSend.googleMapsUrl = `https://maps.google.com/?q=${dataToSend.coordinates.lat},${dataToSend.coordinates.lng}`
        dataToSend.googleData = {
          types: selectedResult.types,
          addressComponents: selectedResult.address_components,
          viewport: selectedResult.geometry?.viewport
        }
        dataToSend.enhancedAt = new Date().toISOString()
      }

      const url = city 
        ? '/api/admin/cities'
        : '/api/admin/cities'
      
      const method = city ? 'PUT' : 'POST'
      
      if (city) {
        dataToSend.id = city._id
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          if (Array.isArray(data.details)) {
            throw new Error(data.details.map(d => `${d.field}: ${d.message}`).join(', '))
          } else {
            throw new Error(data.details)
          }
        }
        throw new Error(data.error || `Failed to ${city ? 'update' : 'create'} city`)
      }

      onSuccess(data.city)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Common Spanish provinces
  const provinces = [
    'Málaga', 'Cádiz', 'Sevilla', 'Córdoba', 'Huelva', 'Jaén', 'Almería', 'Granada',
    'Madrid', 'Barcelona', 'Valencia', 'Alicante', 'Murcia', 'Bilbao', 'Santander',
    'La Coruña', 'Vigo', 'Zaragoza', 'Palma', 'Las Palmas', 'Santa Cruz de Tenerife'
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {city ? 'Edit City' : 'Add New City'}
              </h3>
              {!city && searchMode && (
                <p className="text-sm text-gray-600 mt-1">
                  Search Google Maps to find and add cities quickly
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Google Search Mode (for new cities) */}
          {!city && searchMode && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Quick City Search</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Search for a Spanish city to automatically populate name, coordinates, and province data.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search for Spanish City
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCitySearch()}
                    placeholder="e.g., Marbella, Estepona, Benalmádena..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleCitySearch}
                    disabled={searchLoading || !searchQuery.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {searchLoading && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select City ({searchResults.length} found)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectCity(result)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedResult?.place_id === result.place_id
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{result.name}</div>
                        <div className="text-sm text-gray-600">{result.formatted_address}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          📍 {result.geometry?.location?.lat?.toFixed(4)}, {result.geometry?.location?.lng?.toFixed(4)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={handleManualMode}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Or Add Manually
                </button>
                
                {selectedResult && (
                  <button
                    onClick={handleManualMode}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Use Selected City
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Manual Form Mode */}
          {(!searchMode || city) && (
            <div className="space-y-4">
              {/* Google Data Preview */}
              {selectedResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">Google Maps Data Selected</h4>
                      <p className="text-sm text-green-800 mt-1">
                        <strong>{selectedResult.name}</strong> - GPS coordinates and province auto-detected. You can edit the fields below if needed.
                      </p>
                      <button
                        onClick={() => {
                          setSearchMode(true)
                          setSelectedResult(null)
                        }}
                        className="text-sm text-green-700 hover:text-green-900 mt-2"
                      >
                        ← Back to search
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spanish Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name.es}
                    onChange={(e) => handleChange('name.es', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                    placeholder="Málaga"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) => handleChange('name.en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                    placeholder="Malaga"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                  placeholder="malaga"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly identifier (lowercase, numbers, and hyphens only)
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => handleChange('province', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                  >
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                    placeholder="Spain"
                  />
                </div>
              </div>
              
              {/* Coordinates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPS Coordinates {selectedResult && <span className="text-green-600">(Auto-filled from Google)</span>}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.coordinates.lat || ''}
                      onChange={(e) => handleChange('coordinates.lat', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                      placeholder="Latitude (e.g., 36.7213)"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.coordinates.lng || ''}
                      onChange={(e) => handleChange('coordinates.lng', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                      placeholder="Longitude (e.g., -4.4214)"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Used for mapping and location-based features
                </p>
              </div>
              
              {/* Settings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Import Source
                  </label>
                  <select
                    value={formData.importSource}
                    onChange={(e) => handleChange('importSource', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                  >
                    <option value="manual">Manual</option>
                    <option value="google">Google</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
              
              {/* City Information */}
              {city && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">City Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Clubs:</span>
                      <span className="ml-2 font-medium">{city.clubCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium">
                        {new Date(city.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          
          {(!searchMode || city) && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (city ? 'Update City' : 'Create City')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
