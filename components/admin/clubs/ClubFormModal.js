'use client'

import { useState, useEffect } from 'react'
import ClubImageManager from './ClubImageManager'

// Data source indicator component
const DataSourceIndicator = ({ source }) => {
  const indicators = {
    google_verified: {
      icon: '✓',
      color: 'text-green-600',
      tooltip: 'Verified from Google Maps'
    },
    google_estimated: {
      icon: '≈',
      color: 'text-yellow-600',
      tooltip: 'Estimated based on Google data'
    },
    manual: {
      icon: '✏️',
      color: 'text-blue-600',
      tooltip: 'Manually entered'
    },
    default: {
      icon: '•',
      color: 'text-gray-400',
      tooltip: 'Default value'
    }
  }

  const indicator = indicators[source] || indicators.default

  return (
    <span 
      className={`ml-1 ${indicator.color} cursor-help text-xs`}
      title={indicator.tooltip}
    >
      {indicator.icon}
    </span>
  )
}

export default function ClubFormModal({ isOpen, onClose, club, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [cities, setCities] = useState([])
  const [citiesLoading, setCitiesLoading] = useState(true)
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
      gallery: [],
      googlePhotoReference: null
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
    },
    
    // Verification flags
    amenitiesVerified: false,
    servicesVerified: false
  })

  // Surface type being added
  const [newSurface, setNewSurface] = useState({ type: 'clay', count: 1 })

  // Check if this is a Google import
  const isGoogleImport = club?.importSource === 'google' || club?.googlePlaceId

  // Check if selected city exists in the cities list
  const isCityInList = cities.some(c => c.slug === formData.location.city)
  const willCreateNewCity = formData.location.city && !isCityInList && formData.location.city !== 'malaga'

  // Total number of steps
  const totalSteps = 6

  // Fetch cities when component mounts
  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      setCitiesLoading(true)
      const response = await fetch('/api/admin/cities?status=active')
      if (!response.ok) throw new Error('Failed to fetch cities')
      
      const data = await response.json()
      setCities(data.cities || [])
    } catch (err) {
      console.error('Error fetching cities:', err)
      // Fallback to default cities if API fails
      setCities([
        { slug: 'malaga', name: { es: 'Málaga', en: 'Malaga' } },
        { slug: 'marbella', name: { es: 'Marbella', en: 'Marbella' } },
        { slug: 'estepona', name: { es: 'Estepona', en: 'Estepona' } },
        { slug: 'sotogrande', name: { es: 'Sotogrande', en: 'Sotogrande' } }
      ])
    } finally {
      setCitiesLoading(false)
    }
  }

  // Get data source for a field
  const getFieldSource = (fieldName) => {
    if (!club) return 'manual'
    if (!isGoogleImport) return 'manual'
    
    // Fields that come from Google
    const googleVerifiedFields = ['name', 'location.address', 'location.coordinates', 'contact.phone', 'contact.website']
    if (googleVerifiedFields.includes(fieldName)) return 'google_verified'
    
    // Fields that are estimated
    const estimatedFields = ['courts', 'amenities', 'services', 'pricing']
    if (estimatedFields.some(field => fieldName.startsWith(field))) return 'google_estimated'
    
    return 'manual'
  }

  // Generate slug from name - properly handles accented characters
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

  // Handle image updates from ClubImageManager
  const handleImagesUpdate = (updatedClub) => {
    setFormData(prev => ({
      ...prev,
      images: updatedClub.images
    }))
  }

  // Random data generator (previous implementation...)
  const generateRandomData = () => {
    // Random club names
    const prefixes = ['Club de Tenis', 'Tennis Club', 'Real Club', 'Centro Deportivo', 'Complejo Tenis']
    const names = ['El Paraíso', 'Costa del Sol', 'Marina', 'Las Palmeras', 'Los Naranjos', 'La Quinta', 'Vista Hermosa', 'Sol y Mar', 'Monte Alto', 'Puente Romano']
    
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomName = names[Math.floor(Math.random() * names.length)]
    const clubName = `${randomPrefix} ${randomName}`
    
    // Select random city from available cities
    const selectedCity = cities.length > 0 
      ? cities[Math.floor(Math.random() * cities.length)]
      : { slug: 'marbella', name: { es: 'Marbella', en: 'Marbella' } }
    
    // Random address components
    const streets = ['Calle ', 'Avenida ', 'Paseo ', 'Camino ', 'Urbanización ']
    const streetNames = ['del Mar', 'de la Playa', 'del Sol', 'de los Deportes', 'del Tenis', 'Nueva Andalucía', 'de la Costa', 'del Mediterráneo']
    const streetType = streets[Math.floor(Math.random() * streets.length)]
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)]
    const streetNumber = Math.floor(Math.random() * 200) + 1
    
    // Random postal codes by city
    const postalCodes = {
      malaga: ['29001', '29002', '29003', '29004', '29016', '29017'],
      marbella: ['29600', '29601', '29602', '29603', '29604'],
      estepona: ['29680', '29688', '29689'],
      sotogrande: ['11310', '11311'],
      mijas: ['29650', '29651'],
      benalmadena: ['29630', '29631'],
      fuengirola: ['29640']
    }
    
    // Random coordinates (approximate for each city)
    const cityCoordinates = {
      malaga: { lat: 36.7213 + (Math.random() - 0.5) * 0.1, lng: -4.4214 + (Math.random() - 0.5) * 0.1 },
      marbella: { lat: 36.5099 + (Math.random() - 0.5) * 0.1, lng: -4.8863 + (Math.random() - 0.5) * 0.1 },
      estepona: { lat: 36.4276 + (Math.random() - 0.5) * 0.1, lng: -5.1463 + (Math.random() - 0.5) * 0.1 },
      sotogrande: { lat: 36.2874 + (Math.random() - 0.5) * 0.05, lng: -5.2687 + (Math.random() - 0.5) * 0.05 }
    }
    
    // Random courts
    const totalOutdoor = Math.floor(Math.random() * 12) + 2 // 2-13 outdoor courts
    const totalIndoor = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0 // 30% chance of indoor courts
    
    // Random surfaces
    const surfaceTypes = ['clay', 'hard', 'synthetic', 'padel']
    const surfaces = []
    let remainingCourts = totalOutdoor + totalIndoor
    
    while (remainingCourts > 0) {
      const surfaceType = surfaceTypes[Math.floor(Math.random() * surfaceTypes.length)]
      const count = Math.min(remainingCourts, Math.floor(Math.random() * 4) + 1)
      surfaces.push({ type: surfaceType, count })
      remainingCourts -= count
    }
    
    // Random amenities (more likely for premium clubs)
    const isPremium = Math.random() > 0.5
    const randomAmenities = {
      parking: Math.random() > 0.2,
      lighting: Math.random() > 0.3,
      proShop: isPremium && Math.random() > 0.4,
      restaurant: isPremium && Math.random() > 0.5,
      changingRooms: Math.random() > 0.1,
      showers: Math.random() > 0.1,
      lockers: Math.random() > 0.3,
      wheelchair: Math.random() > 0.4,
      swimming: isPremium && Math.random() > 0.6,
      gym: isPremium && Math.random() > 0.7,
      sauna: isPremium && Math.random() > 0.8,
      physio: isPremium && Math.random() > 0.8
    }
    
    // Random services
    const randomServices = {
      lessons: Math.random() > 0.2,
      coaching: Math.random() > 0.3,
      stringing: Math.random() > 0.5,
      tournaments: Math.random() > 0.4,
      summerCamps: Math.random() > 0.6
    }
    
    // Random tags
    const allTags = ['family-friendly', 'professional', 'beginner-friendly', 'tournaments', 
                     'social-club', 'hotel-club', 'municipal', 'private', 'academy']
    const randomTags = allTags.filter(() => Math.random() > 0.7)
    
    // Random pricing
    const basePrice = isPremium ? 25 : 15
    const minPrice = basePrice + Math.floor(Math.random() * 10)
    const maxPrice = minPrice + Math.floor(Math.random() * 15) + 5
    
    // Generate phone number
    const phonePrefix = Math.random() > 0.5 ? '+34 952' : '+34 951'
    const phoneNumber = `${phonePrefix} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`
    
    const cityName = selectedCity.name.es || selectedCity.name.en || selectedCity.slug
    const cityDisplayName = cityName.charAt(0).toUpperCase() + cityName.slice(1)
    
    const generatedData = {
      name: clubName,
      slug: generateSlug(clubName),
      status: 'active',
      featured: Math.random() > 0.8,
      displayOrder: Math.floor(Math.random() * 10),
      location: {
        address: `${streetType}${streetName}, ${streetNumber}`,
        city: selectedCity.slug,
        postalCode: postalCodes[selectedCity.slug]?.[Math.floor(Math.random() * (postalCodes[selectedCity.slug]?.length || 1))] || '29600',
        coordinates: cityCoordinates[selectedCity.slug] || { lat: 36.5099, lng: -4.8863 },
        googleMapsUrl: `https://maps.google.com/?q=${clubName.replace(/\s+/g, '+')}+${cityDisplayName}`
      },
      description: {
        es: `${clubName} es un ${isPremium ? 'prestigioso' : 'acogedor'} club de tenis ubicado en ${cityDisplayName}. Contamos con ${totalOutdoor + totalIndoor} pistas ${totalIndoor > 0 ? '(incluyendo ' + totalIndoor + ' cubiertas)' : ''} y ofrecemos una experiencia de tenis ${isPremium ? 'premium' : 'excepcional'} para jugadores de todos los niveles. Nuestras instalaciones ${isPremium ? 'de primera clase' : 'modernas'} y nuestro equipo profesional garantizan una experiencia deportiva inolvidable.`,
        en: `${clubName} is a ${isPremium ? 'prestigious' : 'welcoming'} tennis club located in ${cityDisplayName}. We feature ${totalOutdoor + totalIndoor} courts ${totalIndoor > 0 ? '(including ' + totalIndoor + ' indoor)' : ''} and offer ${isPremium ? 'a premium' : 'an exceptional'} tennis experience for players of all levels. Our ${isPremium ? 'world-class' : 'modern'} facilities and professional staff ensure an unforgettable sporting experience.`
      },
      courts: {
        total: totalOutdoor + totalIndoor,
        surfaces: surfaces,
        indoor: totalIndoor,
        outdoor: totalOutdoor
      },
      amenities: randomAmenities,
      services: randomServices,
      contact: {
        phone: phoneNumber,
        email: `info@${generateSlug(clubName)}.com`,
        website: `https://www.${generateSlug(clubName)}.com`,
        facebook: Math.random() > 0.3 ? `https://facebook.com/${generateSlug(clubName)}` : '',
        instagram: Math.random() > 0.2 ? `@${generateSlug(clubName).replace(/-/g, '')}` : ''
      },
      operatingHours: {
        monday: { open: '08:00', close: isPremium ? '23:00' : '22:00' },
        tuesday: { open: '08:00', close: isPremium ? '23:00' : '22:00' },
        wednesday: { open: '08:00', close: isPremium ? '23:00' : '22:00' },
        thursday: { open: '08:00', close: isPremium ? '23:00' : '22:00' },
        friday: { open: '08:00', close: isPremium ? '23:00' : '22:00' },
        saturday: { open: '08:00', close: isPremium ? '23:00' : '21:00' },
        sunday: { open: '08:00', close: isPremium ? '22:00' : '20:00' }
      },
      pricing: {
        courtRental: {
          hourly: {
            min: minPrice,
            max: maxPrice,
            currency: 'EUR'
          },
          membership: {
            monthly: isPremium ? Math.floor(Math.random() * 100) + 150 : Math.floor(Math.random() * 50) + 50,
            annual: isPremium ? Math.floor(Math.random() * 1000) + 1500 : Math.floor(Math.random() * 500) + 500,
            currency: 'EUR'
          }
        },
        publicAccess: !isPremium || Math.random() > 0.3,
        membershipRequired: isPremium && Math.random() > 0.7
      },
      tags: randomTags,
      images: {
        main: '',
        gallery: [],
        googlePhotoReference: null
      },
      seo: {
        metaTitle: {
          es: `${clubName} - Club de Tenis en ${cityDisplayName}`,
          en: `${clubName} - Tennis Club in ${cityDisplayName}`
        },
        metaDescription: {
          es: `Descubre ${clubName}, ${isPremium ? 'el mejor club de tenis' : 'tu club de tenis'} en ${cityDisplayName}. ${totalOutdoor + totalIndoor} pistas, ${Object.values(randomServices).filter(Boolean).length} servicios disponibles. ¡Reserva ahora!`,
          en: `Discover ${clubName}, ${isPremium ? 'the premier tennis club' : 'your tennis club'} in ${cityDisplayName}. ${totalOutdoor + totalIndoor} courts, ${Object.values(randomServices).filter(Boolean).length} services available. Book now!`
        },
        keywords: {
          es: [`tenis ${selectedCity.slug}`, `club tenis ${selectedCity.slug}`, 'pistas tenis', 'clases tenis', selectedCity.slug],
          en: [`tennis ${selectedCity.slug}`, `tennis club ${selectedCity.slug}`, 'tennis courts', 'tennis lessons', selectedCity.slug]
        }
      },
      amenitiesVerified: true,
      servicesVerified: true
    }
    
    setFormData(generatedData)
    setCurrentStep(1)
  }

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
          gallery: club.images?.gallery || [],
          googlePhotoReference: club.images?.googlePhotoReference || null
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
        },
        amenitiesVerified: club.amenitiesVerified || false,
        servicesVerified: club.servicesVerified || false
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
          city: cities.length > 0 ? cities[0].slug : 'malaga',
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
          gallery: [],
          googlePhotoReference: null
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
        },
        amenitiesVerified: false,
        servicesVerified: false
      })
    }
    setCurrentStep(1)
    setError(null)
  }, [club, isOpen, cities])

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
      
      // Auto-calculate total courts when indoor or outdoor changes
      if (field === 'courts.indoor' || field === 'courts.outdoor') {
        const indoor = field === 'courts.indoor' ? value : newData.courts.indoor
        const outdoor = field === 'courts.outdoor' ? value : newData.courts.outdoor
        newData.courts.total = (indoor || 0) + (outdoor || 0)
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
          surfaces: [...prev.courts.surfaces, newSurface]
        }
      }))
      setNewSurface({ type: 'clay', count: 1 })
    }
  }

  const removeSurface = (index) => {
    setFormData(prev => {
      const surfaces = [...prev.courts.surfaces]
      surfaces.splice(index, 1)
      return {
        ...prev,
        courts: {
          ...prev.courts,
          surfaces
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
    
    // For Google imports, descriptions are optional
    if (!isGoogleImport && (!formData.description.es || !formData.description.en)) {
      setError('Description in both Spanish and English is required')
      setCurrentStep(1)
      return false
    }
    
    if (!formData.location.city || !formData.location.address) {
      setError('City and address are required')
      setCurrentStep(2)
      return false
    }
    
    // Check if at least one court is added
    if (formData.courts.total === 0) {
      setError('At least one court (indoor or outdoor) is required')
      setCurrentStep(3)
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
      // Calculate total courts from indoor + outdoor
      const totalCourts = (formData.courts.indoor || 0) + (formData.courts.outdoor || 0)
      
      // Clean up the data before sending
      const dataToSend = {
        ...formData,
        // Ensure arrays are arrays
        tags: formData.tags || [],
        courts: {
          ...formData.courts,
          surfaces: formData.courts.surfaces || [],
          total: totalCourts, // Use calculated total
          indoor: formData.courts.indoor || 0,
          outdoor: formData.courts.outdoor || 0
        },
        images: {
          main: formData.images.main || '',
          gallery: formData.images.gallery || [],
          googlePhotoReference: formData.images.googlePhotoReference || null
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
      case 6:
        return renderImagesStep()
      default:
        return null
    }
  }

  const renderImagesStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Club Images</h4>
        <p className="text-sm text-gray-600">
          Upload or manage images for your club. The main image will be used in listings and club pages.
        </p>
      </div>
      
      <ClubImageManager
        club={{ ...formData, _id: club?._id }}
        onImagesUpdate={handleImagesUpdate}
        readOnly={false}
      />
      
      {formData.images.main && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <p className="text-green-800">
            ✅ Main image set! Your club will look great in the directory.
          </p>
        </div>
      )}
    </div>
  )

  // ... All other render methods remain the same (renderBasicInfo, renderLocationInfo, etc.)
  // [Previous render methods would be here - I'll include them in the full file]

  const renderBasicInfo = () => (
    <div className="space-y-4">
      {isGoogleImport && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-blue-900 mb-1">Google Maps Import</p>
          <p className="text-blue-700">Fields marked with ✓ are verified from Google. Fields with ≈ are estimated and should be verified.</p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Club Name *
          <DataSourceIndicator source={getFieldSource('name')} />
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
          Description (Spanish) {!isGoogleImport && '*'}
          <DataSourceIndicator source={getFieldSource('description')} />
        </label>
        <textarea
          value={formData.description.es}
          onChange={(e) => handleChange('description.es', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          rows={3}
          placeholder="Descripción del club en español..."
          required={!isGoogleImport}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (English) {!isGoogleImport && '*'}
          <DataSourceIndicator source={getFieldSource('description')} />
        </label>
        <textarea
          value={formData.description.en}
          onChange={(e) => handleChange('description.en', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          rows={3}
          placeholder="Club description in English..."
          required={!isGoogleImport}
        />
      </div>
    </div>
  )

  const renderLocationInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City *
          <DataSourceIndicator source={getFieldSource('location.city')} />
        </label>
        {citiesLoading ? (
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            Loading cities...
          </div>
        ) : (
          <>
            <select
              value={formData.location.city}
              onChange={(e) => handleChange('location.city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
              required
            >
              {cities.map(city => (
                <option key={city.slug} value={city.slug}>
                  {city.name.es || city.name.en}
                </option>
              ))}
              {/* Add option to create new city if not in list */}
              <option value="_new" disabled>
                ── Other cities will be auto-created ──
              </option>
            </select>
            
            {willCreateNewCity && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <p className="text-blue-800">
                  <span className="font-medium">✨ New city will be created:</span> 
                  <span className="ml-1 capitalize">{formData.location.city}</span>
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  This city will be automatically added to the system when you save the club.
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address *
          <DataSourceIndicator source={getFieldSource('location.address')} />
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
            <DataSourceIndicator source={getFieldSource('location.coordinates')} />
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
            <DataSourceIndicator source={getFieldSource('location.coordinates')} />
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
      {isGoogleImport && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-yellow-900 mb-1">⚠️ Default Data</p>
          <p className="text-yellow-700">Court information is set to default values (6 clay courts). Please update with actual court details.</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Indoor Courts *
            <DataSourceIndicator source={getFieldSource('courts')} />
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
            Outdoor Courts *
            <DataSourceIndicator source={getFieldSource('courts')} />
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
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>Total Courts: {formData.courts.total}</strong> 
          <span className="text-xs ml-2">(Automatically calculated from indoor + outdoor)</span>
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Court Surfaces (Optional)
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
        
        <p className="text-xs text-gray-500 mt-2">
          Note: Court surfaces provide additional detail but don't affect the total court count.
        </p>
      </div>
    </div>
  )

  const renderAmenitiesServices = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">
            Amenities
            {isGoogleImport && <DataSourceIndicator source="google_estimated" />}
          </h4>
          {isGoogleImport && (
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={formData.amenitiesVerified || false}
                onChange={(e) => handleChange('amenitiesVerified', e.target.checked)}
                className="mr-1 rounded text-parque-purple focus:ring-parque-purple"
              />
              <span className="text-gray-600">Verified</span>
            </label>
          )}
        </div>
        
        {isGoogleImport && !formData.amenitiesVerified && (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            These amenities need to be verified. Please check with the club.
          </div>
        )}
        
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
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">
            Services
            {isGoogleImport && <DataSourceIndicator source="google_estimated" />}
          </h4>
          {isGoogleImport && (
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={formData.servicesVerified || false}
                onChange={(e) => handleChange('servicesVerified', e.target.checked)}
                className="mr-1 rounded text-parque-purple focus:ring-parque-purple"
              />
              <span className="text-gray-600">Verified</span>
            </label>
          )}
        </div>
        
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
      {isGoogleImport && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-gray-900 mb-1">Missing Data</p>
          <p className="text-gray-700">Email, social media, and membership prices are not available from Google. Please add manually.</p>
        </div>
      )}
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Phone
              {isGoogleImport && <DataSourceIndicator source="google_verified" />}
            </label>
            <input
              type="tel"
              value={formData.contact.phone}
              onChange={(e) => handleChange('contact.phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
              placeholder="Phone number"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Email
              <DataSourceIndicator source="manual" />
            </label>
            <input
              type="email"
              value={formData.contact.email}
              onChange={(e) => handleChange('contact.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
              placeholder="Email address"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Website
              {isGoogleImport && <DataSourceIndicator source="google_verified" />}
            </label>
            <input
              type="url"
              value={formData.contact.website}
              onChange={(e) => handleChange('contact.website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
              placeholder="Website URL"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Pricing
          {isGoogleImport && <DataSourceIndicator source="google_estimated" />}
        </h4>
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
            <div className="flex items-center space-x-2">
              {!club && (
                <button
                  onClick={generateRandomData}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-1"
                  title="Fill with random test data"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span>Test Data</span>
                </button>
              )}
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
          
          {/* Step indicator */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            {[1, 2, 3, 4, 5, 6].map(step => (
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
              Step {currentStep} of {totalSteps}: {[
                'Basic Information',
                'Location',
                'Courts',
                'Amenities & Services',
                'Contact & Pricing',
                'Images'
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
            
            {currentStep < totalSteps ? (
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
