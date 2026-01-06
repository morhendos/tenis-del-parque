'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, Tag, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { getDiscountCode, storeDiscountCode } from '@/lib/utils/discountCode'

const skillLevelNames = {
  es: {
    advanced: 'Avanzado',
    intermediate: 'Intermedio',
    beginner: 'Principiantes',
    all: 'Todos los niveles'
  },
  en: {
    advanced: 'Advanced',
    intermediate: 'Intermediate',
    beginner: 'Beginners',
    all: 'All Levels'
  }
}

const skillLevelColors = {
  advanced: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  intermediate: 'bg-gray-100 text-gray-700 border-gray-200',
  beginner: 'bg-amber-100 text-amber-800 border-amber-200',
  all: 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

export default function ModernRegistrationForm({ 
  league, 
  locale, 
  onSubmit, 
  isSubmitting,
  errors = {} 
}) {
  const [hasAccount, setHasAccount] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    level: league.skillLevel !== 'all' ? league.skillLevel : '',
    password: ''
  })
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
  const [discountValidation, setDiscountValidation] = useState(null)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)
  const [showDiscountInput, setShowDiscountInput] = useState(false)

  // Check URL parameters and sessionStorage for discount code on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      // getDiscountCode checks URL first, then sessionStorage
      const discount = getDiscountCode(urlParams, league.slug)
      if (discount) {
        setDiscountCode(discount)
        setShowDiscountInput(true)
        validateDiscount(discount)
      }
    }
  }, [])

  // Validate discount code
  const validateDiscount = async (code) => {
    if (!code || code.trim() === '') {
      setDiscountValidation(null)
      return
    }
    
    setIsValidatingDiscount(true)
    try {
      const res = await fetch(`/api/leagues/${league.slug}/discount/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() })
      })
      const data = await res.json()
      setDiscountValidation(data)
    } catch (error) {
      console.error('Error validating discount:', error)
      setDiscountValidation({ 
        valid: false, 
        error: locale === 'es' ? 'Error al validar el código' : 'Failed to validate code' 
      })
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  const handleDiscountCodeChange = (e) => {
    const code = e.target.value.toUpperCase()
    setDiscountCode(code)
    if (discountValidation) {
      setDiscountValidation(null)
    }
  }

  const handleApplyDiscount = () => {
    validateDiscount(discountCode)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submissionData = {
      ...formData,
      discountCode: discountValidation?.valid ? discountCode : null
    }
    onSubmit(submissionData, hasAccount)
  }

  // Determine if we need to ask for level
  const needsLevelSelection = league.skillLevel === 'all'
  const leagueSkillName = skillLevelNames[locale][league.skillLevel] || league.skillLevel
  const skillLevelColor = skillLevelColors[league.skillLevel] || skillLevelColors.all

  // Format season nicely
  const formatSeason = () => {
    const type = league.season?.type
    const year = league.season?.year
    if (!type || !year) return null
    
    const seasonNames = {
      es: { winter: 'Invierno', summer: 'Verano', spring: 'Primavera', autumn: 'Otoño' },
      en: { winter: 'Winter', summer: 'Summer', spring: 'Spring', autumn: 'Autumn' }
    }
    return `${seasonNames[locale]?.[type] || type} ${year}`
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* League Info Card - Compact and Clean */}
      <div className="bg-white rounded-none sm:rounded-2xl shadow-sm sm:shadow-lg mx-0 sm:mx-0 mb-3 sm:mb-6 overflow-hidden">
        {/* Header with league name and badge */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {league.name}
            </h2>
            {!needsLevelSelection && (
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${skillLevelColor}`}>
                {leagueSkillName}
              </span>
            )}
          </div>
          
          {/* Location and Season - Single line, clean */}
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            {league.cityData?.name && (
              <span className="inline-flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                {league.cityData.name[locale] || league.cityData.name.es}
              </span>
            )}
            {formatSeason() && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="inline-flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  {formatSeason()}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-2 border-t border-gray-100">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <p className="text-xs text-gray-500 mb-0.5">{locale === 'es' ? 'Inicio' : 'Start'}</p>
            <p className="font-semibold text-gray-900 text-sm sm:text-base">
              {new Date(league.seasonConfig?.startDate).toLocaleDateString(locale, {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-l border-gray-100">
            <p className="text-xs text-gray-500 mb-0.5">{locale === 'es' ? 'Precio' : 'Price'}</p>
            {discountValidation?.valid ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-gray-400 line-through text-xs sm:text-sm">
                  €{discountValidation.originalPrice}
                </span>
                <span className="font-bold text-emerald-600 text-base sm:text-lg">
                  €{discountValidation.finalPrice}
                </span>
              </div>
            ) : (
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {league.seasonConfig?.price?.isFree 
                  ? (locale === 'es' ? 'Gratis' : 'Free')
                  : `€${league.seasonConfig?.price?.amount}`}
              </p>
            )}
          </div>
        </div>
        
        {/* Discount Code Section - Right below price */}
        {!league.seasonConfig?.price?.isFree && (
          <div className="px-4 sm:px-6 py-3 border-t border-gray-100">
            {discountValidation?.valid ? (
              // Success state
              <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-emerald-800 truncate">
                      {discountValidation.description || (locale === 'es' ? 'Descuento aplicado' : 'Discount applied')}
                    </p>
                    <p className="text-xs text-emerald-600">
                      -{discountValidation.discountPercentage}%
                    </p>
                  </div>
                </div>
              </div>
            ) : !showDiscountInput ? (
              // Toggle button
              <button
                type="button"
                onClick={() => setShowDiscountInput(true)}
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
              >
                <Tag className="w-3.5 h-3.5" />
                {locale === 'es' ? '¿Tienes un código de descuento?' : 'Have a discount code?'}
              </button>
            ) : (
              // Input field
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={handleDiscountCodeChange}
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase text-sm"
                    placeholder={locale === 'es' ? 'CÓDIGO' : 'CODE'}
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={!discountCode || isValidatingDiscount}
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isValidatingDiscount ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      locale === 'es' ? 'Aplicar' : 'Apply'
                    )}
                  </button>
                </div>
                {discountValidation && !discountValidation.valid && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {discountValidation.error || (locale === 'es' ? 'Código inválido' : 'Invalid code')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Type Tabs */}
      <div className="bg-white rounded-none sm:rounded-2xl shadow-sm sm:shadow-lg mx-0 sm:mx-0 mb-3 sm:mb-6 overflow-hidden">
        <div className="account-type-tabs p-1.5 sm:p-2 bg-gray-100">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setHasAccount(false)}
              className={`flex-1 py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                !hasAccount 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {locale === 'es' ? 'Crear Cuenta' : 'Create Account'}
            </button>
            <button
              type="button"
              onClick={() => setHasAccount(true)}
              className={`flex-1 py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                hasAccount 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {locale === 'es' ? 'Ya tengo cuenta' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-lg"
        autoComplete="on"
        name={hasAccount ? 'login' : 'signup'}
      >
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">
            {hasAccount 
              ? (locale === 'es' ? 'Iniciar Sesión' : 'Sign In')
              : (locale === 'es' ? 'Crear Cuenta' : 'Create Account')}
          </h3>

          {hasAccount ? (
            // Login Form
            <div className="space-y-4">
              {/* Hidden username field for password managers */}
              <input 
                type="hidden" 
                name="username" 
                value={formData.email}
                autoComplete="username"
              />
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="username email"
                  className={`w-full px-3.5 py-2.5 sm:py-3 border ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base`}
                  placeholder={locale === 'es' ? 'tu@email.com' : 'your@email.com'}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {locale === 'es' ? 'Contraseña' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className={`w-full px-3.5 py-2.5 sm:py-3 pr-10 border ${
                      errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <Link 
                href={`/${locale}/forgot-password`}
                className="inline-block text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                {locale === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot password?'}
              </Link>
            </div>
          ) : (
            // New User Form
            <div className="space-y-4">
              {/* Hidden username field for password managers */}
              <input 
                type="hidden" 
                name="username" 
                value={formData.email}
                autoComplete="username"
              />
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {locale === 'es' ? 'Nombre Completo' : 'Full Name'}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className={`w-full px-3.5 py-2.5 sm:py-3 border ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base`}
                  placeholder={locale === 'es' ? 'Juan García' : 'John Smith'}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="username email"
                  className={`w-full px-3.5 py-2.5 sm:py-3 border ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base`}
                  placeholder={locale === 'es' ? 'tu@email.com' : 'your@email.com'}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1.5">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                  className={`w-full px-3.5 py-2.5 sm:py-3 border ${
                    errors.whatsapp ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base`}
                  placeholder="+34 600 000 000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {locale === 'es' 
                    ? 'Para notificaciones de la liga'
                    : 'For league notifications'}
                </p>
                {errors.whatsapp && (
                  <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>
                )}
              </div>

              {/* Level Selection - Compact pills on mobile */}
              {needsLevelSelection && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'es' ? '¿Cuál es tu nivel?' : 'What&apos;s your level?'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <label
                        key={level}
                        className={`flex-1 min-w-[80px] text-center px-3 py-2.5 border-2 rounded-xl cursor-pointer transition-all text-sm font-medium ${
                          formData.level === level
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="level"
                          value={level}
                          checked={formData.level === level}
                          onChange={handleChange}
                          className="sr-only"
                          required
                        />
                        {skillLevelNames[locale][level]}
                      </label>
                    ))}
                  </div>
                  {errors.level && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.level}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {locale === 'es' ? 'Contraseña' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={`w-full px-3.5 py-2.5 sm:py-3 pr-10 border ${
                      errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-base`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {locale === 'es' ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
                </p>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>
            </div>
          )}

          {/* Error Messages */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
          
          {errors.info && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-blue-700 text-sm">{errors.info}</p>
                  <a 
                    href={`/${locale}/player/dashboard`}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mt-1"
                  >
                    {locale === 'es' ? 'Ir al panel' : 'Go to dashboard'}
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button - Fixed at bottom on mobile */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 sm:py-4 rounded-xl font-semibold text-base hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {locale === 'es' ? 'Procesando...' : 'Processing...'}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {hasAccount 
                  ? (locale === 'es' ? 'Entrar y Registrarme' : 'Sign In & Register')
                  : (locale === 'es' ? 'Crear Cuenta' : 'Create Account')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </span>
            )}
          </button>

          {/* Toggle hint */}
          <p className="mt-4 text-center text-sm text-gray-500">
            {hasAccount ? (
              <>
                {locale === 'es' ? '¿Sin cuenta?' : 'No account?'}{' '}
                <button
                  type="button"
                  onClick={() => setHasAccount(false)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {locale === 'es' ? 'Crear una' : 'Create one'}
                </button>
              </>
            ) : (
              <>
                {locale === 'es' ? '¿Ya tienes cuenta?' : 'Have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setHasAccount(true)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {locale === 'es' ? 'Entrar' : 'Sign in'}
                </button>
              </>
            )}
          </p>
        </div>
      </form>
    </div>
  )
}
