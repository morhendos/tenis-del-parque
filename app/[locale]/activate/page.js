'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import { activateContent } from '@/lib/content/activateContent'
import { homeContent } from '@/lib/content/homeContent'

export default function ActivatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale || 'es'
  const token = searchParams.get('token')
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(null)
  const [checkingToken, setCheckingToken] = useState(true)
  
  const t = activateContent[locale]
  const footerContent = homeContent[locale]?.footer

  // Check if token is valid
  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setCheckingToken(false)
      return
    }

    // For now, assume token is valid
    // In production, you would verify the token with the backend
    setTokenValid(true)
    setCheckingToken(false)
  }, [token])

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
    
    if (!formData.password) {
      newErrors.password = t.form.errors.passwordRequired
    } else if (formData.password.length < 8) {
      newErrors.password = t.form.errors.passwordLength
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.form.errors.confirmRequired
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.form.errors.passwordMismatch
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
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Redirect to login page after successful activation
        router.push(`/${locale}/login?activated=true`)
      } else {
        setErrors({ submit: data.error || t.form.errors.generic })
        if (data.error?.includes('expired') || data.error?.includes('invalid')) {
          setTokenValid(false)
        }
      }
    } catch (error) {
      console.error('Activation error:', error)
      setErrors({ submit: t.form.errors.connection })
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 tennis-ball mb-4 animate-bounce mx-auto"></div>
          <div className="text-parque-purple/60 text-lg font-light">
            {locale === 'es' ? 'Verificando...' : 'Verifying...'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg to-white">
      <Navigation currentPage="activate" />
      
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href={`/${locale}`} className="inline-block">
              <Image
                src="/logo-big.png"
                alt="Tenis del Parque"
                width={120}
                height={120}
                className="mx-auto"
                priority
              />
            </Link>
          </div>
          
          {/* Activation Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            {tokenValid === false ? (
              // Invalid Token Message
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {t.invalidToken.title}
                </h1>
                <p className="text-gray-600 mb-6">
                  {t.invalidToken.message}
                </p>
                <Link
                  href={`/${locale}/login`}
                  className="inline-block bg-parque-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-parque-purple/90 transition-colors"
                >
                  {t.invalidToken.button}
                </Link>
              </div>
            ) : (
              // Activation Form
              <>
                <h1 className="text-3xl font-light text-parque-purple text-center mb-2">
                  {t.title}
                </h1>
                <p className="text-gray-600 text-center mb-8">
                  {t.subtitle}
                </p>
                
                {/* Error Alert */}
                {errors.submit && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm text-center">{errors.submit}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.form.passwordLabel}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors`}
                      placeholder={t.form.passwordPlaceholder}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">{t.form.passwordHint}</p>
                  </div>
                  
                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.form.confirmLabel}
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors`}
                      placeholder={t.form.confirmPlaceholder}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-parque-purple text-white py-3 rounded-lg font-medium hover:bg-parque-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? t.form.submitting : t.form.submit}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer content={footerContent} />
    </div>
  )
}