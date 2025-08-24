'use client'

import { useState } from 'react'

export default function CityGoogleEnhancer({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, currentCity: '', stage: '' })
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [enhancementType, setEnhancementType] = useState('missing') // 'all', 'missing', 'selected'
  const [includePhotos, setIncludePhotos] = useState(true) // New option for photo enhancement

  const handleEnhancement = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    setProgress({ current: 0, total: 0, currentCity: '', stage: '' })

    try {
      const response = await fetch('/api/admin/cities/enhance-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          type: enhancementType,
          includePhotos: includePhotos
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Enhancement failed')
      }

      // Read the stream for progress updates
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            
            if (data.type === 'progress') {
              setProgress(data)
            } else if (data.type === 'result') {
              setResults(data)
            } else if (data.type === 'error') {
              setError(data.message)
            }
          } catch (e) {
            // Ignore parsing errors for partial chunks
          }
        }
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (results) {
      onSuccess() // Refresh the cities list
    }
    onClose()
  }

  // Helper to get stage description
  const getStageDescription = (stage) => {
    switch (stage) {
      case 'starting':
        return 'Initializing enhancement process...'
      case 'enhancing':
        return 'Fetching GPS coordinates and Google data...'
      case 'fetching_photos':
        return 'Downloading city photos...'
      default:
        return 'Processing...'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                🗺️ Enhance Cities with Google Maps
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Automatically fetch GPS coordinates, details, and photos from Google Maps API
              </p>
            </div>
            <button
              onClick={handleClose}
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
          {!loading && !results && (
            <div className="space-y-6">
              {/* Enhancement Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What cities do you want to enhance?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="missing"
                      checked={enhancementType === 'missing'}
                      onChange={(e) => setEnhancementType(e.target.value)}
                      className="text-parque-purple focus:ring-parque-purple"
                    />
                    <div>
                      <div className="font-medium">Cities missing GPS coordinates</div>
                      <div className="text-sm text-gray-500">Only enhance cities that don&apos;t have coordinates yet</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="all"
                      checked={enhancementType === 'all'}
                      onChange={(e) => setEnhancementType(e.target.value)}
                      className="text-parque-purple focus:ring-parque-purple"
                    />
                    <div>
                      <div className="font-medium">All cities</div>
                      <div className="text-sm text-gray-500">Update all cities with fresh Google Maps data</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Photo Enhancement Option */}
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={includePhotos}
                    onChange={(e) => setIncludePhotos(e.target.checked)}
                    className="mt-1 text-parque-purple focus:ring-parque-purple"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">📸 Include Photo Enhancement</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Automatically fetch and set city photos from Google Maps for frontend display. 
                      This will only add photos to cities that don&apos;t have a main image yet.
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      ⚡ Recommended: Photos enhance the visual appeal of the frontend leagues page
                    </div>
                  </div>
                </label>
              </div>

              {/* What will be enhanced */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">🔍 What will be enhanced:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>GPS Coordinates</strong> - Exact latitude and longitude</li>
                  <li>• <strong>Formatted Addresses</strong> - Official Google formatted addresses</li>
                  <li>• <strong>Place IDs</strong> - Unique Google identifiers for future use</li>
                  <li>• <strong>Geographic Data</strong> - Viewport bounds and location types</li>
                  <li>• <strong>Google Maps URLs</strong> - Direct links to Google Maps</li>
                  {includePhotos && (
                    <li>• <strong>📸 City Photos</strong> - High-quality images for frontend display</li>
                  )}
                </ul>
              </div>

              {/* API Key Check */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ Requirements:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Google Maps API key must be configured in environment variables</li>
                  <li>• Geocoding API must be enabled in Google Cloud Console</li>
                  {includePhotos && (
                    <li>• Places API must be enabled for photo downloads</li>
                  )}
                  <li>• Process respects rate limits ({includePhotos ? '150ms' : '100ms'} delay between requests)</li>
                </ul>
              </div>

              {/* Performance Note */}
              {includePhotos && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">🕒 Performance Note:</h4>
                  <p className="text-sm text-orange-800">
                    Photo enhancement will take longer as it makes additional API calls to fetch images. 
                    Each city requires 2 API calls (geocoding + photo details) instead of 1.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-parque-purple"></div>
                <p className="mt-2 text-gray-600">
                  Enhancing cities with Google Maps data{includePhotos && ' and photos'}...
                </p>
              </div>

              {progress.total > 0 && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress: {progress.current} of {progress.total}</span>
                    <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-parque-purple h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    ></div>
                  </div>
                  {progress.currentCity && (
                    <div className="text-sm text-gray-600 mt-2">
                      <p>
                        Currently processing: <strong>{progress.currentCity}</strong>
                      </p>
                      {progress.stage && (
                        <p className="text-xs text-gray-500 mt-1">
                          {getStageDescription(progress.stage)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">❌ Enhancement Failed</h4>
              <p className="text-sm text-red-800">{error}</p>
              <div className="mt-3">
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Results State */}
          {results && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3">✅ Enhancement Complete!</h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Enhanced:</span>
                    <span className="ml-2 font-medium">{results.enhanced || 0} cities</span>
                  </div>
                  <div>
                    <span className="text-green-700">Skipped:</span>
                    <span className="ml-2 font-medium">{results.skipped || 0} cities</span>
                  </div>
                  <div>
                    <span className="text-green-700">Errors:</span>
                    <span className="ml-2 font-medium">{results.errors || 0} cities</span>
                  </div>
                  <div>
                    <span className="text-green-700">API Calls:</span>
                    <span className="ml-2 font-medium">{results.apiCalls || 0}</span>
                  </div>
                  {includePhotos && results.photosAdded !== undefined && (
                    <div className="col-span-2">
                      <span className="text-green-700">Photos Added:</span>
                      <span className="ml-2 font-medium">{results.photosAdded} cities</span>
                    </div>
                  )}
                </div>

                {results.enhancedCities && results.enhancedCities.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-green-800 mb-2">Enhanced cities:</p>
                    <div className="text-xs text-green-700 max-h-20 overflow-y-auto">
                      {results.enhancedCities.join(', ')}
                    </div>
                  </div>
                )}

                {includePhotos && results.photosAdded > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">
                      📸 <strong>{results.photosAdded}</strong> cities now have main images that will be displayed 
                      on the frontend leagues page.
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!loading && !results && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleEnhancement}
              className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>
                Start Enhancement{includePhotos && ' + Photos'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
