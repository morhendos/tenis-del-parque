'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateSeasonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState({
    cities: [],
    existingLeagues: [],
    leagueGroups: {},
    skillLevels: [],
    seasonTypes: [],
    statusOptions: []
  })
  
  const [formData, setFormData] = useState({
    type: 'new_season', // 'new_season' or 'new_league'
    baseLeagueId: '',
    
    // Common fields
    name: '',
    cityId: '',
    skillLevel: 'all',
    season: {
      year: new Date().getFullYear(),
      type: 'spring',
      number: 1
    },
    seasonConfig: {
      startDate: '',
      endDate: '',
      registrationStart: '',
      registrationEnd: '',
      maxPlayers: 20,
      minPlayers: 8,
      price: {
        amount: 0,
        currency: 'EUR',
        isFree: true
      }
    },
    status: 'coming_soon',
    expectedLaunchDate: '',
    description: {
      es: '',
      en: ''
    },
    contact: {
      email: '',
      whatsapp: '',
      website: ''
    }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/leagues/seasons/create')
      if (res.ok) {
        const data = await res.json()
        setData(data)
      } else {
        throw new Error('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        isNewLeague: formData.type === 'new_league',
        baseLeagueId: formData.type === 'new_season' ? formData.baseLeagueId : null,
        seasonData: {
          name: formData.name,
          cityId: formData.cityId,
          skillLevel: formData.skillLevel,
          season: formData.season,
          seasonConfig: formData.seasonConfig,
          status: formData.status,
          expectedLaunchDate: formData.expectedLaunchDate || null,
          description: formData.description,
          contact: formData.contact
        }
      }

      const res = await fetch('/api/admin/leagues/seasons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await res.json()

      if (res.ok) {
        alert(`${formData.type === 'new_league' ? 'League' : 'Season'} created successfully!`)
        router.push('/admin/leagues')
      } else {
        throw new Error(result.error || 'Failed to create')
      }
    } catch (error) {
      console.error('Error creating:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const generateName = () => {
    if (!formData.cityId || !formData.skillLevel || !formData.season.type || !formData.season.year) return

    const city = data.cities.find(c => c._id === formData.cityId)
    const skillLevel = data.skillLevels.find(s => s.value === formData.skillLevel)
    const seasonType = data.seasonTypes.find(s => s.value === formData.season.type)

    if (city && skillLevel && seasonType) {
      const cityName = city.name.es
      const skillName = skillLevel.value === 'all' ? '' : ` ${skillLevel.label.es}`
      const seasonName = `${seasonType.label.es} ${formData.season.year}`
      const seasonNumber = formData.season.number > 1 ? ` - Temporada ${formData.season.number}` : ''
      
      const generatedName = `Liga ${cityName}${skillName} ${seasonName}${seasonNumber}`
      setFormData(prev => ({ ...prev, name: generatedName }))
    }
  }

  useEffect(() => {
    generateName()
  }, [formData.cityId, formData.skillLevel, formData.season, data.cities, data.skillLevels, data.seasonTypes])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Season/League</h1>
        <p className="text-gray-600 mt-2">
          Create a new season for an existing league or start a completely new league
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Type Selection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Type</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                value="new_season"
                checked={formData.type === 'new_season'}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="mr-3"
              />
              <div>
                <span className="font-medium">New Season</span>
                <p className="text-sm text-gray-600">Add another season to an existing league</p>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="new_league"
                checked={formData.type === 'new_league'}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="mr-3"
              />
              <div>
                <span className="font-medium">New League</span>
                <p className="text-sm text-gray-600">Create a completely new league (different skill level or city)</p>
              </div>
            </label>
          </div>
        </div>

        {/* Base League Selection (for new season) */}
        {formData.type === 'new_season' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Base League</h2>
            <select
              value={formData.baseLeagueId}
              onChange={(e) => setFormData(prev => ({ ...prev, baseLeagueId: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">Select existing league...</option>
              {data.existingLeagues.map(league => (
                <option key={league._id} value={league._id}>
                  {league.name} ({league.city?.name.es}) - {league.status}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">League Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border rounded-lg"
                placeholder="Will be auto-generated"
                required
              />
            </div>

            {formData.type === 'new_league' && (
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <select
                  value={formData.cityId}
                  onChange={(e) => setFormData(prev => ({ ...prev, cityId: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Select city...</option>
                  {data.cities.map(city => (
                    <option key={city._id} value={city._id}>
                      {city.name.es}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Skill Level</label>
              <select
                value={formData.skillLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              >
                {data.skillLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label.es}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              >
                {data.statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label.es}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Season Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Season Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input
                type="number"
                value={formData.season.year}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  season: { ...prev.season, year: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border rounded-lg"
                min="2024"
                max="2030"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Season Type</label>
              <select
                value={formData.season.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  season: { ...prev.season, type: e.target.value }
                }))}
                className="w-full p-3 border rounded-lg"
              >
                {data.seasonTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label.es}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Season Number</label>
              <input
                type="number"
                value={formData.season.number}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  season: { ...prev.season, number: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border rounded-lg"
                min="1"
                max="10"
              />
            </div>
          </div>

          {formData.status === 'coming_soon' && (
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Expected Launch Date</label>
              <input
                type="date"
                value={formData.expectedLaunchDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedLaunchDate: e.target.value }))}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
          )}
        </div>

        {/* Season Configuration */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Season Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={formData.seasonConfig.startDate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  seasonConfig: { ...prev.seasonConfig, startDate: e.target.value }
                }))}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={formData.seasonConfig.endDate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  seasonConfig: { ...prev.seasonConfig, endDate: e.target.value }
                }))}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Registration Start</label>
              <input
                type="date"
                value={formData.seasonConfig.registrationStart}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  seasonConfig: { ...prev.seasonConfig, registrationStart: e.target.value }
                }))}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Registration End</label>
              <input
                type="date"
                value={formData.seasonConfig.registrationEnd}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  seasonConfig: { ...prev.seasonConfig, registrationEnd: e.target.value }
                }))}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Players</label>
              <input
                type="number"
                value={formData.seasonConfig.maxPlayers}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  seasonConfig: { ...prev.seasonConfig, maxPlayers: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border rounded-lg"
                min="8"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Min Players</label>
              <input
                type="number"
                value={formData.seasonConfig.minPlayers}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  seasonConfig: { ...prev.seasonConfig, minPlayers: parseInt(e.target.value) }
                }))}
                className="w-full p-3 border rounded-lg"
                min="4"
                max="20"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Pricing</h3>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={formData.seasonConfig.price.isFree}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  seasonConfig: { 
                    ...prev.seasonConfig, 
                    price: { ...prev.seasonConfig.price, isFree: e.target.checked }
                  }
                }))}
                className="mr-3"
              />
              <label>Free League</label>
            </div>
            
            {!formData.seasonConfig.price.isFree && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price Amount</label>
                  <input
                    type="number"
                    value={formData.seasonConfig.price.amount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      seasonConfig: { 
                        ...prev.seasonConfig, 
                        price: { ...prev.seasonConfig.price, amount: parseFloat(e.target.value) }
                      }
                    }))}
                    className="w-full p-3 border rounded-lg"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={formData.seasonConfig.price.currency}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      seasonConfig: { 
                        ...prev.seasonConfig, 
                        price: { ...prev.seasonConfig.price, currency: e.target.value }
                      }
                    }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : `Create ${formData.type === 'new_league' ? 'League' : 'Season'}`}
          </button>
        </div>
      </form>
    </div>
  )
}
