'use client'

export default function BasicInfoSection({ formData, onChange, isEditing, selectedGoogleResult }) {
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">
          Set the city names and URL identifier
        </p>
      </div>

      {/* Google Data Preview */}
      {selectedGoogleResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-green-900">Google Maps Data Selected</h4>
              <p className="text-sm text-green-800 mt-1">
                <strong>{selectedGoogleResult.name}</strong> - Data auto-filled from Google.
                You can edit the fields below if needed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          {/* City Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spanish Name *
              </label>
              <input
                type="text"
                value={formData.name.es}
                onChange={(e) => {
                  onChange('name.es', e.target.value)
                  if (!isEditing && !formData.name.en) {
                    onChange('name.en', e.target.value)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Málaga"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Name as displayed to Spanish users
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Name *
              </label>
              <input
                type="text"
                value={formData.name.en}
                onChange={(e) => onChange('name.en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Malaga"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Name as displayed to English users
              </p>
            </div>
          </div>
          
          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => onChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="malaga"
                required
              />
              {!isEditing && (
                <button
                  onClick={() => onChange('slug', generateSlug(formData.name.es))}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  title="Generate from Spanish name"
                >
                  Auto-generate
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly identifier (lowercase, numbers, and hyphens only).
              Used in: /clubs/{formData.slug || 'city-slug'}
            </p>
          </div>

          {/* Preview */}
          {formData.slug && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500">Spanish:</span> 
                  <span className="ml-2 font-medium">{formData.name.es || 'Ciudad'}</span>
                </div>
                <div>
                  <span className="text-gray-500">English:</span> 
                  <span className="ml-2 font-medium">{formData.name.en || 'City'}</span>
                </div>
                <div>
                  <span className="text-gray-500">URL:</span> 
                  <span className="ml-2 font-mono text-purple-600">/clubs/{formData.slug}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• The slug is used in URLs and cannot be changed after creation</li>
          <li>• Use the official Spanish name with proper accents</li>
          <li>• English name can omit accents for better SEO</li>
          <li>• Keep names consistent with Google Maps for better recognition</li>
        </ul>
      </div>
    </div>
  )
}