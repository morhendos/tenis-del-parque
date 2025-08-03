'use client'

import { useState, useEffect } from 'react'

export default function CityFormModal({ isOpen, onClose, city, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    slug: '',
    name: {
      es: '',
      en: ''
    },
    province: 'Málaga',
    country: 'Spain',
    coordinates: {
      lat: null,
      lng: null
    },
    status: 'active',
    displayOrder: 0,
    importSource: 'manual'
  })

  // Initialize form data when editing
  useEffect(() => {
    if (city) {
      setFormData({
        slug: city.slug || '',
        name: {
          es: city.name?.es || '',
          en: city.name?.en || ''
        },
        province: city.province || 'Málaga',
        country: city.country || 'Spain',
        coordinates: {
          lat: city.coordinates?.lat || null,
          lng: city.coordinates?.lng || null
        },
        status: city.status || 'active',
        displayOrder: city.displayOrder || 0,
        importSource: city.importSource || 'manual'
      })
    } else {
      // Reset to initial state for new city
      setFormData({
        slug: '',
        name: {
          es: '',
          en: ''
        },
        province: 'Málaga',
        country: 'Spain',
        coordinates: {
          lat: null,
          lng: null
        },
        status: 'active',
        displayOrder: 0,
        importSource: 'manual'
      })
    }
    setError(null)
  }, [city, isOpen])

  // Generate slug from Spanish name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  const handleChange = (field, value) => {
    setFormData(prev => {
      const keys = field.split('.')
      const newData = { ...prev }
      let current = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      
      // Auto-generate slug when Spanish name changes (only for new cities)
      if (field === 'name.es' && !city) {
        newData.slug = generateSlug(value)
      }
      
      // Auto-fill English name if empty (only for new cities)
      if (field === 'name.es' && !city && !newData.name.en) {
        newData.name.en = value
      }
      
      return newData
    })
  }

  const validateForm = () => {
    if (!formData.slug) {
      setError('Slug is required')
      return false
    }
    
    if (!formData.name.es) {
      setError('Spanish name is required')
      return false
    }
    
    if (!formData.name.en) {
      setError('English name is required')
      return false
    }
    
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const dataToSend = {
        ...formData,
        // Clean up coordinates
        coordinates: {
          lat: formData.coordinates.lat ? parseFloat(formData.coordinates.lat) : undefined,
          lng: formData.coordinates.lng ? parseFloat(formData.coordinates.lng) : undefined
        }
      }

      // Remove undefined coordinates
      if (!dataToSend.coordinates.lat || !dataToSend.coordinates.lng) {
        delete dataToSend.coordinates
      }

      const url = city 
        ? '/api/admin/cities'
        : '/api/admin/cities'
      
      const method = city ? 'PUT' : 'POST'
      
      if (city) {
        dataToSend.id = city._id
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          if (Array.isArray(data.details)) {
            throw new Error(data.details.map(d => `${d.field}: ${d.message}`).join(', '))
          } else {
            throw new Error(data.details)
          }
        }
        throw new Error(data.error || `Failed to ${city ? 'update' : 'create'} city`)
      }

      onSuccess(data.city)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Common Spanish provinces
  const provinces = [
    'Málaga', 'Cádiz', 'Sevilla', 'Córdoba', 'Huelva', 'Jaén', 'Almería', 'Granada',
    'Madrid', 'Barcelona', 'Valencia', 'Alicante', 'Murcia', 'Bilbao', 'Santander',
    'La Coruña', 'Vigo', 'Zaragoza', 'Palma', 'Las Palmas', 'Santa Cruz de Tenerife'
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {city ? 'Edit City' : 'Add New City'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spanish Name *
                </label>
                <input
                  type="text"
                  value={formData.name.es}
                  onChange={(e) => handleChange('name.es', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                  placeholder="Málaga"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English Name *
                </label>
                <input
                  type="text"
                  value={formData.name.en}
                  onChange={(e) => handleChange('name.en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                  placeholder="Malaga"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                placeholder="malaga"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly identifier (lowercase, numbers, and hyphens only)
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                >
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                  placeholder="Spain"
                />
              </div>
            </div>
            
            {/* Coordinates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPS Coordinates (Optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.coordinates.lat || ''}
                    onChange={(e) => handleChange('coordinates.lat', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                    placeholder="Latitude (e.g., 36.7213)"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.coordinates.lng || ''}
                    onChange={(e) => handleChange('coordinates.lng', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                    placeholder="Longitude (e.g., -4.4214)"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used for mapping and location-based features
              </p>
            </div>
            
            {/* Settings */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Import Source
                </label>
                <select
                  value={formData.importSource}
                  onChange={(e) => handleChange('importSource', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
                >
                  <option value="manual">Manual</option>
                  <option value="google">Google</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
            
            {/* City Information */}
            {city && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">City Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Clubs:</span>
                    <span className="ml-2 font-medium">{city.clubCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(city.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (city ? 'Update City' : 'Create City')}
          </button>
        </div>
      </div>
    </div>
  )
}