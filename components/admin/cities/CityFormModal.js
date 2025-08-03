'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import CityImageManager from '@/components/admin/cities/CityImageManager'

export default function CityFormModal({ isOpen, onClose, city, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchMode, setSearchMode] = useState(!city) // Start in search mode for new cities
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  const [step, setStep] = useState(1) // Add step management: 1=search/form, 2=images
  const [cityPhotos, setCityPhotos] = useState([])
  const [photosLoading, setPhotosLoading] = useState(false)
  
  // Autocomplete states
  const [autocompleteResults, setAutocompleteResults] = useState([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(-1)
  const [autocompleteLoading, setAutocompleteLoading] = useState(false)
  
  const searchInputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const debounceRef = useRef(null)
  
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
    importSource: 'manual',
    images: {
      main: '',
      gallery: [],
      googlePhotoReference: null
    }
  })

  // Helper function to normalize text for accent-insensitive comparison
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove accents/diacritics
      .trim()
  }

  // Helper function to highlight matching text
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text
    
    const normalizedText = normalizeText(text)
    const normalizedQuery = normalizeText(query)
    
    // Find the start index of the match
    const matchIndex = normalizedText.indexOf(normalizedQuery)
    if (matchIndex === -1) return text
    
    // Extract the original text parts
    const beforeMatch = text.substring(0, matchIndex)
    const match = text.substring(matchIndex, matchIndex + normalizedQuery.length)
    const afterMatch = text.substring(matchIndex + normalizedQuery.length)
    
    return (
      <>
        {beforeMatch}
        <span className="bg-yellow-200 font-semibold">{match}</span>
        {afterMatch}
      </>
    )
  }

  // Initialize form data when editing
  useEffect(() => {
    if (city) {
      setSearchMode(false) // Editing mode, skip search
      setStep(1) // Start at form step for editing
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
        importSource: city.importSource || 'manual',
        images: city.images || {
          main: '',
          gallery: [],
          googlePhotoReference: null
        }
      })
      // For editing, also set any existing Google Photos data
      if (city.googleData?.photos) {
        setCityPhotos(city.googleData.photos)
      }
    } else {
      // Reset to initial state for new city
      setSearchMode(true)
      setStep(1)
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
        importSource: 'manual',
        images: {
          main: '',
          gallery: [],
          googlePhotoReference: null
        }
      })
      setCityPhotos([])
    }
    setError(null)
    setSearchQuery('')
    setSearchResults([])
    setSelectedResult(null)
    setAutocompleteResults([])
    setShowAutocomplete(false)
    setSelectedAutocompleteIndex(-1)
  }, [city, isOpen])

  // Debounced autocomplete search
  const performAutocompleteSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setAutocompleteResults([])
      setShowAutocomplete(false)
      return
    }

    setAutocompleteLoading(true)

    try {
      const response = await fetch('/api/admin/cities/search-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          types: ['locality', 'administrative_area_level_2']
        })
      })

      const data = await response.json()

      if (response.ok && data.results) {
        setAutocompleteResults(data.results.slice(0, 5)) // Limit to 5 for autocomplete
        setShowAutocomplete(true)
        setSelectedAutocompleteIndex(-1)
      }
    } catch (err) {
      console.error('Autocomplete search error:', err)
    } finally {
      setAutocompleteLoading(false)
    }
  }, [])

  // Handle input change with debounced autocomplete
  const handleSearchQueryChange = (value) => {
    setSearchQuery(value)
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // Set new debounce - reduced to 250ms for better responsiveness
    debounceRef.current = setTimeout(() => {
      performAutocompleteSearch(value)
    }, 250)
  }

  // Handle keyboard navigation in autocomplete
  const handleKeyDown = (e) => {
    if (!showAutocomplete || autocompleteResults.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleCitySearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedAutocompleteIndex(prev => 
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedAutocompleteIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedAutocompleteIndex >= 0) {
          handleSelectAutocomplete(autocompleteResults[selectedAutocompleteIndex])
        } else {
          handleCitySearch()
        }
        break
      
      case 'Escape':
        setShowAutocomplete(false)
        setSelectedAutocompleteIndex(-1)
        break
    }
  }

  // Select from autocomplete
  const handleSelectAutocomplete = (result) => {
    setSearchQuery(result.name)
    setShowAutocomplete(false)
    setSelectedAutocompleteIndex(-1)
    handleSelectCity(result)
  }

  // Hide autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowAutocomplete(false)
        setSelectedAutocompleteIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Search for cities using Google Maps
  const handleCitySearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a city name to search')
      return
    }

    setSearchLoading(true)
    setError(null)
    setSearchResults([])
    setShowAutocomplete(false)

    try {
      const response = await fetch('/api/admin/cities/search-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          types: ['locality', 'administrative_area_level_2'],
          includePhotos: true // Request photos during search
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search cities')
      }

      setSearchResults(data.results || [])
      
      if (data.results?.length === 0) {
        setError('No cities found. Try a different search term or check spelling.')
      }

    } catch (err) {
      console.error('City search error:', err)
      setError(err.message)
    } finally {
      setSearchLoading(false)
    }
  }

  // Fetch photos for a selected city
  const fetchCityPhotos = async (placeId, cityName) => {
    if (!placeId && !cityName) return

    setPhotosLoading(true)
    try {
      const response = await fetch('/api/admin/cities/fetch-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          placeId: placeId,
          cityName: cityName
        })
      })

      const data = await response.json()
      if (response.ok && data.photos) {
        setCityPhotos(data.photos)
        
        // Auto-set main image from first photo if no main image exists
        if (data.photos.length > 0 && !formData.images.main) {
          setFormData(prev => ({
            ...prev,
            images: {
              ...prev.images,
              main: data.photos[0].url,
              googlePhotoReference: data.photos[0].photo_reference
            },
            googleData: {
              ...(prev.googleData || {}),
              photos: data.photos
            }
          }))
        }
      }
    } catch (err) {
      console.error('Error fetching photos:', err)
    } finally {
      setPhotosLoading(false)
    }
  }

  // Select a city from search results
  const handleSelectCity = async (result) => {
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
    const newFormData = {
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
      importSource: 'google',
      images: {
        main: '',
        gallery: [],
        googlePhotoReference: null
      }
    }

    setFormData(newFormData)

    // Fetch photos for the selected city if they weren't included in search
    if (!result.photos && result.place_id) {
      await fetchCityPhotos(result.place_id, result.name)
    } else if (result.photos && result.photos.length > 0) {
      setCityPhotos(result.photos)
      // Auto-set main image from first photo
      setFormData(prev => ({
        ...prev,
        images: {
          ...prev.images,
          main: result.photos[0].url,
          googlePhotoReference: result.photos[0].photo_reference
        },
        googleData: {
          ...(prev.googleData || {}),
          photos: result.photos
        }
      }))
    }
  }

  // Switch to manual mode
  const handleManualMode = () => {
    setSearchMode(false)
    setSelectedResult(null)
    setShowAutocomplete(false)
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

  // Handle images update from CityImageManager
  const handleImagesUpdate = (updatedImages) => {
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }))
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
          viewport: selectedResult.geometry?.viewport,
          photos: cityPhotos // Include fetched photos
        }
        dataToSend.enhancedAt = new Date().toISOString()
      } else if (city && city.googleData) {
        // Preserve existing Google data for edited cities
        dataToSend.googleData = {
          ...city.googleData,
          photos: cityPhotos.length > 0 ? cityPhotos : city.googleData?.photos
        }
      }

      const url = '/api/admin/cities'
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

  // Helper to go to next step
  const handleNextStep = () => {
    if (step === 1 && validateForm()) {
      setStep(2)
    }
  }

  // Helper to go to previous step
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Helper to go directly to image management for editing cities
  const handleGoToImages = () => {
    if (city && validateForm()) {
      setStep(2)
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {city ? 'Edit City' : 'Add New City'}
              </h3>
              {!city && step === 1 && searchMode && (
                <p className="text-sm text-gray-600 mt-1">
                  Smart search with accent-insensitive matching and automatic photo import
                </p>
              )}
              {step === 1 && (!searchMode || city) && (
                <p className="text-sm text-gray-600 mt-1">
                  {city ? 'Edit city details and manage images' : 'Configure city details'}
                </p>
              )}
              {step === 2 && (
                <p className="text-sm text-gray-600 mt-1">
                  Manage city images for frontend display
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/* Step indicator - show for new cities or when editing and in step 2 */}
              {(!city || step === 2) && (
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 1 ? 'bg-parque-purple text-white' : step > 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                    1
                  </div>
                  <div className={`w-16 h-0.5 ${step > 1 ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 2 ? 'bg-parque-purple text-white' : step > 2 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                    2
                  </div>
                </div>
              )}
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
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Step 1: Google Search Mode or Form (for new cities) */}
          {step === 1 && !city && searchMode && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">🚀 Enhanced Smart City Search with Auto Photo Import</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Now automatically fetches city photos from Google Maps! Search supports accent-insensitive matching.
                    </p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1">
                      <li>• Works without accents: Malaga, Cordoba, Cadiz</li>
                      <li>• Automatically imports city photos for frontend display</li>
                      <li>• Use arrow keys ↑↓ to navigate, Enter to select</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="relative" ref={autocompleteRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search for Spanish City
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchQueryChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => searchQuery.length >= 2 && setShowAutocomplete(true)}
                      placeholder="Try: Malag, Cordoba, Cadiz..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    />
                    
                    {/* Loading indicator */}
                    {autocompleteLoading && (
                      <div className="absolute right-2 top-2">
                        <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}

                    {/* Autocomplete Dropdown */}
                    {showAutocomplete && autocompleteResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {autocompleteResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectAutocomplete(result)}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                              index === selectedAutocompleteIndex 
                                ? 'bg-blue-50 border-l-4 border-blue-500' 
                                : 'border-l-4 border-transparent'
                            } ${index !== autocompleteResults.length - 1 ? 'border-b border-gray-100' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {highlightMatch(result.name, searchQuery)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {result.address_components?.find(c => c.types.includes('administrative_area_level_2'))?.long_name || 'Spain'}
                                </div>
                              </div>
                              <div className="text-xs text-gray-400 ml-2">
                                📍 {result.geometry?.location?.lat?.toFixed(2)}, {result.geometry?.location?.lng?.toFixed(2)}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
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
                
                {/* Enhanced help text */}
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>💡 Use ↑↓ arrows to navigate suggestions, Enter to select, Esc to close</p>
                  <p>🎯 Accent-insensitive: "Malag" finds "Málaga", "Cordoba" finds "Córdoba"</p>
                  <p>📸 Automatically imports city photos for frontend display</p>
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
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {highlightMatch(result.name, searchQuery)}
                            </div>
                            <div className="text-sm text-gray-600">{result.formatted_address}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              📍 {result.geometry?.location?.lat?.toFixed(4)}, {result.geometry?.location?.lng?.toFixed(4)}
                            </div>
                          </div>
                          {result.photos && result.photos.length > 0 && (
                            <div className="ml-3 text-xs text-green-600">
                              📸 {result.photos.length} photos
                            </div>
                          )}
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

          {/* Step 1: Manual Form Mode */}
          {step === 1 && (!searchMode || city) && (
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
                        <strong>{selectedResult.name}</strong> - GPS coordinates, province, and photos auto-detected. 
                        You can edit the fields below if needed.
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

              {/* Current City Info for editing */}
              {city && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Editing: {city.name.es}</h4>
                      <p className="text-sm text-gray-600">
                        {city.clubCount || 0} clubs • Created {new Date(city.createdAt).toLocaleDateString()}
                        {city.googlePlaceId && ' • Google Enhanced'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {city.images?.main && (
                        <span className="text-xs text-green-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          Has Images
                        </span>
                      )}
                      <button
                        onClick={handleGoToImages}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Manage Images
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
              
              {/* Photos preview if available */}
              {(cityPhotos.length > 0 || (city && city.googleData?.photos)) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">
                    📸 Available Photos ({cityPhotos.length || city?.googleData?.photos?.length || 0} found)
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {(cityPhotos.length > 0 ? cityPhotos : city?.googleData?.photos || []).slice(0, 6).map((photo, index) => {
                      const photoUrl = photo.url || `/api/admin/cities/google-photo?photo_reference=${photo.photo_reference}&maxwidth=400`
                      return (
                        <div key={index} className="relative">
                          <img
                            src={photoUrl}
                            alt={`${formData.name.es} photo ${index + 1}`}
                            className="w-full h-16 object-cover rounded border"
                            onError={(e) => {
                              e.target.src = `https://images.unsplash.com/400x300/?city,${formData.name.es || 'spain'},landscape`
                            }}
                          />
                          {index === 0 && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded-bl">
                              Main
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-sm text-green-800 mt-2">
                    {formData.images.main ? 'Main image set.' : 'Main image will be set from first photo.'} You can manage all images in step 2.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Images Management */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">City Image Management</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Manage city images that will be displayed on the frontend leagues page. 
                      You can use Google Photos or upload custom images.
                    </p>
                  </div>
                </div>
              </div>

              <CityImageManager
                city={{
                  ...formData,
                  googleData: {
                    ...(formData.googleData || {}),
                    photos: cityPhotos.length > 0 ? cityPhotos : (city?.googleData?.photos || [])
                  }
                }}
                onImagesUpdate={handleImagesUpdate}
                readOnly={false}
              />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            
            {step > 1 && (
              <button
                onClick={handlePrevStep}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ← Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {step === 1 && (!searchMode || city) && (
              <>
                {!city && (
                  <button
                    onClick={handleNextStep}
                    disabled={!validateForm()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Images →
                  </button>
                )}
                
                {city && (
                  <>
                    <button
                      onClick={handleGoToImages}
                      disabled={!validateForm()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Manage Images
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : 'Update City'}
                    </button>
                  </>
                )}
              </>
            )}
            
            {step === 2 && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (city ? 'Updating...' : 'Creating...') : (city ? 'Update City' : 'Create City')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
