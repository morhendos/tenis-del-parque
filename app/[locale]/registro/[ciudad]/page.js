'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import SignupSection from '@/components/home/SignupSection'
import Footer from '@/components/common/Footer'
import { homeContent } from '@/lib/content/homeContent'
import { multiLeagueHomeContent } from '@/lib/content/multiLeagueHomeContent'

export default function CitySignupPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale || 'es'
  const citySlug = params.ciudad || params.city
  
  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    whatsapp: '', 
    level: '' 
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const t = homeContent[locale]
  const content = multiLeagueHomeContent[locale]
  
  // Fetch league information
  useEffect(() => {
    async function fetchLeague() {
      try {
        const response = await fetch(`/api/leagues/${citySlug}`)
        if (!response.ok) {
          throw new Error('League not found')
        }
        const data = await response.json()
        setLeague(data.league)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (citySlug) {
      fetchLeague()
    }
  }, [citySlug])
  
  // Check if locale is Spanish - if not, redirect to English route
  if (locale !== 'es') {
    router.replace(`/en/signup/${citySlug}`)
    return null
  }

  // Validate form data
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = t.signup.form.errors.required
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t.signup.form.errors.required
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t.signup.form.errors.invalidEmail
    }
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = t.signup.form.errors.required
    } else if (!/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/.test(formData.whatsapp.replace(/\s/g, ''))) {
      newErrors.whatsapp = t.signup.form.errors.invalidPhone
    }
    
    if (!formData.level) {
      newErrors.level = t.signup.form.errors.required
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!league) {
      setErrors({ submit: 'League information not available' })
      return
    }
    
    // Clear previous errors
    setErrors({})
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/players/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          language: locale,
          leagueId: league._id,
          leagueSlug: league.slug,
          season: league.seasons?.[0]?.name || 'summer-2025'
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setIsSubmitted(true)
        console.log('Player registered:', data.player)
        
        // Redirect to home after 5 seconds
        setTimeout(() => {
          router.push(`/${locale}`)
        }, 5000)
      } else {
        // Handle API errors
        if (response.status === 409) {
          setErrors({ email: t.signup.form.errors.alreadyRegistered })
        } else if (data.errors) {
          // Handle validation errors from API
          const apiErrors = {}
          data.errors.forEach(error => {
            if (error.includes('email')) apiErrors.email = error
            else if (error.includes('whatsapp')) apiErrors.whatsapp = error
            else if (error.includes('name')) apiErrors.name = error
            else if (error.includes('level')) apiErrors.level = error
          })
          setErrors(apiErrors)
        } else {
          // Generic error
          setErrors({ submit: data.error || 'Something went wrong. Please try again.' })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ 
        submit: locale === 'es' 
          ? 'Error de conexión. Por favor, inténtalo de nuevo.' 
          : 'Connection error. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 tennis-ball mb-4 animate-bounce mx-auto"></div>
          <div className="text-parque-purple/60 text-lg font-light">Cargando...</div>
        </div>
      </div>
    )
  }

  // Show error if league not found or inactive
  if (error || !league || league.status === 'inactive') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <Navigation currentPage="signup" />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-light text-parque-purple mb-4">
            Liga no encontrada
          </h1>
          <p className="text-gray-600 mb-8">
            La liga que buscas no existe o no está activa.
          </p>
          <button 
            onClick={() => router.push(`/${locale}`)}
            className="bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
        <Footer content={t.footer} />
      </div>
    )
  }

  // Check if it's a coming soon league
  const isComingSoon = league.status === 'coming_soon'
  const launchDate = league.expectedLaunchDate ? new Date(league.expectedLaunchDate) : null
  const formattedDate = launchDate ? launchDate.toLocaleDateString(locale, { 
    month: 'long', 
    year: 'numeric' 
  }) : null

  // Custom content for the signup page
  const signupContent = {
    ...t.signup,
    title: isComingSoon 
      ? `Pre-regístrate para ${league.name}`
      : `Únete a la Liga de ${league.name}`,
    subtitle: isComingSoon
      ? `Sé de los primeros en jugar cuando lancemos en ${league.name}`
      : `Juega al tenis en ${league.name} con jugadores de tu nivel`
  }

  // Update success message for coming soon leagues
  if (isComingSoon && isSubmitted) {
    signupContent.success = {
      title: '¡Estás en la lista!',
      message: `Te contactaremos cuando la liga de ${league.name} esté lista para lanzar. ¡Prepárate para jugar!`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
      <Navigation currentPage="signup" />
      
      <div className="pt-16">
        {/* League Header */}
        <div className="bg-gradient-to-br from-parque-purple/10 to-parque-green/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-light text-parque-purple mb-4">
              Liga de {league.name}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {league.location?.region || 'España'}
            </p>
            {isComingSoon ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 backdrop-blur-sm rounded-full text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-blue-800">
                  {content.cities.comingSoon} {formattedDate && `- ${content.cities.launching} ${formattedDate}`}
                </span>
              </div>
            ) : league?.seasons?.[0] && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm">
                <span className="w-2 h-2 bg-parque-green rounded-full animate-pulse"></span>
                <span className="text-gray-700">
                  Inscripciones abiertas - {league.seasons[0].name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon Notice */}
        {isComingSoon && (
          <div className="container mx-auto px-4 pt-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  ¡Próximamente!
                </h3>
                <p className="text-blue-700">
                  Estamos preparando el lanzamiento de la liga en {league.name}. Pre-regístrate ahora para ser de los primeros en jugar.
                </p>
                {league.waitingListCount > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    <span className="font-semibold">{league.waitingListCount}</span> {content.cities.interested}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errors.submit && (
          <div className="container mx-auto px-4 pt-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        {/* Signup Form */}
        <SignupSection 
          content={signupContent} 
          formData={formData} 
          isSubmitted={isSubmitted} 
          isSubmitting={isSubmitting} 
          onSubmit={handleSubmit} 
          onChange={handleChange} 
          language={locale}
          errors={errors}
        />
      </div>
      
      <Footer content={t.footer} />
    </div>
  )
}