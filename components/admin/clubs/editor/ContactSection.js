'use client'

export default function ContactSection({ formData, handleChange }) {
  const days = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact & Operating Hours</h2>
        <p className="text-gray-600">How can players reach and visit this club</p>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📞</span> Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.contact.phone}
              onChange={(e) => handleChange('contact.phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              placeholder="+34 952 123 456"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.contact.email}
              onChange={(e) => handleChange('contact.email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              placeholder="info@tennisclub.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.contact.website}
              onChange={(e) => handleChange('contact.website', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              placeholder="https://www.tennisclub.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">@</span>
              <input
                type="text"
                value={formData.contact.instagram?.replace('@', '')}
                onChange={(e) => handleChange('contact.instagram', e.target.value ? `@${e.target.value.replace('@', '')}` : '')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                placeholder="tennisclub"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🕰️</span> Operating Hours
        </h3>
        
        <div className="space-y-3">
          {days.map((day) => {
            const hours = formData.operatingHours[day.id]
            const isClosed = hours.open === 'closed' || hours.close === 'closed'
            
            return (
              <div key={day.id} className="flex items-center space-x-4">
                <div className="w-24">
                  <span className="text-sm font-medium text-gray-700">{day.label}</span>
                </div>
                
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="time"
                    value={isClosed ? '' : hours.open}
                    onChange={(e) => handleChange(`operatingHours.${day.id}.open`, e.target.value || 'closed')}
                    disabled={isClosed}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent disabled:bg-gray-100"
                  />
                  
                  <span className="text-gray-500">to</span>
                  
                  <input
                    type="time"
                    value={isClosed ? '' : hours.close}
                    onChange={(e) => handleChange(`operatingHours.${day.id}.close`, e.target.value || 'closed')}
                    disabled={isClosed}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent disabled:bg-gray-100"
                  />
                  
                  <label className="flex items-center space-x-2 ml-4">
                    <input
                      type="checkbox"
                      checked={isClosed}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange(`operatingHours.${day.id}.open`, 'closed')
                          handleChange(`operatingHours.${day.id}.close`, 'closed')
                        } else {
                          handleChange(`operatingHours.${day.id}.open`, '08:00')
                          handleChange(`operatingHours.${day.id}.close`, '22:00')
                        }
                      }}
                      className="rounded text-parque-purple focus:ring-parque-purple"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button
            type="button"
            onClick={() => {
              days.forEach(day => {
                handleChange(`operatingHours.${day.id}.open`, '08:00')
                handleChange(`operatingHours.${day.id}.close`, '22:00')
              })
            }}
            className="text-sm text-parque-purple hover:text-parque-purple/80"
          >
            Set all to 8:00 - 22:00
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => {
              days.forEach(day => {
                if (day.id === 'saturday' || day.id === 'sunday') {
                  handleChange(`operatingHours.${day.id}.open`, '09:00')
                  handleChange(`operatingHours.${day.id}.close`, '20:00')
                } else {
                  handleChange(`operatingHours.${day.id}.open`, '08:00')
                  handleChange(`operatingHours.${day.id}.close`, '22:00')
                }
              })
            }}
            className="text-sm text-parque-purple hover:text-parque-purple/80"
          >
            Weekday/Weekend hours
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">💰</span> Pricing Information
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Court Rental (per hour)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Minimum Price (€)</label>
                <input
                  type="number"
                  value={formData.pricing.courtRental.hourly.min || ''}
                  onChange={(e) => handleChange('pricing.courtRental.hourly.min', parseFloat(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  placeholder="15"
                  min="0"
                  step="0.50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Maximum Price (€)</label>
                <input
                  type="number"
                  value={formData.pricing.courtRental.hourly.max || ''}
                  onChange={(e) => handleChange('pricing.courtRental.hourly.max', parseFloat(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  placeholder="30"
                  min="0"
                  step="0.50"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.pricing.publicAccess}
                onChange={(e) => handleChange('pricing.publicAccess', e.target.checked)}
                className="rounded text-parque-purple focus:ring-parque-purple"
              />
              <span className="text-sm font-medium text-gray-700">Public Access</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.pricing.membershipRequired}
                onChange={(e) => handleChange('pricing.membershipRequired', e.target.checked)}
                className="rounded text-parque-purple focus:ring-parque-purple"
              />
              <span className="text-sm font-medium text-gray-700">Membership Required</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}