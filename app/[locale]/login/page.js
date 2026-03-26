'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { loginContent } from '@/lib/content/loginContent'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const { data: session, status } = useSession()
  const locale = params.locale || 'es'
  const returnUrl = searchParams.get('return')
  const activated = searchParams.get('activated')
  const error = searchParams.get('error')
  
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const t = loginContent[locale]

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'admin') {
        window.location.href = '/admin/dashboard'
      } else {
        // For players, check if they have a saved language preference
        checkUserLanguageAndRedirect()
      }
    }
  }, [session, status, router, locale, returnUrl])

  const checkUserLanguageAndRedirect = async () => {
    try {
      // Fetch user profile to get language preference
      const response = await fetch('/api/player/profile')
      if (response.ok) {
        const data = await response.json()
        const userLanguage = data.user?.preferences?.language
        
        if (userLanguage && userLanguage !== locale) {
          // User prefers a different language than the current URL locale
          // Redirect to their preferred language
          if (returnUrl) {
            // Update the return URL to use the user's preferred language
            const updatedReturnUrl = returnUrl.replace(`/${locale}/`, `/${userLanguage}/`)
            window.location.href = updatedReturnUrl
          } else {
            window.location.href = `/${userLanguage}/player/dashboard`
          }
        } else {
          // Use the current locale or user's preference (they match)
          window.location.href = returnUrl || `/${locale}/player/dashboard`
        }
      } else {
        // If profile fetch fails, just use the URL locale
        window.location.href = returnUrl || `/${locale}/player/dashboard`
      }
    } catch (error) {
      console.error('Error fetching user language preference:', error)
      // Fallback to URL locale
      window.location.href = returnUrl || `/${locale}/player/dashboard`
    }
  }

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
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Map NextAuth errors to user-friendly messages
        let errorMessage = t.form.errors.generic
        
        if (result.error.includes('User not found') || result.error.includes('Invalid password')) {
          errorMessage = locale === 'es' 
            ? 'Correo electrónico o contraseña incorrectos'
            : 'Invalid email or password'
        } else if (result.error.includes('inactive')) {
          errorMessage = locale === 'es'
            ? 'Tu cuenta está inactiva. Por favor, contacta con soporte.'
            : 'Your account is inactive. Please contact support.'
        }
        
        setErrors({ submit: errorMessage })
      } else {
        // Success - NextAuth will handle the redirect via the useEffect above
        router.refresh()
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ submit: t.form.errors.connection })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading until auth status is determined
  if (status === 'loading') {
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
                  src="/logo-liga-costa-del-sol-big.webp" 
                  alt="Liga de la Costa del Sol"
                  width={400}
                  height={400}
                  className="h-40 sm:h-48 w-auto mx-auto hover:scale-105 transition-transform duration-200 cursor-pointer"
                  priority
                  quality={90}
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

          {/* Error message from NextAuth */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm text-center">
                {locale === 'es' 
                  ? 'Ha ocurrido un error. Por favor, inténtalo de nuevo.'
                  : 'An error occurred. Please try again.'}
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
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-3 pr-11 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder={t.form.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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
              
              <Link 
                href={`/${locale}/forgot-password`} 
                className="block text-sm text-gray-600 hover:text-gray-800 transition-colors touch-manipulation"
              >
                {t.forgotPassword}
              </Link>
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