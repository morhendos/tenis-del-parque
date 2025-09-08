'use client'

import { useState, useEffect } from 'react'

export default function LeagueSeasonEditor({ leagueId, onClose, onUpdate }) {
  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seasonData, setSeasonData] = useState({
    type: 'summer',
    year: 2025,
    number: 1
  })
  const [seasonConfig, setSeasonConfig] = useState({
    startDate: '',
    endDate: '',
    registrationStart: '',
    registrationEnd: '',
    maxPlayers: 24,
    minPlayers: 8,
    price: {
      amount: 0,
      currency: 'EUR',
      isFree: true
    }
  })

  useEffect(() => {
    fetchLeague()
  }, [leagueId])

  const fetchLeague = async () => {
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}`)
      const data = await response.json()
      
      if (data.success) {
        setLeague(data.league)
        
        // Pre-fill form if league has existing season data
        if (data.league.season) {
          setSeasonData(data.league.season)
        }
        if (data.league.seasonConfig) {
          setSeasonConfig({
            ...seasonConfig,
            ...data.league.seasonConfig,
            startDate: data.league.seasonConfig.startDate ? 
              new Date(data.league.seasonConfig.startDate).toISOString().split('T')[0] : '',
            endDate: data.league.seasonConfig.endDate ? 
              new Date(data.league.seasonConfig.endDate).toISOString().split('T')[0] : '',
            registrationStart: data.league.seasonConfig.registrationStart ? 
              new Date(data.league.seasonConfig.registrationStart).toISOString().split('T')[0] : '',
            registrationEnd: data.league.seasonConfig.registrationEnd ? 
              new Date(data.league.seasonConfig.registrationEnd).toISOString().split('T')[0] : ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching league:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          season: seasonData,
          seasonConfig: {
            ...seasonConfig,
            startDate: seasonConfig.startDate ? new Date(seasonConfig.startDate) : null,
            endDate: seasonConfig.endDate ? new Date(seasonConfig.endDate) : null,
            registrationStart: seasonConfig.registrationStart ? new Date(seasonConfig.registrationStart) : null,
            registrationEnd: seasonConfig.registrationEnd ? new Date(seasonConfig.registrationEnd) : null,
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ League updated:', data.league)
        onUpdate?.(data.league)
        onClose?.()
      } else {
        throw new Error('Failed to update league')
      }
    } catch (error) {
      console.error('Error updating league:', error)
      alert('Error updating league: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading league data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Season Data: {league?.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Season Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Season Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Season Type
                  </label>
                  <select
                    value={seasonData.type}
                    onChange={(e) => setSeasonData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="spring">Spring / Primavera</option>
                    <option value="summer">Summer / Verano</option>
                    <option value="autumn">Autumn / Otoño</option>
                    <option value="winter">Winter / Invierno</option>
                    <option value="annual">Annual / Anual</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={seasonData.year}
                    onChange={(e) => setSeasonData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="2024"
                    max="2030"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Season Number
                  </label>
                  <input
                    type="number"
                    value={seasonData.number}
                    onChange={(e) => setSeasonData(prev => ({ ...prev, number: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    max="10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Season Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Season Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={seasonConfig.startDate}
                    onChange={(e) => setSeasonConfig(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={seasonConfig.endDate}
                    onChange={(e) => setSeasonConfig(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Start
                  </label>
                  <input
                    type="date"
                    value={seasonConfig.registrationStart}
                    onChange={(e) => setSeasonConfig(prev => ({ ...prev, registrationStart: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration End
                  </label>
                  <input
                    type="date"
                    value={seasonConfig.registrationEnd}
                    onChange={(e) => setSeasonConfig(prev => ({ ...prev, registrationEnd: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Players
                  </label>
                  <input
                    type="number"
                    value={seasonConfig.maxPlayers}
                    onChange={(e) => setSeasonConfig(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="8"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Players
                  </label>
                  <input
                    type="number"
                    value={seasonConfig.minPlayers}
                    onChange={(e) => setSeasonConfig(prev => ({ ...prev, minPlayers: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="4"
                    max="50"
                  />
                </div>
              </div>
            </div>

            {/* Price Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Price</h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={seasonConfig.price.isFree}
                    onChange={(e) => setSeasonConfig(prev => ({
                      ...prev,
                      price: { ...prev.price, isFree: e.target.checked, amount: e.target.checked ? 0 : prev.price.amount }
                    }))}
                    className="mr-2"
                  />
                  Free League
                </label>
                
                {!seasonConfig.price.isFree && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={seasonConfig.price.amount}
                      onChange={(e) => setSeasonConfig(prev => ({
                        ...prev,
                        price: { ...prev.price, amount: parseFloat(e.target.value) }
                      }))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      step="0.01"
                    />
                    <span>EUR</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-parque-purple text-white rounded-md hover:bg-parque-purple/90 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Update League'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
