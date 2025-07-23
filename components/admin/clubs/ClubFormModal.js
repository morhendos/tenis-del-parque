'use client'

import { useState, useEffect } from 'react'

export default function ClubFormModal({ isOpen, onClose, club, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    slug: '',
    status: 'active',
    featured: false,
    displayOrder: 0,
    
    // Location
    location: {
      address: '',
      city: 'malaga',
      postalCode: '',
      coordinates: {
        lat: null,
        lng: null
      },
      googleMapsUrl: ''
    },
    
    // Description
    description: {
      es: '',
      en: ''
    },
    
    // Courts
    courts: {
      total: 0,
      surfaces: [],
      indoor: 0,
      outdoor: 0
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
      gallery: []
    },
    
    // SEO
    seo: {
      metaTitle: {
        es: '',
        en: ''
      },
      metaDescription: {
        es: '',
        en: ''
      },
      keywords: {
        es: [],
        en: []
      }
    }
  })

  // Surface type being added
  const [newSurface, setNewSurface] = useState({ type: 'clay', count: 1 })

  // Initialize form data when editing
  useEffect(() => {
    if (club) {
      setFormData({
        ...club,
        // Ensure arrays are arrays
        tags: club.tags || [],
        courts: {
          ...club.courts,
          surfaces: club.courts?.surfaces || []
        },
        images: {
          main: club.images?.main || '',
          gallery: club.images?.gallery || []
        },
        seo: {
          metaTitle: {
            es: club.seo?.metaTitle?.es || '',
            en: club.seo?.metaTitle?.en || ''
          },
          metaDescription: {
            es: club.seo?.metaDescription?.es || '',
            en: club.seo?.metaDescription?.en || ''
          },
          keywords: {
            es: club.seo?.keywords?.es || [],
            en: club.seo?.keywords?.en || []
          }
        }
      })
    } else {
      // Reset to initial state for new club
      setFormData({
        name: '',
        slug: '',
        status: 'active',
        featured: false,
        displayOrder: 0,
        location: {
          address: '',
          city: 'malaga',
          postalCode: '',
          coordinates: {
            lat: null,
            lng: null
          },
          googleMapsUrl: ''
        },
        description: {
          es: '',
          en: ''
        },
        courts: {
          total: 0,
          surfaces: [],
          indoor: 0,
          outdoor: 0
        },
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
        services: {
          lessons: false,
          coaching: false,
          stringing: false,
          tournaments: false,
          summerCamps: false
        },
        contact: {
          phone: '',
          email: '',
          website: '',
          facebook: '',
          instagram: ''
        },
        operatingHours: {
          monday: { open: '08:00', close: '22:00' },
          tuesday: { open: '08:00', close: '22:00' },
          wednesday: { open: '08:00', close: '22:00' },
          thursday: { open: '08:00', close: '22:00' },
          friday: { open: '08:00', close: '22:00' },
          saturday: { open: '08:00', close: '22:00' },
          sunday: { open: '08:00', close: '22:00' }
        },
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
        tags: [],
        images: {
          main: '',
          gallery: []
        },
        seo: {
          metaTitle: {
            es: '',
            en: ''
          },
          metaDescription: {
            es: '',
            en: ''
          },
          keywords: {
            es: [],
            en: []
          }
        }
      })
    }
    setCurrentStep(1)
    setError(null)
  }, [club, isOpen])

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
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
      
      // Auto-generate slug when name changes (only for new clubs)
      if (field === 'name' && !club) {
        newData.slug = generateSlug(value)
      }
      
      return newData
    })
  }

  const addSurface = () => {
    if (newSurface.type && newSurface.count > 0) {
      setFormData(prev => ({
        ...prev,
        courts: {
          ...prev.courts,
          surfaces: [...prev.courts.surfaces, newSurface],
          total: prev.courts.total + newSurface.count
        }
      }))
      setNewSurface({ type: 'clay', count: 1 })
    }
  }

  const removeSurface = (index) => {
    setFormData(prev => {
      const surfaces = [...prev.courts.surfaces]
      const removed = surfaces.splice(index, 1)[0]
      return {
        ...prev,
        courts: {
          ...prev.courts,
          surfaces,
          total: prev.courts.total - removed.count
        }
      }
    })
  }

  const validateForm = () => {
    // Check required fields
    if (!formData.name || !formData.slug) {
      setError('Club name and slug are required')
      setCurrentStep(1)
      return false
    }
    
    if (!formData.description.es || !formData.description.en) {
      setError('Description in both Spanish and English is required')
      setCurrentStep(1)
      return false
    }
    
    if (!formData.location.city || !formData.location.address) {
      setError('City and address are required')
      setCurrentStep(2)
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
      // Clean up the data before sending
      const dataToSend = {
        ...formData,
        // Ensure arrays are arrays
        tags: formData.tags || [],
        courts: {
          ...formData.courts,
          surfaces: formData.courts.surfaces || [],
          total: formData.courts.total || 0,
          indoor: formData.courts.indoor || 0,
          outdoor: formData.courts.outdoor || formData.courts.total || 0
        },
        images: {
          main: formData.images.main || '',
          gallery: formData.images.gallery || []
        },
        seo: {
          metaTitle: {
            es: formData.seo.metaTitle.es || '',
            en: formData.seo.metaTitle.en || ''
          },
          metaDescription: {
            es: formData.seo.metaDescription.es || '',
            en: formData.seo.metaDescription.en || ''
          },
          keywords: {
            es: formData.seo.keywords.es || [],
            en: formData.seo.keywords.en || []
          }
        }
      }

      console.log('Sending club data:', dataToSend)

      const url = club 
        ? `/api/admin/clubs/${club._id}` 
        : '/api/admin/clubs'
      
      const method = club ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Server error:', data)
        if (data.details) {
          if (Array.isArray(data.details)) {
            throw new Error(data.details.map(d => `${d.field}: ${d.message}`).join(', '))
          } else {
            throw new Error(data.details)
          }
        }
        throw new Error(data.error || `Failed to ${club ? 'update' : 'create'} club`)
      }

      console.log('Club saved successfully:', data.club)
      onSuccess(data.club)
      onClose()
    } catch (err) {
      console.error('Error saving club:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo()
      case 2:
        return renderLocationInfo()
      case 3:
        return renderCourtsInfo()
      case 4:
        return renderAmenitiesServices()
      case 5:
        return renderContactPricing()
      default:
        return null
    }
  }

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Club Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          placeholder="Tennis Club Marbella"
          required
        />
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
          placeholder="tennis-club-marbella"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
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
            <option value="pending">Pending</option>
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
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => handleChange('featured', e.target.checked)}
            className="rounded text-parque-purple focus:ring-parque-purple"
          />
          <span className="text-sm font-medium text-gray-700">Featured Club</span>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Spanish) *
        </label>
        <textarea
          value={formData.description.es}
          onChange={(e) => handleChange('description.es', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          rows={3}
          placeholder="Descripción del club en español..."
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (English) *
        </label>
        <textarea
          value={formData.description.en}
          onChange={(e) => handleChange('description.en', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          rows={3}
          placeholder="Club description in English..."
          required
        />
      </div>
    </div>
  )

  const renderLocationInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City *
        </label>
        <select
          value={formData.location.city}
          onChange={(e) => handleChange('location.city', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          required
        >
          <option value="malaga">Málaga</option>
          <option value="marbella">Marbella</option>
          <option value="estepona">Estepona</option>
          <option value="sotogrande">Sotogrande</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          value={formData.location.address}
          onChange={(e) => handleChange('location.address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          placeholder="Calle Example 123"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Postal Code
        </label>
        <input
          type="text"
          value={formData.location.postalCode}
          onChange={(e) => handleChange('location.postalCode', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          placeholder="29600"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={formData.location.coordinates.lat || ''}
            onChange={(e) => handleChange('location.coordinates.lat', parseFloat(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            placeholder="36.5095"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={formData.location.coordinates.lng || ''}
            onChange={(e) => handleChange('location.coordinates.lng', parseFloat(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            placeholder="-4.8863"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Google Maps URL
        </label>
        <input
          type="url"
          value={formData.location.googleMapsUrl}
          onChange={(e) => handleChange('location.googleMapsUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          placeholder="https://maps.google.com/..."
        />
      </div>
    </div>
  )

  const renderCourtsInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Indoor Courts
          </label>
          <input
            type="number"
            min="0"
            value={formData.courts.indoor}
            onChange={(e) => handleChange('courts.indoor', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Outdoor Courts
          </label>
          <input
            type="number"
            min="0"
            value={formData.courts.outdoor}
            onChange={(e) => handleChange('courts.outdoor', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Court Surfaces
        </label>
        
        {formData.courts.surfaces.map((surface, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <span className="flex-1 text-sm">
              {surface.count} {surface.type} court{surface.count !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => removeSurface(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        
        <div className="flex items-center space-x-2 mt-2">
          <select
            value={newSurface.type}
            onChange={(e) => setNewSurface(prev => ({ ...prev, type: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          >
            <option value="clay">Clay</option>
            <option value="hard">Hard</option>
            <option value="grass">Grass</option>
            <option value="synthetic">Synthetic</option>
            <option value="carpet">Carpet</option>
            <option value="padel">Padel</option>
          </select>
          
          <input
            type="number"
            min="1"
            value={newSurface.count}
            onChange={(e) => setNewSurface(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          />
          
          <button
            type="button"
            onClick={addSurface}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90"
          >
            Add
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm font-medium text-gray-700">
          Total Courts: {formData.courts.total}
        </p>
      </div>
    </div>
  )

  const renderAmenitiesServices = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Amenities</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(formData.amenities).map(amenity => (
            <label key={amenity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.amenities[amenity]}
                onChange={(e) => handleChange(`amenities.${amenity}`, e.target.checked)}
                className="rounded text-parque-purple focus:ring-parque-purple"
              />
              <span className="text-sm capitalize">
                {amenity.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(formData.services).map(service => (
            <label key={service} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.services[service]}
                onChange={(e) => handleChange(`services.${service}`, e.target.checked)}
                className="rounded text-parque-purple focus:ring-parque-purple"
              />
              <span className="text-sm capitalize">
                {service.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
        <div className="grid grid-cols-2 gap-2">
          {['family-friendly', 'professional', 'beginner-friendly', 'tournaments', 
            'social-club', 'hotel-club', 'municipal', 'private', 'academy'].map(tag => (
            <label key={tag} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.tags.includes(tag)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleChange('tags', [...formData.tags, tag])
                  } else {
                    handleChange('tags', formData.tags.filter(t => t !== tag))
                  }
                }}
                className="rounded text-parque-purple focus:ring-parque-purple"
              />
              <span className="text-sm">{tag}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContactPricing = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
        <div className="space-y-2">
          <input
            type="tel"
            value={formData.contact.phone}
            onChange={(e) => handleChange('contact.phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            placeholder="Phone number"
          />
          <input
            type="email"
            value={formData.contact.email}
            onChange={(e) => handleChange('contact.email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            placeholder="Email address"
          />
          <input
            type="url"
            value={formData.contact.website}
            onChange={(e) => handleChange('contact.website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
            placeholder="Website URL"
          />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Pricing</h4>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={formData.pricing.courtRental.hourly.min || ''}
              onChange={(e) => handleChange('pricing.courtRental.hourly.min', parseFloat(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
              placeholder="Min hourly €"
            />
            <input
              type="number"
              value={formData.pricing.courtRental.hourly.max || ''}
              onChange={(e) => handleChange('pricing.courtRental.hourly.max', parseFloat(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
              placeholder="Max hourly €"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.pricing.publicAccess}
                onChange={(e) => handleChange('pricing.publicAccess', e.target.checked)}
                className="rounded text-parque-purple focus:ring-parque-purple"
              />
              <span className="text-sm">Public Access</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.pricing.membershipRequired}
                onChange={(e) => handleChange('pricing.membershipRequired', e.target.checked)}
                className="rounded text-parque-purple focus:ring-parque-purple"
              />
              <span className="text-sm">Membership Required</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {club ? 'Edit Club' : 'Add New Club'}
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
          
          {/* Step indicator */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            {[1, 2, 3, 4, 5].map(step => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep === step
                    ? 'bg-parque-purple text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
          
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600">
              Step {currentStep} of 5: {[
                'Basic Information',
                'Location',
                'Courts',
                'Amenities & Services',
                'Contact & Pricing'
              ][currentStep - 1]}
            </p>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {renderStep()}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (club ? 'Update Club' : 'Create Club')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
