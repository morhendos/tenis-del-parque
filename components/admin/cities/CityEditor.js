'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import GoogleSearchSection from './editor/GoogleSearchSection'
import BasicInfoSection from './editor/BasicInfoSection'
import LocationSection from './editor/LocationSection'
import SettingsSection from './editor/SettingsSection'
import ImagesSection from './editor/ImagesSection'

export default function CityEditor({ cityId = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [currentSection, setCurrentSection] = useState('search')
  const [showGoogleSearch, setShowGoogleSearch] = useState(!cityId)
  const [selectedGoogleResult, setSelectedGoogleResult] = useState(null)
  const [cityPhotos, setCityPhotos] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
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
    importSource: 'manual',
    images: {
      main: '',
      gallery: [],
      googlePhotoReference: null
    }
  })

  // Load city data if editing
  useEffect(() => {
    if (cityId) {
      fetchCityData()
    }
  }, [cityId])

  const fetchCityData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/cities?id=${cityId}`)
      if (!response.ok) throw new Error('Failed to fetch city')
      
      const data = await response.json()
      const city = data.city
      
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
        importSource: city.importSource || 'manual',
        images: city.images || {
          main: '',
          gallery: [],
          googlePhotoReference: null
        }
      })
      
      if (city.googleData?.photos) {
        setCityPhotos(city.googleData.photos)
      }
      
      setCurrentSection('basic')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSelect = (result, photos = []) => {
    // Extract province from Google result
    const addressComponents = result.address_components || []
    const provinceComponent = addressComponents.find(
      comp => comp.types.includes('administrative_area_level_2')
    )
    const province = provinceComponent ? provinceComponent.long_name : 'Málaga'
    
    // Generate slug
    const slug = result.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

    setFormData({
      slug: slug,
      name: {
        es: result.name,
        en: result.name
      },
      province: province,
      country: 'Spain',
      coordinates: {
        lat: result.geometry?.location?.lat || null,
        lng: result.geometry?.location?.lng || null
      },
      status: 'active',
      displayOrder: 0,
      importSource: 'google',
      images: {
        main: photos.length > 0 ? photos[0].url : '',
        gallery: [],
        googlePhotoReference: photos.length > 0 ? photos[0].photo_reference : null
      }
    })
    
    setSelectedGoogleResult(result)
    setCityPhotos(photos)
    setShowGoogleSearch(false)
    setCurrentSection('basic')
    setHasUnsavedChanges(true)
  }

  const handleFieldChange = useCallback((field, value) => {
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
      if (field === 'name.es' && !cityId) {
        newData.slug = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
      }
      
      return newData
    })
    setHasUnsavedChanges(true)
  }, [cityId])

  const handleImagesUpdate = useCallback((updatedImages) => {
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }))
    setHasUnsavedChanges(true)
  }, [])

  const validateForm = () => {
    const errors = []
    
    if (!formData.slug) errors.push('Slug is required')
    if (!formData.name.es) errors.push('Spanish name is required')
    if (!formData.name.en) errors.push('English name is required')
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, and hyphens')
    }
    
    if (errors.length > 0) {
      setError(errors.join(', '))
      return false
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setSaving(true)
    setError(null)
    
    try {
      const dataToSend = {
        ...formData,
        coordinates: {
          lat: formData.coordinates.lat ? parseFloat(formData.coordinates.lat) : undefined,
          lng: formData.coordinates.lng ? parseFloat(formData.coordinates.lng) : undefined
        }
      }
      
      // Remove undefined coordinates
      if (!dataToSend.coordinates.lat || !dataToSend.coordinates.lng) {
        delete dataToSend.coordinates
      }
      
      // Add Google data if selected from search
      if (selectedGoogleResult) {
        dataToSend.googlePlaceId = selectedGoogleResult.place_id
        dataToSend.formattedAddress = selectedGoogleResult.formatted_address
        dataToSend.googleData = {
          types: selectedGoogleResult.types,
          addressComponents: selectedGoogleResult.address_components,
          viewport: selectedGoogleResult.geometry?.viewport,
          photos: cityPhotos
        }
      }
      
      const url = '/api/admin/cities'
      const method = cityId ? 'PUT' : 'POST'
      
      if (cityId) {
        dataToSend.id = cityId
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
        throw new Error(data.error || `Failed to ${cityId ? 'update' : 'create'} city`)
      }
      
      setSuccessMessage(`City ${cityId ? 'updated' : 'created'} successfully!`)
      setHasUnsavedChanges(false)
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/admin/cities')
      }, 1500)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Navigation sections
  const sections = [
    { id: 'search', label: 'Google Search', icon: '🔍', show: !cityId && showGoogleSearch },
    { id: 'basic', label: 'Basic Info', icon: '📝', show: true },
    { id: 'location', label: 'Location', icon: '📍', show: true },
    { id: 'settings', label: 'Settings', icon: '⚙️', show: true },
    { id: 'images', label: 'Images', icon: '🖼️', show: true }
  ].filter(s => s.show)

  // Check if section is complete
  const isSectionComplete = (sectionId) => {
    switch (sectionId) {
      case 'basic':
        return formData.name.es && formData.name.en && formData.slug
      case 'location':
        return formData.province && formData.country
      case 'settings':
        return true
      case 'images':
        return formData.images.main
      default:
        return false
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading city data...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {cityId ? 'Edit City' : 'New City'}
          </h2>
          {formData.name.es && (
            <p className="text-sm text-gray-600 mt-1">{formData.name.es}</p>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {sections.map(section => (
              <li key={section.id}>
                <button
                  onClick={() => setCurrentSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    currentSection === section.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-lg">{section.icon}</span>
                    {section.label}
                  </span>
                  {isSectionComplete(section.id) && (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Quick Stats */}
        {(cityId || formData.name.es) && (
          <div className="p-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Info</h3>
            <div className="space-y-2 text-xs">
              {formData.coordinates.lat && (
                <div className="flex justify-between">
                  <span className="text-gray-500">GPS:</span>
                  <span className="text-gray-900">✅ Set</span>
                </div>
              )}
              {formData.images.main && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Main Image:</span>
                  <span className="text-gray-900">✅ Set</span>
                </div>
              )}
              {cityPhotos.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Google Photos:</span>
                  <span className="text-gray-900">{cityPhotos.length}</span>
                </div>
              )}
              {formData.importSource === 'google' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Source:</span>
                  <span className="text-blue-600">Google</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <div className="px-4 pb-4">
            <div className="bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                Unsaved changes
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/cities')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {cityId ? 'Edit City' : 'Create New City'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {cityId ? 'Update city information and images' : 'Add a new city to the system'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {successMessage && (
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                    {successMessage}
                  </div>
                )}
                <button
                  onClick={() => router.push('/admin/cities')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  )}
                  <span>{saving ? 'Saving...' : (cityId ? 'Update City' : 'Create City')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Content Sections */}
        <div className="p-6">
          {currentSection === 'search' && !cityId && (
            <GoogleSearchSection
              onSelect={handleGoogleSelect}
              onSkip={() => {
                setShowGoogleSearch(false)
                setCurrentSection('basic')
              }}
            />
          )}
          
          {currentSection === 'basic' && (
            <BasicInfoSection
              formData={formData}
              onChange={handleFieldChange}
              isEditing={!!cityId}
              selectedGoogleResult={selectedGoogleResult}
            />
          )}
          
          {currentSection === 'location' && (
            <LocationSection
              formData={formData}
              onChange={handleFieldChange}
              selectedGoogleResult={selectedGoogleResult}
            />
          )}
          
          {currentSection === 'settings' && (
            <SettingsSection
              formData={formData}
              onChange={handleFieldChange}
            />
          )}
          
          {currentSection === 'images' && (
            <ImagesSection
              formData={formData}
              cityPhotos={cityPhotos}
              onImagesUpdate={handleImagesUpdate}
            />
          )}
        </div>
      </div>
    </div>
  )
}
