'use client'

import { useState, useEffect } from 'react'

export default function LeagueCityLinker() {
  const [leagues, setLeagues] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch leagues with populated city data
      const leaguesResponse = await fetch('/api/admin/leagues')
      const leaguesData = await leaguesResponse.json()
      
      // Fetch all cities
      const citiesResponse = await fetch('/api/admin/cities')
      const citiesData = await citiesResponse.json()
      
      setLeagues(leaguesData.leagues || [])
      setCities(citiesData.cities || [])
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'error', text: 'Error loading data' })
    } finally {
      setLoading(false)
    }
  }

  const linkLeagueToCity = async (leagueId, cityId) => {
    try {
      setUpdating(prev => ({ ...prev, [leagueId]: true }))
      
      const response = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: cityId || null
        })
      })

      if (response.ok) {
        const updatedLeague = await response.json()
        
        // Update the local state
        setLeagues(prev => prev.map(league => 
          league._id === leagueId 
            ? { ...league, city: cityId }
            : league
        ))
        
        const cityName = cityId ? cities.find(c => c._id === cityId)?.name?.es : 'No city'
        const leagueName = leagues.find(l => l._id === leagueId)?.name
        
        setMessage({ 
          type: 'success', 
          text: `✅ "${leagueName}" successfully ${cityId ? 'linked to' : 'unlinked from'} "${cityName}"` 
        })
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
        
      } else {
        throw new Error('Failed to update league-city connection')
      }
    } catch (error) {
      console.error('Error updating league-city connection:', error)
      setMessage({ type: 'error', text: 'Failed to update connection' })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setUpdating(prev => ({ ...prev, [leagueId]: false }))
    }
  }

  const getRegistrationUrl = (league) => {
    return `/es/registro/${league.slug}`
  }

  const getCityClubsUrl = (citySlug) => {
    return `/es/clubes/${citySlug}`
  }

  // Quick action suggestions based on common patterns
  const getQuickSuggestions = (league) => {
    const suggestions = []
    const slug = league.slug.toLowerCase()
    
    if (slug.includes('malaga') && !league.city) {
      const malagaCity = cities.find(c => c.slug === 'malaga')
      if (malagaCity) {
        suggestions.push({ city: malagaCity, reason: 'Contains "malaga" in slug' })
      }
    }
    
    if (slug.includes('marbella') && !league.city) {
      const marbellaCity = cities.find(c => c.slug === 'marbella')
      if (marbellaCity) {
        suggestions.push({ city: marbellaCity, reason: 'Contains "marbella" in slug' })
      }
    }
    
    if (slug.includes('estepona') && !league.city) {
      const esteponaCity = cities.find(c => c.slug === 'estepona')
      if (esteponaCity) {
        suggestions.push({ city: esteponaCity, reason: 'Contains "estepona" in slug' })
      }
    }
    
    return suggestions
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          League-City Connections
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Link leagues to cities so club pages redirect to the correct registration URLs
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mx-6 mt-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Leagues List */}
      <div className="p-6 space-y-4">
        {leagues.map((league) => {
          const connectedCity = cities.find(city => city._id === league.city)
          const suggestions = getQuickSuggestions(league)
          const isUpdating = updating[league._id]
          
          return (
            <div key={league._id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              {/* League Info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {league.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Slug: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{league.slug}</code>
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    <a 
                      href={getRegistrationUrl(league)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Registration: {getRegistrationUrl(league)} →
                    </a>
                  </p>
                </div>
                
                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {connectedCity ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⚠️ Not connected
                    </span>
                  )}
                </div>
              </div>

              {/* Current Connection */}
              {connectedCity && (
                <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Currently linked to: <strong>{connectedCity.name.es}</strong>
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Club pages in {connectedCity.slug} will redirect to this league
                        <a 
                          href={getCityClubsUrl(connectedCity.slug)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 hover:underline"
                        >
                          View clubs →
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    💡 Suggested connection:
                  </p>
                  {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700">
                          <strong>{suggestion.city.name.es}</strong> ({suggestion.city.slug})
                        </p>
                        <p className="text-xs text-blue-600">{suggestion.reason}</p>
                      </div>
                      <button
                        onClick={() => linkLeagueToCity(league._id, suggestion.city._id)}
                        disabled={isUpdating}
                        className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isUpdating ? 'Linking...' : 'Quick Link'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* City Selection */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link to city:
                  </label>
                  <select
                    value={league.city || ''}
                    onChange={(e) => linkLeagueToCity(league._id, e.target.value || null)}
                    disabled={isUpdating}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="">Select a city...</option>
                    {cities.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.name.es} ({city.slug})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Unlink Button */}
                {connectedCity && (
                  <div className="flex-shrink-0 pt-6">
                    <button
                      onClick={() => linkLeagueToCity(league._id, null)}
                      disabled={isUpdating}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
                    >
                      {isUpdating ? 'Unlinking...' : 'Unlink'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          <h4 className="font-medium mb-2">🎯 How this fixes the registration flow:</h4>
          <ul className="space-y-1 text-xs">
            <li>• Club pages in linked cities will redirect to the correct league registration</li>
            <li>• Example: Malaga club → &quot;Join League&quot; → /es/registro/liga-de-malaga ✅</li>
            <li>• Unlinked cities fall back to /es/registro/{'{city}'} (may result in 404)</li>
            <li>• Each city should have at most one active league linked</li>
          </ul>
        </div>
      </div>
    </div>
  )
}