'use client'

import { useState } from 'react'

export default function LeagueWaitlistForm({ citySlug, cityName, locale, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skillLevel: 'any',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [cityCount, setCityCount] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/league-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          city: citySlug,
          cityDisplayName: cityName,
          source: 'registration_page'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'already_registered') {
          setError(locale === 'es' 
            ? 'Ya estás en la lista de espera para esta ciudad.' 
            : 'You are already on the waiting list for this city.')
        } else {
          setError(data.message || (locale === 'es' ? 'Error al registrarse' : 'Registration failed'))
        }
        return
      }

      setSuccess(true)
      setCityCount(data.cityCount)
      if (onSuccess) onSuccess(data)

    } catch (err) {
      console.error('Waitlist error:', err)
      setError(locale === 'es' 
        ? 'Error de conexión. Inténtalo de nuevo.' 
        : 'Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {locale === 'es' ? '¡Te has unido a la lista!' : 'You&apos;ve joined the list!'}
        </h3>
        <p className="text-gray-600 mb-4">
          {locale === 'es' 
            ? `Te avisaremos cuando lancemos la liga en ${cityName}.`
            : `We&apos;ll notify you when we launch the league in ${cityName}.`}
        </p>
        {cityCount && cityCount > 1 && (
          <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-700">
            <span className="font-semibold">{cityCount}</span> {locale === 'es' ? 'personas interesadas' : 'people interested'}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {locale === 'es' ? '¡Queremos venir a tu ciudad!' : 'We want to come to your city!'}
        </h3>
        <p className="text-gray-600 text-sm">
          {locale === 'es' 
            ? `Todavía no tenemos liga en ${cityName}, pero si hay suficiente interés, ¡la lanzaremos!`
            : `We don&apos;t have a league in ${cityName} yet, but if there&apos;s enough interest, we&apos;ll launch one!`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === 'es' ? 'Nombre' : 'Name'} *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder={locale === 'es' ? 'Tu nombre' : 'Your name'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder={locale === 'es' ? 'tu@email.com' : 'your@email.com'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === 'es' ? 'Teléfono (opcional)' : 'Phone (optional)'}
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="+34 600 000 000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {locale === 'es' ? 'Tu nivel de tenis' : 'Your tennis level'}
          </label>
          <select
            name="skillLevel"
            value={formData.skillLevel}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
          >
            <option value="any">{locale === 'es' ? 'Cualquiera / No estoy seguro' : 'Any / Not sure'}</option>
            <option value="beginner">{locale === 'es' ? 'Principiante' : 'Beginner'}</option>
            <option value="intermediate">{locale === 'es' ? 'Intermedio' : 'Intermediate'}</option>
            <option value="advanced">{locale === 'es' ? 'Avanzado' : 'Advanced'}</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isSubmitting 
            ? (locale === 'es' ? 'Enviando...' : 'Sending...') 
            : (locale === 'es' ? '¡Avísame cuando haya liga!' : 'Notify me when there&apos;s a league!')}
        </button>

        <p className="text-xs text-gray-500 text-center">
          {locale === 'es' 
            ? 'Te contactaremos solo cuando lancemos la liga en tu zona.'
            : 'We&apos;ll only contact you when we launch a league in your area.'}
        </p>
      </form>
    </div>
  )
}
