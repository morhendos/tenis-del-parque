'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Image from 'next/image'
import { loginContent } from '@/lib/content/loginContent'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale || 'es'
  const returnUrl = searchParams.get('return') || `/${locale}/player/dashboard`
  const activated = searchParams.get('activated')
  
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  
  const t = loginContent[locale]

  const checkAuth = useCallback(async () => {
    try {
      // Check if player is already authenticated
      const playerRes = await fetch('/api/auth/check')
      if (playerRes.ok) {
        router.push(`/${locale}/player/dashboard`)
        return
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setChecking(false)
    }
  }, [router, locale])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = t.form.errors.emailRequired
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t.form.errors.invalidEmail
    }
    
    if (!formData.password) {
      newErrors.password = t.form.errors.passwordRequired
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setErrors({})
    
    try {
      // Only try player login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        // Store user info if needed
        if (data.user) {
          localStorage.setItem('userInfo', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role
          }))
        }
        
        // Redirect to player dashboard or return URL
        router.push(returnUrl)
      } else {
        setErrors({ submit: data.error || t.form.errors.generic })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ submit: t.form.errors.connection })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading until auth check is complete
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg md:flex md:items-center md:justify-center md:py-8 md:px-4">
      <div className="w-full md:max-w-md">
        <div className="bg-white min-h-screen md:min-h-0 md:rounded-xl md:shadow-xl p-6 sm:p-8 flex flex-col justify-center md:justify-start">
          {/* Logo/Header - Mobile optimized sizing */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mb-6 sm:mb-8">
              <a href={`/${locale}`}>
                <Image 
                  src="/logo.png" 
                  alt="Liga del Parque"
                  width={160}
                  height={160}
                  className="h-32 sm:h-40 w-auto mx-auto hover:scale-105 transition-transform duration-200 cursor-pointer"
                  priority
                />
              </a>
            </div>
          </div>

          {/* Success message for account activation */}
          {activated && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm text-center">
                {locale === 'es' 
                  ? '¡Tu cuenta ha sido activada! Ahora puedes iniciar sesión.'
                  : 'Your account has been activated! You can now log in.'}
              </p>
            </div>
          )}

          {/* Login Form - Mobile optimized */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder={t.form.emailPlaceholder}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
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
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder={t.form.passwordPlaceholder}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 sm:p-4 text-sm">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="leading-5">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* Mobile-optimized button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-parque-purple hover:bg-parque-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-parque-purple disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 touch-manipulation"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.form.submitting}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {t.form.submit}
                </>
              )}
            </button>
          </form>

          {/* Links - Mobile optimized */}
          <div className="mt-6 sm:mt-8 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {locale === 'es' ? 'Nuevo en Tenis del Parque' : 'New to Tenis del Parque'}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <a 
                href={`/${locale}#cities`}
                className="block w-full bg-parque-green text-white py-3 px-4 rounded-lg font-medium hover:bg-parque-green/90 transition-colors touch-manipulation"
              >
                {t.signUp}
              </a>
              
              <a 
                href={`/${locale}/forgot-password`} 
                className="block text-sm text-gray-600 hover:text-gray-800 transition-colors touch-manipulation"
              >
                {t.forgotPassword}
              </a>
              
              <a 
                href="/admin-login" 
                className="block text-sm text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
              >
                {t.adminAccess}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}