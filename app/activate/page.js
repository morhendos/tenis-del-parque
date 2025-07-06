'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '../../lib/hooks/useLanguage'
import { activateContent } from '../../lib/content/activateContent'

function ActivateContent() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language, isLanguageLoaded } = useLanguage()
  
  const t = activateContent[language]

  const validateToken = useCallback(async (tokenToValidate) => {
    try {
      const response = await fetch(`/api/auth/activate?token=${tokenToValidate}`)
      const data = await response.json()

      if (data.success) {
        setUserInfo(data.user)
        setValidating(false)
      } else {
        setError(data.error || t.error.failedValidation)
        setValidating(false)
      }
    } catch (error) {
      console.error('Token validation error:', error)
      setError(t.error.failedValidation)
      setValidating(false)
    }
  }, [t.error.failedValidation])

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      validateToken(tokenFromUrl)
    } else {
      setError(t.error.noToken)
      setValidating(false)
    }
  }, [searchParams, t.error.noToken, validateToken])

  // Show loading until language is determined to prevent flickering
  if (!isLanguageLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError(t.validation.passwordMismatch)
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError(t.validation.passwordMinLength)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login?message=Account activated successfully')
        }, 5000)
      } else {
        setError(data.error || t.validation.activationFailed)
      }
    } catch (error) {
      console.error('Activation error:', error)
      setError(t.validation.activationFailed)
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg md:flex md:items-center md:justify-center md:py-8 md:px-4">
        <div className="w-full md:max-w-md">
          <div className="bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-xl p-6 sm:p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto mb-4"></div>
              <p className="text-gray-600">{t.loading.validating}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg md:flex md:items-center md:justify-center md:py-8 md:px-4">
        <div className="w-full md:max-w-md">
          <div className="bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-xl p-6 sm:p-8">
            <div className="text-center">
              <div className="mb-4 sm:mb-6">
                <a href="/">
                  <Image 
                    src="/logo.png" 
                    alt="Liga del Parque"
                    width={112}
                    height={112}
                    className="h-20 sm:h-28 w-auto mx-auto hover:scale-105 transition-transform duration-200 cursor-pointer"
                  />
                </a>
              </div>
              
              <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-green-100 mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t.success.title}
              </h2>
              
              <p className="text-sm sm:text-base text-gray-600 mb-6 px-2">
                {t.success.message}
              </p>
              
              <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t.success.redirecting}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg md:flex md:items-center md:justify-center md:py-8 md:px-4">
        <div className="w-full md:max-w-md">
          <div className="bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-xl p-6 sm:p-8">
            <div className="text-center">
              <div className="mb-4 sm:mb-6">
                <a href="/">
                  <Image 
                    src="/logo.png" 
                    alt="Liga del Parque"
                    width={112}
                    height={112}
                    className="h-20 sm:h-28 w-auto mx-auto hover:scale-105 transition-transform duration-200 cursor-pointer"
                  />
                </a>
              </div>
              
              <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-100 mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t.error.invalidToken}
              </h2>
              
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-2">
                {error}
              </p>
              
              <Link
                href="/login"
                className="inline-block bg-parque-purple text-white px-6 py-4 rounded-lg hover:bg-parque-purple/90 transition-colors font-medium touch-manipulation w-full sm:w-auto"
              >
                {t.error.goToLogin}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg md:flex md:items-center md:justify-center md:py-8 md:px-4">
      <div className="w-full md:max-w-md">
        <div className="bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-xl p-6 sm:p-8">
          {/* Logo/Header - Mobile optimized sizing */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6">
              <a href="/">
                <Image 
                  src="/logo.png" 
                  alt="Liga del Parque"
                  width={144}
                  height={144}
                  className="h-24 sm:h-32 lg:h-36 w-auto mx-auto hover:scale-105 transition-transform duration-200 cursor-pointer"
                />
              </a>
            </div>
          
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t.form.title}
            </h2>
            
            <div className="space-y-2 sm:space-y-3">
              <p className="text-sm sm:text-base text-gray-600">
                {t.form.welcome}, <span className="font-semibold text-parque-purple">{userInfo?.player?.name}</span>!
              </p>
              <p className="text-xs sm:text-sm text-gray-500 px-2">
                {t.form.subtitle}
              </p>
              
              {/* Mobile-optimized badges */}
              {userInfo?.player?.league && (
                <div className="pt-2">
                  {/* Mobile: Stack badges vertically, Desktop: Horizontal */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-center items-center">
                    <span className="bg-parque-purple/10 text-parque-purple px-3 py-1.5 rounded-full text-xs font-medium">
                      {t.form.leagueInfo}: {userInfo.player.league.name}
                    </span>
                    {userInfo.player.season && (
                      <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                        {userInfo.player.season}
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                      {t.form.levelInfo}: {userInfo.player.level}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activation Form - Mobile optimized */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 sm:p-4 text-sm">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="leading-5">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={userInfo?.email || ''}
                disabled
                className="w-full px-3 sm:px-4 py-3 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder={t.form.passwordPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.confirmPasswordLabel}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder={t.form.confirmPasswordPlaceholder}
              />
            </div>

            {/* Mobile-optimized button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-parque-purple hover:bg-parque-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-parque-purple disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 touch-manipulation"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.form.activating}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t.form.activateButton}
                </>
              )}
            </button>

            <div className="text-center pt-3 sm:pt-4">
              <Link
                href="/login"
                className="text-sm text-parque-purple hover:text-parque-purple/80 transition-colors font-medium touch-manipulation"
              >
                {t.form.alreadyHaveAccount}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ActivateContent />
    </Suspense>
  )
}