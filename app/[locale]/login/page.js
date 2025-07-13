'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import { loginContent } from '@/lib/content/loginContent'
import { homeContent } from '@/lib/content/homeContent'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale || 'es'
  const returnUrl = searchParams.get('return') || `/${locale}/player/dashboard`
  
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  const t = loginContent[locale]
  const footerContent = homeContent[locale]?.footer

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Store user info if needed
        if (data.user) {
          localStorage.setItem('userInfo', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role
          }))
        }
        
        // Redirect based on role
        if (data.user?.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push(returnUrl)
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg to-white">
      <Navigation currentPage="login" />
      
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
          
          {/* Login Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-light text-parque-purple text-center mb-8">
              {t.title}
            </h1>
            
            {/* Error Alert */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{errors.submit}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.emailLabel}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-colors`}
                  placeholder={t.form.emailPlaceholder}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
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
              </div>
              
              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  href={`/${locale}/forgot-password`}
                  className="text-sm text-parque-purple hover:text-parque-purple/80 transition-colors"
                >
                  {t.forgotPassword}
                </Link>
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
            
            {/* Sign Up Link */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                {t.noAccount}{' '}
                <Link 
                  href={`/${locale}#cities`}
                  className="text-parque-purple font-medium hover:text-parque-purple/80 transition-colors"
                >
                  {t.signUp}
                </Link>
              </p>
            </div>
          </div>
          
          {/* Admin Login Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/admin-login"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {t.adminAccess}
            </Link>
          </div>
        </div>
      </div>
      
      <Footer content={footerContent} />
    </div>
  )
}