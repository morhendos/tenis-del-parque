'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Navigation from '../../../../components/common/Navigation'
import Footer from '../../../../components/common/Footer'
import ModernRegistrationForm from '../../../../components/leagues/ModernRegistrationForm'
import EnhancedSuccessMessage from '../../../../components/ui/EnhancedSuccessMessage'
import { homeContent } from '../../../../lib/content/homeContent'
import { i18n } from '../../../../lib/i18n/config'

export default function LeagueRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const leagueSlug = params.league
  const locale = params.locale || 'en'
  
  const validLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale
  
  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [registrationData, setRegistrationData] = useState(null)

  const t = homeContent[validLocale] || homeContent[i18n.defaultLocale]

  // Fetch league information
  useEffect(() => {
    async function fetchLeague() {
      try {
        const response = await fetch(`/api/leagues/${leagueSlug}`)
        if (!response.ok) throw new Error('League not found')
        
        const data = await response.json()
        setLeague(data.league)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (leagueSlug) fetchLeague()
  }, [leagueSlug])

  const handleSubmit = async (formData, hasAccount) => {
    setErrors({})
    setIsSubmitting(true)
    
    try {
      if (hasAccount) {
        // Existing user flow - Sign in first, then register
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password
        })
        
        if (!signInResult?.ok) {
          setErrors({ 
            submit: validLocale === 'es' 
              ? 'Email o contraseña incorrectos' 
              : 'Incorrect email or password' 
          })
          return
        }
        
        // After successful sign in, fetch the user's profile data
        const profileResponse = await fetch('/api/player/profile')
        if (!profileResponse.ok) {
          setErrors({ 
            submit: validLocale === 'es' 
              ? 'Error al obtener tu perfil' 
              : 'Error fetching your profile' 
          })
          return
        }
        
        const profileData = await profileResponse.json()
        
        // Now register the signed-in user to the league using their existing data
        const response = await fetch('/api/players/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profileData.player.name,
            email: profileData.player.email,
            whatsapp: profileData.player.whatsapp,
            level: formData.level || league.skillLevel,
            language: validLocale,
            leagueId: league._id,
            leagueSlug: league.slug,
            season: league.season?.year + '-' + league.season?.type
          })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          if (response.status === 409) {
            // Already registered - this is informational, not an error
            setErrors({ 
              info: validLocale === 'es' 
                ? 'Ya estás registrado en esta liga. Puedes ver tu progreso en el panel de jugador.' 
                : 'You are already registered in this league. You can view your progress in the player dashboard.' 
            })
          } else {
            setErrors({ submit: data.error || 'Registration failed' })
          }
          return
        }
        
        // Success - show success message
        prepareSuccessData(data, formData.name || 'Player')
        
      } else {
        // New user flow - Register and create account
        const response = await fetch('/api/players/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            whatsapp: formData.whatsapp,
            level: formData.level || league.skillLevel,
            password: formData.password,
            language: validLocale,
            leagueId: league._id,
            leagueSlug: league.slug,
            season: league.season?.year + '-' + league.season?.type
          })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          if (response.status === 409) {
            setErrors({ 
              email: validLocale === 'es' 
                ? 'Este email ya está registrado' 
                : 'This email is already registered' 
            })
          } else if (data.errors) {
            const apiErrors = {}
            data.errors.forEach(error => {
              if (error.includes('email')) apiErrors.email = error
              else if (error.includes('whatsapp')) apiErrors.whatsapp = error
              else if (error.includes('name')) apiErrors.name = error
              else apiErrors.submit = error
            })
            setErrors(apiErrors)
          } else {
            setErrors({ submit: data.error || 'Registration failed' })
          }
          return
        }
        
        // Success - show success message
        prepareSuccessData(data, formData.name)
      }
      
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ 
        submit: validLocale === 'es' 
          ? 'Error de conexión. Inténtalo de nuevo.' 
          : 'Connection error. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const prepareSuccessData = (data, playerName) => {
    const shareUrl = validLocale === 'es' 
      ? `${window.location.origin}/es/registro/${league.slug}`
      : `${window.location.origin}/en/signup/${league.slug}`
    
    setRegistrationData({
      playerName,
      leagueName: league.name,
      leagueStatus: league.status,
      expectedStartDate: league.seasonConfig?.startDate,
      whatsappGroupLink: data.player?.league?.whatsappGroup?.inviteLink,
      shareUrl
    })
    
    setIsSubmitted(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">{validLocale === 'es' ? 'Cargando...' : 'Loading...'}</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !league) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <Navigation locale={validLocale} />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {validLocale === 'es' ? 'Liga no encontrada' : 'League not found'}
          </h1>
          <p className="text-gray-600 mb-8">
            {validLocale === 'es' 
              ? 'La liga que buscas no existe o no está activa.'
              : 'The league you are looking for does not exist or is not active.'}
          </p>
          <a 
            href={`/${validLocale}/leagues`}
            className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {validLocale === 'es' ? 'Ver todas las ligas' : 'View all leagues'}
          </a>
        </div>
        <Footer content={t.footer} />
      </div>
    )
  }

  // Success state
  if (isSubmitted && registrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
        <Navigation locale={validLocale} />
        
        <div className="container mx-auto px-4 py-8 pt-24 relative z-10">
          <EnhancedSuccessMessage 
            playerName={registrationData.playerName}
            leagueName={registrationData.leagueName}
            leagueStatus={registrationData.leagueStatus}
            expectedStartDate={registrationData.expectedStartDate}
            whatsappGroupLink={registrationData.whatsappGroupLink}
            shareUrl={registrationData.shareUrl}
            language={validLocale}
          />
        </div>
        
        <Footer content={t.footer} />
      </div>
    )
  }

  // Registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <Navigation locale={validLocale} />
      
      <div className="container mx-auto px-4 py-8 pt-24 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {validLocale === 'es' ? 'Registro a la Liga' : 'League Registration'}
          </h1>
          <p className="text-gray-600">
            {validLocale === 'es' 
              ? 'Completa el formulario para unirte a la liga'
              : 'Complete the form to join the league'}
          </p>
        </div>

        <ModernRegistrationForm
          league={league}
          locale={validLocale}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
        />
      </div>
      
      <Footer content={t.footer} />
    </div>
  )
}
