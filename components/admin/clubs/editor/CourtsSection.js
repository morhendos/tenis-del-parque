'use client'

export default function CourtsSection({ formData, handleChange }) {
  // Handle court number changes
  const handleCourtChange = (sport, type, value) => {
    const num = parseInt(value) || 0
    handleChange(`courts.${sport}.${type}`, num)
    
    // Auto-calculate total
    if (type === 'indoor' || type === 'outdoor') {
      const indoor = type === 'indoor' ? num : (formData.courts[sport]?.indoor || 0)
      const outdoor = type === 'outdoor' ? num : (formData.courts[sport]?.outdoor || 0)
      handleChange(`courts.${sport}.total`, indoor + outdoor)
    }
  }

  // Calculate total courts across all sports
  const getTotalCourts = () => {
    return (formData.courts.tennis?.total || 0) + 
           (formData.courts.padel?.total || 0) + 
           (formData.courts.pickleball?.total || 0)
  }

  const sports = [
    { id: 'tennis', name: 'Tennis', icon: '🎾', color: 'green' },
    { id: 'padel', name: 'Padel', icon: '🏸', color: 'blue' },
    { id: 'pickleball', name: 'Pickleball', icon: '🏓', color: 'orange' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Courts & Sports</h2>
        <p className="text-gray-600">Add the number of courts for each sport</p>
      </div>

      {/* Total Courts Summary */}
      <div className="bg-gradient-to-r from-parque-purple to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm mb-1">Total Courts</p>
            <p className="text-4xl font-bold">{getTotalCourts()}</p>
          </div>
          <div className="text-6xl opacity-20">🏟️</div>
        </div>
        {getTotalCourts() === 0 && (
          <p className="mt-3 text-purple-100 text-sm">
            ⚠️ At least one court is required
          </p>
        )}
      </div>

      {/* Sports Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sports.map(sport => {
          const sportData = formData.courts[sport.id] || { total: 0, indoor: 0, outdoor: 0 }
          const hasData = sportData.total > 0
          
          return (
            <div 
              key={sport.id}
              className={`
                bg-white rounded-lg shadow-sm border-2 transition-all
                ${hasData ? 'border-' + sport.color + '-500 shadow-md' : 'border-gray-200'}
              `}
            >
              {/* Sport Header */}
              <div className={`
                p-4 border-b ${hasData ? 'bg-' + sport.color + '-50' : 'bg-gray-50'}
              `}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{sport.icon}</span>
                    <h3 className="font-semibold text-gray-900">{sport.name}</h3>
                  </div>
                  {hasData && (
                    <span className={`
                      px-2 py-1 text-xs font-semibold rounded-full
                      bg-${sport.color}-100 text-${sport.color}-800
                    `}>
                      {sportData.total} courts
                    </span>
                  )}
                </div>
              </div>

              {/* Court Inputs */}
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Indoor Courts
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sportData.indoor}
                    onChange={(e) => handleCourtChange(sport.id, 'indoor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Outdoor Courts
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sportData.outdoor}
                    onChange={(e) => handleCourtChange(sport.id, 'outdoor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Total Display */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {sportData.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Quick Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Tennis:</strong> Traditional tennis courts</li>
          <li>• <strong>Padel:</strong> Very popular in Spain, smaller enclosed courts</li>
          <li>• <strong>Pickleball:</strong> Growing sport, especially in the US</li>
          <li>• Indoor courts are great for year-round play</li>
          <li>• The total is automatically calculated from indoor + outdoor</li>
        </ul>
      </div>
    </div>
  )
}