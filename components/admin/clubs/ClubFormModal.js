'use client'

import { useState, useEffect } from 'react'
import ClubImageManager from './ClubImageManager'
import CourtsManager from './CourtsManager'
import { 
  getCityOptions, 
  generateDisplayName, 
  getAreasForCity 
} from '@/lib/utils/areaMapping'

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

// Helper function to convert legacy courts to new structure
const convertLegacyCourts = (courts) => {
  if (!courts) {
    return {
      tennis: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
      padel: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
      pickleball: { total: 0, indoor: 0, outdoor: 0, surfaces: [] }
    }
  }

  // If it's already in the new format
  if (courts.tennis || courts.padel || courts.pickleball) {
    return {
      tennis: courts.tennis || { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
      padel: courts.padel || { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
      pickleball: courts.pickleball || { total: 0, indoor: 0, outdoor: 0, surfaces: [] }
    }
  }

  // Convert from legacy format
  const tennisSurfaces = []
  const padelSurfaces = []
  
  if (courts.surfaces && Array.isArray(courts.surfaces)) {
    courts.surfaces.forEach(surface => {
      if (surface.type === 'padel') {
        padelSurfaces.push({ type: 'synthetic', count: surface.count })
      } else {
        tennisSurfaces.push(surface)
      }
    })
  }

  // Calculate padel courts from surfaces
  const padelCount = padelSurfaces.reduce((sum, s) => sum + s.count, 0)
  const tennisCount = Math.max(0, (courts.total || 0) - padelCount)

  return {
    tennis: {
      total: tennisCount,
      indoor: padelCount > 0 ? Math.max(0, (courts.indoor || 0) - Math.floor(padelCount / 2)) : (courts.indoor || 0),
      outdoor: padelCount > 0 ? Math.max(0, (courts.outdoor || 0) - Math.ceil(padelCount / 2)) : (courts.outdoor || 0),
      surfaces: tennisSurfaces
    },
    padel: {
      total: padelCount,
      indoor: Math.floor(padelCount / 2),
      outdoor: Math.ceil(padelCount / 2),
      surfaces: padelSurfaces
    },
    pickleball: {
      total: 0,
      indoor: 0,
      outdoor: 0,
      surfaces: []
    }
  }
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
    
    // Enhanced Location with Area Support
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
    
    // Description
    description: {
      es: '',
      en: ''
    },
    
    // Courts - NEW STRUCTURE
    courts: {
      tennis: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
      padel: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
      pickleball: { total: 0, indoor: 0, outdoor: 0, surfaces: [] }
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

  // City options from our area mapping system
  const [cityOptions, setCityOptions] = useState([])
  const [availableAreas, setAvailableAreas] = useState([])

  // Check if this is a Google import
  const isGoogleImport = club?.importSource === 'google' || club?.googlePlaceId

  // Check if selected city exists in the cities list
  const isCityInList = cities.some(c => c.slug === formData.location.city)
  const willCreateNewCity = formData.location.city && !isCityInList && formData.location.city !== 'malaga'

  // Total number of steps
  const totalSteps = 6

  // Load city options from area mapping system
  useEffect(() => {
    const options = getCityOptions()
    setCityOptions(options)
  }, [])

  // Update available areas when city changes
  useEffect(() => {
    if (formData.location.city) {
      const areas = getAreasForCity(formData.location.city)
      setAvailableAreas(areas.map(area => ({
        value: area,
        label: area.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      })))
      
      // Reset area if current area is not available for selected city
      if (formData.location.area && !areas.includes(formData.location.area)) {
        handleChange('location.area', '')
      }
    }
  }, [formData.location.city])

  // Auto-generate display name when area or city changes
  useEffect(() => {
    if (formData.location.city) {
      const displayName = generateDisplayName(formData.location.area, formData.location.city)
      handleChange('location.displayName', displayName)
    }
  }, [formData.location.area, formData.location.city])

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
    
    // Area and display fields from area mapping
    if (['location.area', 'location.displayName'].includes(fieldName)) return 'google_verified'
    
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

  // Random data generator with area support and multi-sport courts
  const generateRandomData = () => {
    // Random club names
    const prefixes = ['Club de Tenis', 'Tennis Club', 'Real Club', 'Centro Deportivo', 'Complejo Tenis']
    const names = ['El Paraíso', 'Costa del Sol', 'Marina', 'Las Palmeras', 'Los Naranjos', 'La Quinta', 'Vista Hermosa', 'Sol y Mar', 'Monte Alto', 'Puente Romano']
    
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomName = names[Math.floor(Math.random() * names.length)]
    const clubName = `${randomPrefix} ${randomName}`
    
    // Select random city from our city options
    const selectedCityOption = cityOptions.length > 0 
      ? cityOptions[Math.floor(Math.random() * cityOptions.length)]
      : { value: 'marbella', label: 'Marbella', areas: [] }
    
    // Select random area from selected city
    const selectedArea = selectedCityOption.areas.length > 0
      ? selectedCityOption.areas[Math.floor(Math.random() * selectedCityOption.areas.length)]
      : { value: selectedCityOption.value, label: selectedCityOption.label }
    
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
    
    // Random multi-sport courts
    const hasTennis = Math.random() > 0.1 // 90% chance
    const hasPadel = Math.random() > 0.4 // 60% chance
    const hasPickleball = Math.random() > 0.8 // 20% chance
    
    const tennisOutdoor = hasTennis ? Math.floor(Math.random() * 8) + 2 : 0
    const tennisIndoor = hasTennis && Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0
    
    const padelOutdoor = hasPadel ? Math.floor(Math.random() * 6) + 1 : 0
    const padelIndoor = hasPadel && Math.random() > 0.8 ? Math.floor(Math.random() * 2) + 1 : 0
    
    const pickleballOutdoor = hasPickleball ? Math.floor(Math.random() * 4) + 1 : 0
    const pickleballIndoor = 0 // Rarely indoor
    
    // Generate surfaces for each sport
    const tennisSurfaces = []
    if (hasTennis) {
      const surfaceTypes = ['clay', 'hard', 'synthetic']
      const mainSurface = surfaceTypes[Math.floor(Math.random() * surfaceTypes.length)]
      tennisSurfaces.push({ type: mainSurface, count: Math.max(tennisOutdoor + tennisIndoor - 2, 1) })
      if (tennisOutdoor + tennisIndoor > 4) {
        const secondSurface = surfaceTypes.filter(s => s !== mainSurface)[Math.floor(Math.random() * 2)]
        tennisSurfaces.push({ type: secondSurface, count: 2 })
      }
    }
    
    const padelSurfaces = hasPadel ? [{ type: 'synthetic', count: padelOutdoor + padelIndoor }] : []
    const pickleballSurfaces = hasPickleball ? [{ type: 'hard', count: pickleballOutdoor + pickleballIndoor }] : []
    
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
    
    const randomServices = {
      lessons: Math.random() > 0.2,
      coaching: Math.random() > 0.3,
      stringing: Math.random() > 0.5,
      tournaments: Math.random() > 0.4,
      summerCamps: Math.random() > 0.6
    }
    
    const allTags = ['family-friendly', 'professional', 'beginner-friendly', 'tournaments', 
                     'social-club', 'hotel-club', 'municipal', 'private', 'academy']
    const randomTags = allTags.filter(() => Math.random() > 0.7)
    
    const basePrice = isPremium ? 25 : 15
    const minPrice = basePrice + Math.floor(Math.random() * 10)
    const maxPrice = minPrice + Math.floor(Math.random() * 15) + 5
    
    const phonePrefix = Math.random() > 0.5 ? '+34 952' : '+34 951'
    const phoneNumber = `${phonePrefix} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`
    
    const displayName = generateDisplayName(selectedArea.value, selectedCityOption.value)
    
    const generatedData = {
      name: clubName,
      slug: generateSlug(clubName),
      status: 'active',
      featured: Math.random() > 0.8,
      displayOrder: Math.floor(Math.random() * 10),
      
      // Enhanced location with area support
      location: {
        address: `${streetType}${streetName}, ${streetNumber}`,
        area: selectedArea.value,
        city: selectedCityOption.value,
        administrativeCity: selectedArea.value !== selectedCityOption.value ? selectedArea.value : '',
        displayName: displayName,
        postalCode: postalCodes[selectedCityOption.value]?.[Math.floor(Math.random() * (postalCodes[selectedCityOption.value]?.length || 1))] || '29600',
        coordinates: cityCoordinates[selectedCityOption.value] || { lat: 36.5099, lng: -4.8863 },
        googleMapsUrl: `https://maps.google.com/?q=${clubName.replace(/\s+/g, '+')}+${selectedArea.label}`
      },
      
      description: {
        es: `${clubName} es un ${isPremium ? 'prestigioso' : 'acogedor'} complejo deportivo ubicado en ${displayName}. ${hasTennis ? `Contamos con ${tennisOutdoor + tennisIndoor} pistas de tenis. ` : ''}${hasPadel ? `Disponemos de ${padelOutdoor + padelIndoor} pistas de pádel. ` : ''}${hasPickleball ? `Ofrecemos ${pickleballOutdoor + pickleballIndoor} pistas de pickleball. ` : ''}Una experiencia deportiva ${isPremium ? 'premium' : 'excepcional'} para jugadores de todos los niveles.`,
        en: `${clubName} is a ${isPremium ? 'prestigious' : 'welcoming'} sports complex located in ${displayName}. ${hasTennis ? `We feature ${tennisOutdoor + tennisIndoor} tennis courts. ` : ''}${hasPadel ? `We have ${padelOutdoor + padelIndoor} padel courts. ` : ''}${hasPickleball ? `We offer ${pickleballOutdoor + pickleballIndoor} pickleball courts. ` : ''}${isPremium ? 'A premium' : 'An exceptional'} sports experience for players of all levels.`
      },
      
      // Multi-sport courts
      courts: {
        tennis: {
          total: tennisOutdoor + tennisIndoor,
          indoor: tennisIndoor,
          outdoor: tennisOutdoor,
          surfaces: tennisSurfaces
        },
        padel: {
          total: padelOutdoor + padelIndoor,
          indoor: padelIndoor,
          outdoor: padelOutdoor,
          surfaces: padelSurfaces
        },
        pickleball: {
          total: pickleballOutdoor + pickleballIndoor,
          indoor: pickleballIndoor,
          outdoor: pickleballOutdoor,
          surfaces: pickleballSurfaces
        }
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
          es: `${clubName} - Club de Tenis en ${displayName}`,
          en: `${clubName} - Tennis Club in ${displayName}`
        },
        metaDescription: {
          es: `Descubre ${clubName}, ${isPremium ? 'el mejor club de tenis' : 'tu club de tenis'} en ${displayName}. ${hasTennis ? 'Tenis, ' : ''}${hasPadel ? 'Pádel, ' : ''}${hasPickleball ? 'Pickleball' : ''} disponibles.`,
          en: `Discover ${clubName}, ${isPremium ? 'the premier tennis club' : 'your tennis club'} in ${displayName}. ${hasTennis ? 'Tennis, ' : ''}${hasPadel ? 'Padel, ' : ''}${hasPickleball ? 'Pickleball' : ''} available.`
        },
        keywords: {
          es: [`tenis ${selectedCityOption.value}`, `club tenis ${selectedArea.value}`, 'pistas tenis', selectedCityOption.value],
          en: [`tennis ${selectedCityOption.value}`, `tennis club ${selectedArea.value}`, 'tennis courts', selectedCityOption.value]
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
      // Convert legacy courts structure if needed
      const courtsData = convertLegacyCourts(club.courts)
      
      setFormData({
        ...club,
        // Ensure arrays are arrays
        tags: club.tags || [],
        courts: courtsData,
        // Enhanced location with area support
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
      // Reset to initial state for new club with multi-sport support
      setFormData(prev => ({
        ...prev,
        courts: {
          tennis: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
          padel: { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
          pickleball: { total: 0, indoor: 0, outdoor: 0, surfaces: [] }
        }
      }))
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
      
      return newData
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
    
    // Check if at least one court is added across all sports
    const totalCourts = (formData.courts.tennis?.total || 0) + 
                       (formData.courts.padel?.total || 0) + 
                       (formData.courts.pickleball?.total || 0)
    
    if (totalCourts === 0) {
      setError('At least one court (of any type) is required')
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
      // Clean up the data before sending
      const dataToSend = {
        ...formData,
        // Ensure arrays are arrays
        tags: formData.tags || [],
        // Ensure courts structure is complete
        courts: {
          tennis: formData.courts.tennis || { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
          padel: formData.courts.padel || { total: 0, indoor: 0, outdoor: 0, surfaces: [] },
          pickleball: formData.courts.pickleball || { total: 0, indoor: 0, outdoor: 0, surfaces: [] }
        },
        // Enhanced location data
        location: {
          address: formData.location.address,
          area: formData.location.area || null,
          city: formData.location.city,
          administrativeCity: formData.location.administrativeCity || null,
          displayName: formData.location.displayName || null,
          postalCode: formData.location.postalCode || '',
          coordinates: formData.location.coordinates,
          googleMapsUrl: formData.location.googleMapsUrl || ''
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

      console.log('Sending club data with multi-sport courts:', dataToSend)

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

      console.log('Club saved successfully with multi-sport courts:', data.club)
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

  const renderBasicInfo = () => (
    <div className="space-y-4">
      {isGoogleImport && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-blue-900 mb-1">🗺️ Google Maps Import</p>
          <p className="text-blue-700">Fields marked with ✓ are verified from Google. Area information has been automatically detected and mapped.</p>
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
      {/* Geographic Areas Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          📍 Geographic Areas Guide
        </h4>
        <p className="text-sm text-blue-700 mb-2">
          Select the main city for league organization, then choose the specific area where the club is located.
        </p>
        <div className="text-xs text-blue-600">
          <p><strong>Example:</strong> Club in "El Paraíso" → City: "Marbella", Area: "El Paraíso"</p>
          <p><strong>Result:</strong> Displays as "El Paraíso (Marbella)" and belongs to Marbella League</p>
        </div>
      </div>

      {/* Main City Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Main City (for League Organization) *
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
              {cityOptions.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label} - {city.description}
                </option>
              ))}
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

      {/* Specific Area Selection */}
      {availableAreas.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specific Area/Neighborhood
            <DataSourceIndicator source={getFieldSource('location.area')} />
          </label>
          <select
            value={formData.location.area}
            onChange={(e) => handleChange('location.area', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple"
          >
            <option value="">Select area (optional)...</option>
            {availableAreas.map(area => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose the specific neighborhood or area where the club is located
          </p>
        </div>
      )}

      {/* Display Name Preview */}
      {formData.location.displayName && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-1">
            📍 Display Name Preview
          </h4>
          <p className="text-lg font-semibold text-green-800">
            {formData.location.displayName}
          </p>
          <p className="text-sm text-green-700 mt-1">
            This is how the location will appear to users in listings and club pages
          </p>
        </div>
      )}

      {/* League Organization Info */}
      {formData.location.city && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-1">
            🏆 League Organization
          </h4>
          <p className="text-sm text-yellow-700">
            This club will be part of the <strong>{cityOptions.find(c => c.value === formData.location.city)?.label}</strong> league.
            {formData.location.area && formData.location.area !== formData.location.city && (
              <span> Players can easily find it by searching for both "{formData.location.area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}" and "{cityOptions.find(c => c.value === formData.location.city)?.label}".</span>
            )}
          </p>
        </div>
      )}
      
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

      {/* Examples Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          💡 Examples
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <strong>El Paraíso club:</strong> City = "Marbella", Area = "El Paraíso" 
            → Displays as "El Paraíso (Marbella)"
          </div>
          <div>
            <strong>Central Marbella club:</strong> City = "Marbella", Area = "Marbella" 
            → Displays as "Marbella"
          </div>
          <div>
            <strong>San Pedro club:</strong> City = "Marbella", Area = "San Pedro de Alcántara" 
            → Displays as "San Pedro de Alcántara (Marbella)"
          </div>
        </div>
      </div>
    </div>
  )

  // Use CourtsManager for courts info
  const renderCourtsInfo = () => (
    <div className="space-y-4">
      {isGoogleImport && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-yellow-900 mb-1">⚠️ Default Data</p>
          <p className="text-yellow-700">Court information is set to default values. Please update with actual court details for tennis, padel, and pickleball.</p>
        </div>
      )}
      
      <CourtsManager formData={formData} handleChange={handleChange} />
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
                  title="Fill with random test data including multi-sport courts"
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
                'Location & Areas',
                'Courts & Sports',
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
