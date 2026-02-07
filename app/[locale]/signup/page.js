'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import Navigation from '../../../components/common/Navigation'
import Footer from '../../../components/common/Footer'
import { homeContent } from '../../../lib/content/homeContent'
import { i18n } from '../../../lib/i18n/config'

export default function SignupPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale || 'es'
  const validLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    password: ''
  })

  const t = homeContent[validLocale] || homeContent[i18n.defaultLocale]

  const content = {
    es: {
      title: 'Crear Cuenta Gratis',
      subtitle: 'Únete a la comunidad de tenis amateur',
      namePlaceholder: 'Tu nombre completo',
      emailPlaceholder: 'tu@email.com',
      whatsappPlaceholder: 'WhatsApp (opcional)',
      passwordPlaceholder: 'Contraseña (mín. 6 caracteres)',
      submitButton: 'Crear Cuenta',
      submitting: 'Creando cuenta...',
      alreadyHaveAccount: '¿Ya tienes cuenta?',
      loginLink: 'Inicia sesión',
      benefits: [
        'Accede a ligas en tu ciudad',
        'Sistema de ranking ELO',
        'Encuentra rivales de tu nivel'
      ],
      termsLabel: 'Acepto los',
      termsLink: 'Términos y Condiciones',
      andText: 'y la',
      privacyLink: 'Política de Privacidad',
      minorsNote: 'Si eres menor de 14 años, el registro debe realizarlo un padre o tutor legal.',
      errors: {
        name: 'El nombre es obligatorio',
        email: 'Email inválido',
        password: 'La contraseña debe tener al menos 6 caracteres',
        terms: 'Debes aceptar los términos y la política de privacidad',
        submit: 'Error al crear cuenta. Inténtalo de nuevo.'
      }
    },
    en: {
      title: 'Create Free Account',
      subtitle: 'Join the amateur tennis community',
      namePlaceholder: 'Your full name',
      emailPlaceholder: 'your@email.com',
      whatsappPlaceholder: 'WhatsApp (optional)',
      passwordPlaceholder: 'Password (min. 6 characters)',
      submitButton: 'Create Account',
      submitting: 'Creating account...',
      alreadyHaveAccount: 'Already have an account?',
      loginLink: 'Login',
      benefits: [
        'Access leagues in your city',
        'ELO ranking system',
        'Find opponents at your level'
      ],
      termsLabel: 'I accept the',
      termsLink: 'Terms and Conditions',
      andText: 'and the',
      privacyLink: 'Privacy Policy',
      minorsNote: 'If you are under 14, registration must be completed by a parent or legal guardian.',
      errors: {
        name: 'Name is required',
        email: 'Invalid email',
        password: 'Password must be at least 6 characters',
        terms: 'You must accept the terms and privacy policy',
        submit: 'Error creating account. Please try again.'
      }
    }
  }

  const c = content[validLocale] || content.es

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = c.errors.name
    }
    
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = c.errors.email
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = c.errors.password
    }

    if (!acceptedTerms) {
      newErrors.terms = c.errors.terms
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          password: formData.password,
          language: validLocale,
          source: 'web_signup'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'EMAIL_EXISTS') {
          setErrors({ email: data.error })
        } else {
          setErrors({ submit: data.error || c.errors.submit })
        }
        return
      }

      // Auto-login after successful registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      })

      if (signInResult?.ok) {
        // Redirect to player dashboard
        router.push(`/${validLocale}/player/dashboard`)
      } else {
        // If auto-login fails, redirect to login page
        router.push(`/${validLocale}/login?registered=true`)
      }

    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ submit: c.errors.submit })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Decorative background */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-300/15 rounded-full blur-3xl"></div>
      </div>
      
      <Navigation locale={validLocale} showBackButton={true} />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8 pt-24">
        <div className="w-full max-w-md">
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                <span className="text-3xl">🎾</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {c.title}
              </h1>
              <p className="text-gray-600">
                {c.subtitle}
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <ul className="space-y-2">
                {c.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-purple-900">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={c.namePlaceholder}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:ring-0 ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={c.emailPlaceholder}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:ring-0 ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* WhatsApp (optional) */}
              <div>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder={c.whatsappPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 transition-colors focus:outline-none focus:ring-0"
                  disabled={isSubmitting}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={c.passwordPlaceholder}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-colors focus:outline-none focus:ring-0 ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-purple-500'
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Terms & Privacy Checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked)
                      if (errors.terms) setErrors(prev => ({ ...prev, terms: null }))
                    }}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-600 leading-snug">
                    {c.termsLabel}{' '}
                    <Link
                      href={`/${validLocale}/${validLocale === 'es' ? 'terminos-condiciones' : 'terms-conditions'}`}
                      className="text-purple-600 hover:text-purple-700 underline underline-offset-2"
                      target="_blank"
                    >
                      {c.termsLink}
                    </Link>
                    {' '}{c.andText}{' '}
                    <Link
                      href={`/${validLocale}/${validLocale === 'es' ? 'politica-privacidad' : 'privacy-policy'}`}
                      className="text-purple-600 hover:text-purple-700 underline underline-offset-2"
                      target="_blank"
                    >
                      {c.privacyLink}
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-500 text-sm mt-1 ml-7">{errors.terms}</p>
                )}
                <p className="text-xs text-gray-400 mt-2 ml-7">
                  {c.minorsNote}
                </p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {c.submitting}
                  </>
                ) : (
                  <>
                    {c.submitButton}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-gray-600 mt-6">
              {c.alreadyHaveAccount}{' '}
              <Link 
                href={`/${validLocale}/login`}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                {c.loginLink}
              </Link>
            </p>
          </div>

        </div>
      </div>
      
      <Footer content={t.footer} />
    </div>
  )
}
