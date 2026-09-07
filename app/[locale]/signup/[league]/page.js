'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Navigation from '../../../../components/common/Navigation'
import Footer from '../../../../components/common/Footer'
import ModernRegistrationForm from '../../../../components/leagues/ModernRegistrationForm'
import LeagueWaitlistForm from '../../../../components/leagues/LeagueWaitlistForm'
import EnhancedSuccessMessage from '../../../../components/ui/EnhancedSuccessMessage'
import { homeContent } from '../../../../lib/content/homeContent'
import { i18n } from '../../../../lib/i18n/config'

export default function LeagueRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
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

  // Handle return from Stripe Checkout
  useEffect(() => {
    if (!league) return
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      let stored = {}
      try {
        stored = JSON.parse(sessionStorage.getItem('tdp_pending_payment') || '{}')
      } catch (e) {}
      sessionStorage.removeItem('tdp_pending_payment')
      prepareSuccessData({ player: { league: {} } }, stored.playerName || 'Player')
    } else if (payment === 'cancelled') {
      let stored = {}
      try {
        stored = JSON.parse(sessionStorage.getItem('tdp_pending_payment') || '{}')
      } catch (e) {}
      setErrors({
        payment: validLocale === 'es'
          ? 'El pago no se completó. Tu plaza no está confirmada hasta que pagues.'
          : 'Payment was not completed. Your spot is not confirmed until you pay.',
        paymentEmail: stored.email || null
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [league])

  const startCheckout = async (email, playerName) => {
    try {
      sessionStorage.setItem('tdp_pending_payment', JSON.stringify({ email, playerName }))
      const response = await fetch('/api/players/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          leagueId: league._id,
          language: validLocale
        })
      })
      const data = await response.json()
      if (data.success && data.url) {
        window.location.href = data.url
        return true
      }
      return false
    } catch (e) {
      console.error('Checkout error:', e)
      return false
    }
  }

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
            discountCode: formData.discountCode
          })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          if (response.status === 409) {
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
        
        const existingName = profileData.player.name || 'Player'
        const existingReg = data.player?.currentRegistration
        if (existingReg && existingReg.paymentStatus === 'pending' && existingReg.finalPrice > 0) {
          const redirected = await startCheckout(data.player.email, existingName)
          if (redirected) return
        }
        prepareSuccessData(data, existingName)
        
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
            discountCode: formData.discountCode
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
        
        // Auto-login after successful registration
        await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password
        })
        
        // Trigger browser password manager to save credentials
        if (window.PasswordCredential) {
          try {
            const cred = new window.PasswordCredential({
              id: formData.email,
              password: formData.password,
              name: formData.name
            })
            await navigator.credentials.store(cred)
          } catch (credError) {
            // Silently fail - password manager is optional
            console.log('Credential storage not available')
          }
        }
        
        const newReg = data.player?.currentRegistration
        if (newReg && newReg.paymentStatus === 'pending' && newReg.finalPrice > 0) {
          const redirected = await startCheckout(data.player.email, formData.name)
          if (redirected) return
        }
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
    
    const cityName = league.cityData?.name?.[validLocale] || league.cityData?.name?.es || league.location?.city
    
    setRegistrationData({
      playerName,
      leagueName: league.name,
      cityName,
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-parque-purple border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-gray-600 text-sm">{validLocale === 'es' ? 'Cargando...' : 'Loading...'}</div>
        </div>
      </div>
    )
  }

  // Error state - Show waitlist form instead of error
  if (error || !league) {
    // Extract city from slug (e.g., "liga-de-marbella" -> "marbella")
    const citySlug = leagueSlug?.replace(/^liga-de-/, '') || ''
    const cityName = citySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        {/* Decorative background */}
        <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-300/15 rounded-full blur-3xl"></div>
        </div>
        
        <Navigation locale={validLocale} showBackButton={true} />
        
        <div className="flex-1 flex items-center justify-center px-4 py-8 pt-24">
          <div className="w-full max-w-lg">
            <LeagueWaitlistForm 
              citySlug={citySlug}
              cityName={cityName}
              locale={validLocale}
            />
            
            {/* Link to see other leagues */}
            <div className="text-center mt-6">
              <a 
                href={`/${validLocale}/leagues`}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                {validLocale === 'es' ? '← Ver ligas disponibles' : '← View available leagues'}
              </a>
            </div>
          </div>
        </div>
        
        <Footer content={t.footer} />
      </div>
    )
  }

  // Success state
  if (isSubmitted && registrationData) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navigation locale={validLocale} showBackButton={true} />
        
        <div className="flex-1">
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
        </div>
        
        <div className="mt-auto">
          <Footer content={t.footer} />
        </div>
      </div>
    )
  }

  // Registration form
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Subtle decorative background - only on larger screens */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-300/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-teal-300/15 rounded-full blur-3xl"></div>
      </div>
      
      <Navigation locale={validLocale} showBackButton={true} />
      
      {/* Mobile-optimized container */}
      <div className="flex-1 sm:container sm:mx-auto px-0 sm:px-4 pt-20 sm:pt-24 sm:pb-8 relative z-10">
        {/* Header - Clean and centered */}
        <div className="text-center mb-4 sm:mb-6 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {validLocale === 'es' ? 'Registro a la Liga' : 'League Registration'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {validLocale === 'es' 
              ? 'Completa el formulario para unirte'
              : 'Complete the form to join'}
          </p>
        </div>

        {errors.payment && (
          <div className="max-w-lg mx-auto mb-4 px-4 sm:px-0">
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-sm text-amber-800">
              <p>{errors.payment}</p>
              {errors.paymentEmail && (
                <button
                  onClick={() => startCheckout(errors.paymentEmail, 'Player')}
                  className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700"
                >
                  {validLocale === 'es' ? 'Reintentar pago' : 'Retry payment'}
                </button>
              )}
            </div>
          </div>
        )}

        <ModernRegistrationForm
          league={league}
          locale={validLocale}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
        />
      </div>
      
      {/* Footer */}
      <Footer content={t.footer} />
    </div>
  )
}
