'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export default function GoogleSearchSection({ onSelect, onSkip }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  const [error, setError] = useState(null)
  
  // Autocomplete states
  const [autocompleteResults, setAutocompleteResults] = useState([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(-1)
  const [autocompleteLoading, setAutocompleteLoading] = useState(false)
  
  const searchInputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const debounceRef = useRef(null)

  // Helper function to normalize text for accent-insensitive comparison
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  // Helper function to highlight matching text
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text
    
    const normalizedText = normalizeText(text)
    const normalizedQuery = normalizeText(query)
    
    const matchIndex = normalizedText.indexOf(normalizedQuery)
    if (matchIndex === -1) return text
    
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
        setAutocompleteResults(data.results.slice(0, 5))
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
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
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
          includePhotos: true
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

  // Select a city and fetch photos
  const handleSelectCity = async (result) => {
    setSelectedResult(result)
    
    // Fetch photos if not already included
    let photos = result.photos || []
    
    if (!result.photos && result.place_id) {
      try {
        const response = await fetch('/api/admin/cities/fetch-photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            placeId: result.place_id,
            cityName: result.name
          })
        })

        const data = await response.json()
        if (response.ok && data.photos) {
          photos = data.photos
        }
      } catch (err) {
        console.error('Error fetching photos:', err)
      }
    }
    
    // Pass the selected result and photos to parent
    onSelect(result, photos)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Google Maps City Search</h2>
        <p className="text-gray-600">
          Search for Spanish cities to automatically import location data and photos
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900">🚀 Smart Search Features</h4>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>✓ Accent-insensitive: &quot;Malaga&quot; finds &quot;Málaga&quot;</li>
              <li>✓ Auto-imports GPS coordinates</li>
              <li>✓ Fetches city photos from Google</li>
              <li>✓ Detects province automatically</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search Input */}
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
              placeholder="Try: Malaga, Cordoba, Cadiz..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
            />
            
            {/* Loading indicator */}
            {autocompleteLoading && (
              <div className="absolute right-3 top-2.5">
                <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
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
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      index === selectedAutocompleteIndex 
                        ? 'bg-purple-50 border-l-4 border-purple-500' 
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
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {searchLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            )}
            <span>Search</span>
          </button>
        </div>
        
        {/* Help text */}
        <div className="text-xs text-gray-500 mt-2">
          💡 Use ↑↓ arrows to navigate • Enter to select • Esc to close
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Search Results ({searchResults.length} found)
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectCity(result)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedResult?.place_id === result.place_id
                    ? 'bg-purple-100 border-2 border-purple-500 shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-lg">
                      {highlightMatch(result.name, searchQuery)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{result.formatted_address}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      📍 {result.geometry?.location?.lat?.toFixed(4)}, {result.geometry?.location?.lng?.toFixed(4)}
                    </div>
                  </div>
                  {result.photos && result.photos.length > 0 && (
                    <div className="ml-4 text-sm text-green-600 font-medium">
                      📸 {result.photos.length} photos
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skip Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onSkip}
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          Skip and enter manually →
        </button>
      </div>
    </div>
  )
}
