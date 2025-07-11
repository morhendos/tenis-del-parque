'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '../../../components/common/Navigation'
import SignupSection from '../../../components/home/SignupSection'
import Footer from '../../../components/common/Footer'
import { useLanguage } from '../../../lib/hooks/useLanguage'
import { homeContent } from '../../../lib/content/homeContent'

export default function LeagueSignupPage() {
  const params = useParams()
  const router = useRouter()
  const leagueSlug = params.league
  
  const { language, setLanguage, isLanguageLoaded } = useLanguage()
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

  const t = homeContent[language]

  // Fetch league information
  useEffect(() => {
    async function fetchLeague() {
      try {
        const response = await fetch(`/api/leagues/${leagueSlug}`)
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
    
    if (leagueSlug) {
      fetchLeague()
    }
  }, [leagueSlug])

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
          language,
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
          router.push('/sotogrande')
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
        submit: language === 'es' 
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
  if (!isLanguageLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 tennis-ball mb-4 animate-bounce mx-auto"></div>
          <div className="text-parque-purple/60 text-lg font-light">Loading...</div>
        </div>
      </div>
    )
  }

  // Show error if league not found
  if (error || !league) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <Navigation 
          currentPage="signup" 
          language={language} 
          onLanguageChange={setLanguage} 
        />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-light text-parque-purple mb-4">
            {language === 'es' ? 'Liga no encontrada' : 'League not found'}
          </h1>
          <p className="text-gray-600 mb-8">
            {language === 'es' 
              ? 'La liga que buscas no existe o no está activa.'
              : 'The league you are looking for does not exist or is not active.'}
          </p>
          <button 
            onClick={() => router.push('/sotogrande')}
            className="bg-parque-purple text-white px-8 py-3 rounded-full hover:bg-parque-purple/90 transition-colors"
          >
            {language === 'es' ? 'Volver al inicio' : 'Back to home'}
          </button>
        </div>
        <Footer content={t.footer} />
      </div>
    )
  }

  // Custom content for the signup page
  const signupContent = {
    ...t.signup,
    title: `${language === 'es' ? 'Únete a' : 'Join'} ${league.name}`,
    subtitle: league.description?.[language] || t.signup.subtitle
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
      <Navigation 
        currentPage="signup" 
        language={language} 
        onLanguageChange={setLanguage} 
      />
      
      <div className="pt-16">
        {/* League Header */}
        <div className="bg-gradient-to-br from-parque-purple/10 to-parque-green/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-light text-parque-purple mb-4">
              {league.name}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {league.location.city}, {league.location.region}
            </p>
            {league.seasons?.[0] && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm">
                <span className="w-2 h-2 bg-parque-green rounded-full animate-pulse"></span>
                <span className="text-gray-700">
                  {language === 'es' ? 'Inscripciones abiertas' : 'Registration open'} - {league.seasons[0].name}
                </span>
              </div>
            )}
          </div>
        </div>

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
          language={language}
          errors={errors}
        />
      </div>
      
      <Footer content={t.footer} />
    </div>
  )
}