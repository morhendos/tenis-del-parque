'use client'

import { useState, useEffect } from 'react'
import BasicInfoSection from './editor/BasicInfoSection'
import LocationSection from './editor/LocationSection'
import CourtsSection from './editor/CourtsSection'
import AmenitiesSection from './editor/AmenitiesSection'
import ContactSection from './editor/ContactSection'
import ImagesSection from './editor/ImagesSection'

export default function ClubEditor({ club, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState('basic')
  const [hasChanges, setHasChanges] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    slug: '',
    status: 'active',
    featured: false,
    displayOrder: 0,
    description: {
      es: '',
      en: ''
    },
    
    // Location
    location: {
      address: '',
      area: '',
      city: 'marbella',
      administrativeCity: '',
      displayName: '',
      postalCode: '',
      coordinates: {
        lat: null,
        lng: null
      },
      googleMapsUrl: ''
    },
    
    // Courts - Simplified structure
    courts: {
      tennis: { total: 0, indoor: 0, outdoor: 0 },
      padel: { total: 0, indoor: 0, outdoor: 0 },
      pickleball: { total: 0, indoor: 0, outdoor: 0 }
    },
    
    // Amenities
    amenities: {
      parking: false,
      lighting: false,
      proShop: false,
      restaurant: false,
      changingRooms: false,
      showers: false,
      lockers: false,
      wheelchair: false,
      swimming: false,
      gym: false,
      sauna: false,
      physio: false
    },
    
    // Services
    services: {
      lessons: false,
      coaching: false,
      stringing: false,
      tournaments: false,
      summerCamps: false
    },
    
    // Contact
    contact: {
      phone: '',
      email: '',
      website: '',
      facebook: '',
      instagram: ''
    },
    
    // Operating Hours
    operatingHours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '22:00' }
    },
    
    // Pricing
    pricing: {
      courtRental: {
        hourly: {
          min: null,
          max: null,
          currency: 'EUR'
        },
        membership: {
          monthly: null,
          annual: null,
          currency: 'EUR'
        }
      },
      publicAccess: true,
      membershipRequired: false
    },
    
    // Tags
    tags: [],
    
    // Images
    images: {
      main: '',
      gallery: [],
      googlePhotoReference: null
    },

    // Google Data (for Google Photos management)
    googleData: {
      photos: []
    }
  })

  // Navigation sections
  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'courts', label: 'Courts', icon: '🎾' },
    { id: 'amenities', label: 'Amenities', icon: '🏢' },
    { id: 'contact', label: 'Contact & Hours', icon: '📞' },
    { id: 'images', label: 'Images', icon: '🖼️' }
  ]

  // Convert legacy courts structure if needed
  const convertLegacyCourts = (courts) => {
    if (!courts) {
      return {
        tennis: { total: 0, indoor: 0, outdoor: 0 },
        padel: { total: 0, indoor: 0, outdoor: 0 },
        pickleball: { total: 0, indoor: 0, outdoor: 0 }
      }
    }

    // If it's already in the new format
    if (courts.tennis || courts.padel || courts.pickleball) {
      return {
        tennis: {
          total: courts.tennis?.total || 0,
          indoor: courts.tennis?.indoor || 0,
          outdoor: courts.tennis?.outdoor || 0
        },
        padel: {
          total: courts.padel?.total || 0,
          indoor: courts.padel?.indoor || 0,
          outdoor: courts.padel?.outdoor || 0
        },
        pickleball: {
          total: courts.pickleball?.total || 0,
          indoor: courts.pickleball?.indoor || 0,
          outdoor: courts.pickleball?.outdoor || 0
        }
      }
    }

    // Convert from legacy format
    return {
      tennis: {
        total: courts.total || 0,
        indoor: courts.indoor || 0,
        outdoor: courts.outdoor || 0
      },
      padel: { total: 0, indoor: 0, outdoor: 0 },
      pickleball: { total: 0, indoor: 0, outdoor: 0 }
    }
  }

  // Initialize form data when editing
  useEffect(() => {
    if (club) {
      const courtsData = convertLegacyCourts(club.courts)
      
      setFormData({
        ...club,
        tags: club.tags || [],
        courts: courtsData,
        location: {
          address: club.location?.address || '',
          area: club.location?.area || '',
          city: club.location?.city || 'marbella',
          administrativeCity: club.location?.administrativeCity || '',
          displayName: club.location?.displayName || '',
          postalCode: club.location?.postalCode || '',
          coordinates: club.location?.coordinates || { lat: null, lng: null },
          googleMapsUrl: club.location?.googleMapsUrl || ''
        },
        images: {
          main: club.images?.main || '',
          gallery: club.images?.gallery || [],
          googlePhotoReference: club.images?.googlePhotoReference || null
        },
        googleData: {
          photos: club.googleData?.photos || []
        }
      })
    }
  }, [club])

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
      return newData
    })
    setHasChanges(true)
  }

  const validateForm = () => {
    if (!formData.name || !formData.slug) {
      setError('Club name and slug are required')
      setActiveSection('basic')
      return false
    }
    
    if (!formData.location.city || !formData.location.address) {
      setError('City and address are required')
      setActiveSection('location')
      return false
    }
    
    // Check if at least one court is added
    const totalCourts = (formData.courts.tennis?.total || 0) + 
                       (formData.courts.padel?.total || 0) + 
                       (formData.courts.pickleball?.total || 0)
    
    if (totalCourts === 0) {
      setError('At least one court is required')
      setActiveSection('courts')
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      // Prepare data with surfaces arrays (empty for now)
      const dataToSend = {
        ...formData,
        courts: {
          tennis: { ...formData.courts.tennis, surfaces: [] },
          padel: { ...formData.courts.padel, surfaces: [] },
          pickleball: { ...formData.courts.pickleball, surfaces: [] }
        }
      }

      const url = club 
        ? `/api/admin/clubs/${club._id}` 
        : '/api/admin/clubs'
      
      const method = club ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${club ? 'update' : 'create'} club`)
      }

      onSuccess(data.club)
    } catch (err) {
      console.error('Error saving club:', err)
      setError(err.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return <BasicInfoSection formData={formData} handleChange={handleChange} club={club} />
      case 'location':
        return <LocationSection formData={formData} handleChange={handleChange} />
      case 'courts':
        return <CourtsSection formData={formData} handleChange={handleChange} />
      case 'amenities':
        return <AmenitiesSection formData={formData} handleChange={handleChange} />
      case 'contact':
        return <ContactSection formData={formData} handleChange={handleChange} />
      case 'images':
        return <ImagesSection formData={formData} handleChange={handleChange} club={club} />
      default:
        return null
    }
  }

  // Check if section is complete
  const isSectionComplete = (sectionId) => {
    switch (sectionId) {
      case 'basic':
        return formData.name && formData.slug
      case 'location':
        return formData.location.city && formData.location.address
      case 'courts':
        const total = (formData.courts.tennis?.total || 0) + 
                     (formData.courts.padel?.total || 0) + 
                     (formData.courts.pickleball?.total || 0)
        return total > 0
      case 'contact':
        return formData.contact.phone || formData.contact.email
      default:
        return false
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Club Details
          </h2>
          <nav className="space-y-1">
            {sections.map(section => {
              const isActive = activeSection === section.id
              const isComplete = isSectionComplete(section.id)
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-parque-purple text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{section.icon}</span>
                    <span>{section.label}</span>
                  </div>
                  {isComplete && !isActive && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Courts:</span>
                <span className="font-medium">
                  {(formData.courts.tennis?.total || 0) + 
                   (formData.courts.padel?.total || 0) + 
                   (formData.courts.pickleball?.total || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  formData.status === 'active' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {formData.status}
                </span>
              </div>
              {formData.featured && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Featured:</span>
                  <span className="text-yellow-600">⭐</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {renderSection()}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <span className="text-sm text-orange-600">
                  <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                  You have unsaved changes
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : (club ? 'Update Club' : 'Create Club')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
