'use client'

export default function AmenitiesSection({ formData, handleChange }) {
  const amenityGroups = [
    {
      title: 'Essential Facilities',
      icon: '🏢',
      items: [
        { id: 'parking', label: 'Parking', icon: '🅿️' },
        { id: 'lighting', label: 'Court Lighting', icon: '💡' },
        { id: 'changingRooms', label: 'Changing Rooms', icon: '🚪' },
        { id: 'showers', label: 'Showers', icon: '🚿' },
        { id: 'lockers', label: 'Lockers', icon: '🔒' },
        { id: 'wheelchair', label: 'Wheelchair Access', icon: '♿' }
      ]
    },
    {
      title: 'Premium Amenities',
      icon: '✨',
      items: [
        { id: 'proShop', label: 'Pro Shop', icon: '🏪' },
        { id: 'restaurant', label: 'Restaurant/Bar', icon: '🍴' },
        { id: 'swimming', label: 'Swimming Pool', icon: '🏊' },
        { id: 'gym', label: 'Gym/Fitness', icon: '🏋️' },
        { id: 'sauna', label: 'Sauna/Spa', icon: '🧖' },
        { id: 'physio', label: 'Physiotherapy', icon: '🏥' }
      ]
    }
  ]

  const services = [
    { id: 'lessons', label: 'Private Lessons', icon: '🎯' },
    { id: 'coaching', label: 'Group Coaching', icon: '👥' },
    { id: 'stringing', label: 'Racket Stringing', icon: '🪀' },
    { id: 'tournaments', label: 'Tournaments', icon: '🏆' },
    { id: 'summerCamps', label: 'Summer Camps', icon: '☀️' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Amenities & Services</h2>
        <p className="text-gray-600">Select the facilities and services available at this club</p>
      </div>

      {/* Amenities */}
      <div className="space-y-6">
        {amenityGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">{group.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {group.items.map((amenity) => {
                const isChecked = formData.amenities[amenity.id]
                return (
                  <label
                    key={amenity.id}
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${isChecked 
                        ? 'border-parque-purple bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleChange(`amenities.${amenity.id}`, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`
                      w-5 h-5 rounded flex items-center justify-center transition-colors
                      ${isChecked ? 'bg-parque-purple' : 'bg-gray-200'}
                    `}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{amenity.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        ))}

        {/* Services */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🎓</span>
            <h3 className="text-lg font-semibold text-gray-900">Services</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((service) => {
              const isChecked = formData.services[service.id]
              return (
                <label
                  key={service.id}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${isChecked 
                      ? 'border-parque-purple bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleChange(`services.${service.id}`, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`
                    w-5 h-5 rounded flex items-center justify-center transition-colors
                    ${isChecked ? 'bg-parque-purple' : 'bg-gray-200'}
                  `}>
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{service.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{service.label}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Selected Amenities & Services</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {Object.values(formData.amenities).filter(Boolean).length + 
               Object.values(formData.services).filter(Boolean).length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {Object.values(formData.amenities).filter(Boolean).length} amenities
            </p>
            <p className="text-xs text-gray-500">
              {Object.values(formData.services).filter(Boolean).length} services
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}