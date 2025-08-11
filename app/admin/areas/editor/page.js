'use client'

import { useState } from 'react'
import AreasMapEditor from '@/components/admin/areas/AreasMapEditor'
import AreasMapView from '@/components/admin/areas/AreasMapView'

export default function AreasEditorPage() {
  const [mode, setMode] = useState('view') // 'view' or 'edit'

  return (
    <div className="p-6">
      {/* Mode Toggle */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              🗺️ League Areas Management
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('view')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'view'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👁️ View Mode
              </button>
              <button
                onClick={() => setMode('edit')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'edit'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✏️ Edit Mode
              </button>
            </div>
          </div>
          
          {mode === 'view' ? (
            <p className="text-gray-600 mt-2">
              View current league areas and club assignments. Switch to Edit Mode to modify boundaries.
            </p>
          ) : (
            <div className="mt-2">
              <p className="text-purple-600 font-medium">
                🎨 You are now in Edit Mode
              </p>
              <p className="text-gray-600">
                Draw new areas, edit existing boundaries, or delete areas. Don't forget to save your changes!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map Component */}
      {mode === 'view' ? (
        <AreasMapView />
      ) : (
        <AreasMapEditor />
      )}
    </div>
  )
}
