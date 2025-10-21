'use client'

import { useState } from 'react'
import Link from 'next/link'

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

export default function ModernRegistrationForm({ 
  league, 
  locale, 
  onSubmit, 
  isSubmitting,
  errors = {} 
}) {
  const [hasAccount, setHasAccount] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    level: league.skillLevel !== 'all' ? league.skillLevel : '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData, hasAccount)
  }

  // Determine if we need to ask for level
  const needsLevelSelection = league.skillLevel === 'all'
  const leagueSkillName = skillLevelNames[locale][league.skillLevel] || league.skillLevel

  return (
    <div className="max-w-2xl mx-auto">
      {/* League Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{league.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {league.cityData?.name && (
                <>
                  <span className="inline-flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {league.cityData.name[locale] || league.cityData.name.es}
                  </span>
                  <span className="text-gray-300">•</span>
                </>
              )}
              <span className="text-sm text-gray-600">
                {league.season?.type} {league.season?.year}
              </span>
            </div>
          </div>
          {!needsLevelSelection && (
            <div className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
              {leagueSkillName}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-600">{locale === 'es' ? 'Inicio' : 'Start'}</p>
            <p className="font-semibold text-gray-900">
              {new Date(league.seasonConfig?.startDate).toLocaleDateString(locale)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{locale === 'es' ? 'Precio' : 'Price'}</p>
            <p className="font-semibold text-gray-900">
              {league.seasonConfig?.price?.isFree 
                ? (locale === 'es' ? 'Gratis' : 'Free')
                : `€${league.seasonConfig?.price?.amount}`}
            </p>
          </div>
        </div>
      </div>

      {/* Account Toggle */}
      <div className="bg-white/80 backdrop-blur-sm border-2 border-emerald-100 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              {locale === 'es' ? '¿Ya tienes una cuenta?' : 'Already have an account?'}
            </p>
            <p className="text-sm text-gray-600">
              {hasAccount 
                ? (locale === 'es' ? 'Inicia sesión para registrarte más rápido' : 'Sign in to register faster')
                : (locale === 'es' ? 'Crearemos una cuenta para ti' : 'We\'ll create an account for you')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHasAccount(!hasAccount)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              hasAccount ? 'bg-emerald-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                hasAccount ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {hasAccount 
            ? (locale === 'es' ? 'Iniciar Sesión' : 'Sign In')
            : (locale === 'es' ? 'Crear Cuenta' : 'Create Account')}
        </h3>

        {hasAccount ? (
          // Login Form - Just email and password
          <>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Email' : 'Email'}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border-2 ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all`}
                  placeholder={locale === 'es' ? 'tu@email.com' : 'your@email.com'}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Contraseña' : 'Password'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border-2 ${
                    errors.password ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link 
                  href={`/${locale}/forgot-password`}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {locale === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot password?'}
                </Link>
              </div>
            </div>
          </>
        ) : (
          // New User Form - Full registration
          <>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Nombre Completo' : 'Full Name'}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border-2 ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all`}
                  placeholder={locale === 'es' ? 'Juan García' : 'John Smith'}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border-2 ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all`}
                  placeholder={locale === 'es' ? 'tu@email.com' : 'your@email.com'}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border-2 ${
                    errors.whatsapp ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all`}
                  placeholder="+34 600 000 000"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {locale === 'es' 
                    ? 'Te enviaremos notificaciones importantes de la liga'
                    : 'We\'ll send you important league notifications'}
                </p>
                {errors.whatsapp && (
                  <p className="mt-2 text-sm text-red-600">{errors.whatsapp}</p>
                )}
              </div>

              {/* Only show level selection if league is "all" */}
              {needsLevelSelection && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {locale === 'es' ? '¿Cuál es tu nivel?' : 'What\'s your level?'}
                  </label>
                  <div className="space-y-3">
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <label
                        key={level}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-emerald-50 ${
                          formData.level === level
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="level"
                          value={level}
                          checked={formData.level === level}
                          onChange={handleChange}
                          className="w-5 h-5 text-emerald-600"
                          required
                        />
                        <span className="ml-3 text-base font-medium text-gray-900">
                          {skillLevelNames[locale][level]}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.level && (
                    <p className="mt-2 text-sm text-red-600">{errors.level}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'es' ? 'Contraseña' : 'Password'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className={`w-full px-4 py-3 border-2 ${
                    errors.password ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all`}
                  placeholder="••••••••"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {locale === 'es' ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
                </p>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}
        
        {/* Info Message (for already registered, etc.) */}
        {errors.info && (
          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-blue-700 text-sm mb-2">{errors.info}</p>
                <a 
                  href={`/${locale}/player/dashboard`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {locale === 'es' ? 'Ir al panel de jugador' : 'Go to player dashboard'}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {locale === 'es' ? 'Procesando...' : 'Processing...'}
            </span>
          ) : (
            <span className="flex items-center justify-center">
              {hasAccount 
                ? (locale === 'es' ? 'Iniciar Sesión y Registrarme' : 'Sign In & Register')
                : (locale === 'es' ? 'Crear Cuenta y Registrarme' : 'Create Account & Register')}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          )}
        </button>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {hasAccount ? (
            <>
              {locale === 'es' ? '¿No tienes cuenta?' : 'Don\'t have an account?'}{' '}
              <button
                type="button"
                onClick={() => setHasAccount(false)}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {locale === 'es' ? 'Créala aquí' : 'Create one'}
              </button>
            </>
          ) : (
            <>
              {locale === 'es' ? '¿Ya tienes cuenta?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setHasAccount(true)}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {locale === 'es' ? 'Inicia sesión' : 'Sign in'}
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
