import { useState, useEffect } from 'react'

export default function LeagueFormModal({ show, league, onClose, onSubmit }) {
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    skillLevel: 'all',
    season: {
      year: new Date().getFullYear(),
      type: 'autumn'
    },
    cityId: '',
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

  // Fetch available cities
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true)
      try {
        const response = await fetch('/api/cities')
        if (response.ok) {
          const data = await response.json()
          setCities(data.cities || [])
        }
      } catch (error) {
        console.error('Error fetching cities:', error)
      } finally {
        setLoadingCities(false)
      }
    }
    
    if (show) {
      fetchCities()
    }
  }, [show])

  useEffect(() => {
    if (league) {
      setFormData({
        name: league.name || '',
        slug: league.slug || '',
        skillLevel: league.skillLevel || 'all',
        season: {
          year: league.season?.year || new Date().getFullYear(),
          type: league.season?.type || 'autumn'
        },
        cityId: league.city?._id || league.city || '',
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
        skillLevel: 'all',
        season: {
          year: new Date().getFullYear(),
          type: 'autumn'
        },
        cityId: '',
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

  // Auto-populate location when city is selected
  const handleCityChange = (e) => {
    const selectedCityId = e.target.value
    setFormData(prev => ({ ...prev, cityId: selectedCityId }))
    
    const selectedCity = cities.find(c => c._id === selectedCityId)
    if (selectedCity) {
      setFormData(prev => ({
        ...prev,
        location: {
          city: selectedCity.name?.es || selectedCity.name?.en || '',
          region: selectedCity.province || prev.location.region,
          country: 'Spain'
        }
      }))
      
      // Auto-generate slug if creating new league
      if (!league && formData.name) {
        generateSlug(formData.name, selectedCity, formData.season, formData.skillLevel)
      }
    }
  }

  const generateSlug = (name, city, season, skillLevel) => {
    const citySlug = city?.slug || city?.name?.es?.toLowerCase().replace(/\s+/g, '-') || ''
    const skillSlug = skillLevel === 'all' ? '' : `-${skillLevel}`
    const seasonSlug = `${season.type}-${season.year}`
    
    let slug = `${citySlug}${skillSlug}-${seasonSlug}`
    slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => {
        const newData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }
        
        // Regenerate slug on relevant changes
        if (!league && (name === 'season.type' || name === 'season.year')) {
          const selectedCity = cities.find(c => c._id === prev.cityId)
          if (selectedCity && prev.name) {
            setTimeout(() => generateSlug(prev.name, selectedCity, newData.season, prev.skillLevel), 0)
          }
        }
        
        return newData
      })
    } else {
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: value
        }
        
        // Regenerate slug on skill level change
        if (!league && name === 'skillLevel') {
          const selectedCity = cities.find(c => c._id === prev.cityId)
          if (selectedCity && prev.name) {
            setTimeout(() => generateSlug(prev.name, selectedCity, prev.season, value), 0)
          }
        }
        
        return newData
      })
    }

    // Auto-generate slug from name
    if (name === 'name' && !league) {
      const selectedCity = cities.find(c => c._id === formData.cityId)
      if (selectedCity) {
        generateSlug(value, selectedCity, formData.season, formData.skillLevel)
      }
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
    
    if (!formData.cityId) {
      newErrors.cityId = 'Please select a city'
    }
    
    if (!formData.season.type) {
      newErrors['season.type'] = 'Season type is required'
    }
    
    if (!formData.season.year) {
      newErrors['season.year'] = 'Season year is required'
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

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 1 + i)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {league ? '✏️ Edit League' : '🎾 Create New League'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-emerald-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Season Selection - FIRST & PROMINENT */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5">
            <h4 className="font-semibold text-emerald-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Season Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Season Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="season.type"
                  value={formData.season.type}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                    errors['season.type'] ? 'border-red-500' : 'border-emerald-200'
                  }`}
                >
                  <option value="spring">🌸 Spring</option>
                  <option value="summer">☀️ Summer</option>
                  <option value="autumn">🍂 Autumn</option>
                  <option value="winter">❄️ Winter</option>
                  <option value="annual">📅 Annual</option>
                </select>
                {errors['season.type'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['season.type']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="season.year"
                  value={formData.season.year}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                    errors['season.year'] ? 'border-red-500' : 'border-emerald-200'
                  }`}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors['season.year'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['season.year']}</p>
                )}
              </div>
            </div>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <select
              name="cityId"
              value={formData.cityId}
              onChange={handleCityChange}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                errors.cityId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loadingCities}
            >
              <option value="">
                {loadingCities ? 'Loading cities...' : 'Select a city'}
              </option>
              {cities.map(city => (
                <option key={city._id} value={city._id}>
                  {city.name?.es || city.name?.en} ({city.province})
                </option>
              ))}
            </select>
            {errors.cityId && (
              <p className="text-red-500 text-sm mt-1">{errors.cityId}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Location will be auto-populated from the selected city
            </p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                League Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Gold League"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Level
              </label>
              <select
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">🎾 All Levels</option>
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">⚡ Intermediate</option>
                <option value="advanced">🏆 Advanced</option>
              </select>
            </div>
          </div>

          {/* Auto-generated Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-sm ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="auto-generated from city-skill-season"
            />
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Will be auto-generated: {formData.cityId && cities.find(c => c._id === formData.cityId)?.slug || 'city'}-{formData.skillLevel !== 'all' ? formData.skillLevel + '-' : ''}{formData.season.type}-{formData.season.year}
            </p>
          </div>
          
          {/* Status and Display Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="active">✅ Active</option>
                <option value="registration_open">📝 Registration Open</option>
                <option value="coming_soon">⏳ Coming Soon</option>
                <option value="completed">🏁 Completed</option>
                <option value="inactive">❌ Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">Lower = appears first</p>
            </div>
          </div>
          
          {/* Expected Launch Date (for coming soon) */}
          {(formData.status === 'coming_soon' || formData.status === 'registration_open') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Start Date
              </label>
              <input
                type="date"
                name="expectedLaunchDate"
                value={formData.expectedLaunchDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
          
          {/* Location (Auto-populated, read-only) */}
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3">📍 Location (Auto-populated)</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500">City:</span>
                <p className="font-medium">{formData.location.city || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Region:</span>
                <p className="font-medium">{formData.location.region || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Country:</span>
                <p className="font-medium">{formData.location.country || '-'}</p>
              </div>
            </div>
          </div>
          
          {/* Descriptions */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">📝 Descriptions (Optional)</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spanish Description
              </label>
              <textarea
                name="description.es"
                value={formData.description.es}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Descripción de la liga en español..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Description
              </label>
              <textarea
                name="description.en"
                value={formData.description.en}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="League description in English..."
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              league ? '💾 Update League' : '✨ Create League'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
