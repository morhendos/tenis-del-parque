'use client'

import { useState } from 'react'

export default function CourtsManager({ formData, handleChange }) {
  const [activeTab, setActiveTab] = useState('tennis')
  const [newSurface, setNewSurface] = useState({
    tennis: { type: 'clay', count: 1 },
    padel: { type: 'synthetic', count: 1 },
    pickleball: { type: 'hard', count: 1 }
  })

  // Initialize courts structure if not present
  if (!formData.courts) {
    formData.courts = {
      tennis: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
      padel: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
      pickleball: { total: 0, indoor: 0, outdoor: 0, surfaces: [] }
    }
  }

  // Ensure all court types are initialized
  if (!formData.courts.tennis) formData.courts.tennis = { total: 0, indoor: 0, outdoor: 0, surfaces: [] }
  if (!formData.courts.padel) formData.courts.padel = { total: 0, indoor: 0, outdoor: 0, surfaces: [] }
  if (!formData.courts.pickleball) formData.courts.pickleball = { total: 0, indoor: 0, outdoor: 0, surfaces: [] }

  const handleCourtChange = (sport, field, value) => {
    const newValue = parseInt(value) || 0
    handleChange(`courts.${sport}.${field}`, newValue)
    
    // Auto-calculate total when indoor or outdoor changes
    if (field === 'indoor' || field === 'outdoor') {
      const indoor = field === 'indoor' ? newValue : formData.courts[sport].indoor || 0
      const outdoor = field === 'outdoor' ? newValue : formData.courts[sport].outdoor || 0
      handleChange(`courts.${sport}.total`, indoor + outdoor)
    }
  }

  const addSurface = (sport) => {
    const surface = newSurface[sport]
    if (surface.type && surface.count > 0) {
      const currentSurfaces = formData.courts[sport].surfaces || []
      handleChange(`courts.${sport}.surfaces`, [...currentSurfaces, surface])
      setNewSurface(prev => ({
        ...prev,
        [sport]: sport === 'tennis' ? { type: 'clay', count: 1 } :
                 sport === 'padel' ? { type: 'synthetic', count: 1 } :
                 { type: 'hard', count: 1 }
      }))
    }
  }

  const removeSurface = (sport, index) => {
    const surfaces = [...(formData.courts[sport].surfaces || [])]
    surfaces.splice(index, 1)
    handleChange(`courts.${sport}.surfaces`, surfaces)
  }

  const getSurfaceOptions = (sport) => {
    switch (sport) {
      case 'tennis':
        return ['clay', 'hard', 'grass', 'synthetic', 'carpet']
      case 'padel':
        return ['synthetic', 'glass', 'concrete']
      case 'pickleball':
        return ['hard', 'synthetic', 'wood']
      default:
        return []
    }
  }

  const getTotalAllCourts = () => {
    return (formData.courts.tennis?.total || 0) + 
           (formData.courts.padel?.total || 0) + 
           (formData.courts.pickleball?.total || 0)
  }

  const renderCourtSection = (sport) => {
    const sportData = formData.courts[sport] || { total: 0, indoor: 0, outdoor: 0, surfaces: [] }
    const surfaceOptions = getSurfaceOptions(sport)
    const sportLabel = sport.charAt(0).toUpperCase() + sport.slice(1)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Indoor {sportLabel} Courts
            </label>
            <input
              type="number"
              min="0"
              value={sportData.indoor}
              onChange={(e) => handleCourtChange(sport, 'indoor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outdoor {sportLabel} Courts
            </label>
            <input
              type="number"
              min="0"
              value={sportData.outdoor}
              onChange={(e) => handleCourtChange(sport, 'outdoor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            <strong>Total {sportLabel} Courts: {sportData.total}</strong> 
            <span className="text-xs ml-2 text-gray-500">(Automatically calculated)</span>
          </p>
        </div>
        
        {/* Court Surfaces */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {sportLabel} Court Surfaces (Optional)
          </label>
          
          {(sportData.surfaces || []).map((surface, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <span className="flex-1 text-sm">
                {surface.count} {surface.type} court{surface.count !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={() => removeSurface(sport, index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className="flex items-center space-x-2 mt-2">
            <select
              value={newSurface[sport].type}
              onChange={(e) => setNewSurface(prev => ({
                ...prev,
                [sport]: { ...prev[sport], type: e.target.value }
              }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            >
              {surfaceOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              min="1"
              value={newSurface[sport].count}
              onChange={(e) => setNewSurface(prev => ({
                ...prev,
                [sport]: { ...prev[sport], count: parseInt(e.target.value) || 1 }
              }))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            />
            
            <button
              type="button"
              onClick={() => addSurface(sport)}
              className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total Courts Summary */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-lg font-semibold text-yellow-800">
          Total Courts Across All Sports: {getTotalAllCourts()}
        </p>
        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
          <div>
            <span className="text-gray-600">Tennis:</span> 
            <span className="font-medium ml-1">{formData.courts.tennis?.total || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Padel:</span> 
            <span className="font-medium ml-1">{formData.courts.padel?.total || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Pickleball:</span> 
            <span className="font-medium ml-1">{formData.courts.pickleball?.total || 0}</span>
          </div>
        </div>
      </div>

      {/* Sport Tabs */}
      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['tennis', 'padel', 'pickleball'].map(sport => {
              const isActive = activeTab === sport
              const count = formData.courts[sport]?.total || 0
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setActiveTab(sport)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${isActive 
                      ? 'border-parque-purple text-parque-purple' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <span>{sport === 'tennis' ? '🎾' : sport === 'padel' ? '🏸' : '🏓'}</span>
                    <span>{sport.charAt(0).toUpperCase() + sport.slice(1)}</span>
                    {count > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                        {count}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {renderCourtSection(activeTab)}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="text-blue-800 font-medium mb-1">💡 Tips:</p>
        <ul className="text-blue-700 space-y-1 text-xs">
          <li>• Add tennis courts for traditional tennis play</li>
          <li>• Add padel courts if the club offers padel (popular in Spain)</li>
          <li>• Add pickleball courts for this growing sport (especially in the US)</li>
          <li>• Surface types help players know what to expect</li>
          <li>• Indoor/outdoor counts help with weather planning</li>
        </ul>
      </div>
    </div>
  )
}
