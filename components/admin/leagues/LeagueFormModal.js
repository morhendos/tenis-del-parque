import { useState, useEffect } from 'react'

export default function LeagueFormModal({ show, league, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'coming_soon',
    location: {
      city: '',
      region: '',
      country: 'Spain'
    },
    description: {
      es: '',
      en: ''
    },
    expectedLaunchDate: '',
    displayOrder: 0
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (league) {
      setFormData({
        name: league.name || '',
        slug: league.slug || '',
        status: league.status || 'coming_soon',
        location: {
          city: league.location?.city || '',
          region: league.location?.region || '',
          country: league.location?.country || 'Spain'
        },
        description: {
          es: league.description?.es || '',
          en: league.description?.en || ''
        },
        expectedLaunchDate: league.expectedLaunchDate ? 
          new Date(league.expectedLaunchDate).toISOString().split('T')[0] : '',
        displayOrder: league.displayOrder || 0
      })
    } else {
      // Reset form for new league
      setFormData({
        name: '',
        slug: '',
        status: 'coming_soon',
        location: {
          city: '',
          region: '',
          country: 'Spain'
        },
        description: {
          es: '',
          en: ''
        },
        expectedLaunchDate: '',
        displayOrder: 0
      })
    }
    setErrors({})
  }, [league])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // Auto-generate slug from name
    if (name === 'name' && !league) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData(prev => ({
        ...prev,
        slug
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'League name is required'
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
    
    if (!formData.location.city.trim()) {
      newErrors['location.city'] = 'City is required'
    }
    
    if (!formData.location.region.trim()) {
      newErrors['location.region'] = 'Region is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            {league ? 'Edit League' : 'Create New League'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                League Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Estepona"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., estepona"
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
              )}
            </div>
          </div>
          
          {/* Status and Display Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
            </div>
          </div>
          
          {/* Location */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Location</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors['location.city'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Estepona"
                />
                {errors['location.city'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['location.city']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location.region"
                  value={formData.location.region}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors['location.region'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Málaga"
                />
                {errors['location.region'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['location.region']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Spain"
                />
              </div>
            </div>
          </div>
          
          {/* Expected Launch Date (for coming soon) */}
          {formData.status === 'coming_soon' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Launch Date
              </label>
              <input
                type="date"
                name="expectedLaunchDate"
                value={formData.expectedLaunchDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}
          
          {/* Descriptions */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Descriptions</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spanish Description
              </label>
              <textarea
                name="description.es"
                value={formData.description.es}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Descripción de la liga en español..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                English Description
              </label>
              <textarea
                name="description.en"
                value={formData.description.en}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="League description in English..."
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (league ? 'Update League' : 'Create League')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}