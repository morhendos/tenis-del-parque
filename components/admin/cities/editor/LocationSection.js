'use client'

export default function LocationSection({ formData, onChange, selectedGoogleResult }) {
  const provinces = [
    'Málaga', 'Cádiz', 'Sevilla', 'Córdoba', 'Huelva', 'Jaén', 'Almería', 'Granada',
    'Madrid', 'Barcelona', 'Valencia', 'Alicante', 'Murcia', 'Bilbao', 'Santander',
    'La Coruña', 'Vigo', 'Zaragoza', 'Palma', 'Las Palmas', 'Santa Cruz de Tenerife'
  ].sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Details</h2>
        <p className="text-gray-600">
          Set the geographic location and administrative region
        </p>
      </div>

      {/* Province and Country */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Administrative Region</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Province
            </label>
            <select
              value={formData.province}
              onChange={(e) => onChange('province', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Spanish province or autonomous community
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => onChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Spain"
            />
            <p className="text-xs text-gray-500 mt-1">
              Usually &quot;Spain&quot; for Spanish cities
            </p>
          </div>
        </div>
      </div>

      {/* GPS Coordinates */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">GPS Coordinates</h3>
          {selectedGoogleResult && (
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
              ✓ Auto-filled from Google
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.coordinates.lat || ''}
              onChange={(e) => onChange('coordinates.lat', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="36.7213028"
            />
            <p className="text-xs text-gray-500 mt-1">
              Decimal degrees (e.g., 36.7213)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.coordinates.lng || ''}
              onChange={(e) => onChange('coordinates.lng', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="-4.4213988"
            />
            <p className="text-xs text-gray-500 mt-1">
              Decimal degrees (e.g., -4.4214)
            </p>
          </div>
        </div>
        
        {formData.coordinates.lat && formData.coordinates.lng && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-500">Location:</span>
                <span className="ml-2 font-mono text-gray-900">
                  {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                </span>
              </div>
              <a
                href={`https://maps.google.com/?q=${formData.coordinates.lat},${formData.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                View on Google Maps →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Map Preview Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Map Preview</h3>
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500">Map preview coming soon</p>
            {formData.coordinates.lat && formData.coordinates.lng && (
              <p className="text-xs text-gray-400 mt-1">
                {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📍 Location Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• GPS coordinates are used for map displays and distance calculations</li>
          <li>• Google Search automatically provides accurate coordinates</li>
          <li>• You can get coordinates from Google Maps by right-clicking any location</li>
          <li>• Province is used for grouping cities in the directory</li>
        </ul>
      </div>
    </div>
  )
}