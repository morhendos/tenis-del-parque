'use client'

export default function SettingsSection({ formData, onChange }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">
          Configure visibility and display options
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => onChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Inactive cities are hidden from public views
            </p>
          </div>
          
          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => onChange('displayOrder', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first in lists (0 = default order)
            </p>
          </div>
          
          {/* Import Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Import Source
            </label>
            <select
              value={formData.importSource}
              onChange={(e) => onChange('importSource', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="manual">Manual Entry</option>
              <option value="google">Google Maps</option>
              <option value="auto">Auto-imported</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Tracks how this city was added to the system
            </p>
          </div>
        </div>
      </div>

      {/* Status Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status Preview</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Current Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              formData.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {formData.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Display Priority:</span>
            <span className="text-sm font-medium text-gray-900">
              {formData.displayOrder === 0 ? 'Default' : `Priority ${formData.displayOrder}`}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Data Source:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              formData.importSource === 'google' 
                ? 'bg-blue-100 text-blue-800'
                : formData.importSource === 'auto'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {formData.importSource === 'google' && '🗺️ Google'}
              {formData.importSource === 'auto' && '🤖 Auto'}
              {formData.importSource === 'manual' && '✏️ Manual'}
            </span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">⚙️ Settings Guide</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Active:</strong> City appears in public club directory</li>
          <li>• <strong>Inactive:</strong> City is hidden but clubs remain accessible</li>
          <li>• <strong>Display Order:</strong> Control city position in lists (popular cities first)</li>
          <li>• <strong>Import Source:</strong> Helps track data quality and updates</li>
        </ul>
      </div>
    </div>
  )
}