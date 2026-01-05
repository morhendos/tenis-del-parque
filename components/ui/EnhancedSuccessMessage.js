import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRandomQuote } from '../../lib/content/tennisQuotes'

export default function EnhancedSuccessMessage({ 
  playerName,
  leagueName,
  cityName,
  leagueStatus,
  expectedStartDate,
  whatsappGroupLink,
  shareUrl,
  language = 'es'
}) {
  
  const messages = {
    es: {
      confirmed: 'Registro Confirmado',
      waitingList: 'En Lista de Espera',
      registeredFor: 'Te has registrado exitosamente para',
      emailSent: 'Confirmación enviada a tu email',
      leagueStarts: 'La liga comienza',
      shareWithFriends: 'Invitar Amigos',
      helpComplete: 'Ayúdanos a hacer esta liga increíble',
      helpDescription: 'Invita a más jugadores para formar grupos competitivos equilibrados.',
      backHome: '← Volver al inicio',
      shareText: '¿Te animas a jugar conmigo en {league}?',
      welcome: '¡Bienvenido',
      goToDashboard: 'Ir a Mi Panel de Jugador',
      dashboardHint: 'Accede a tu perfil, estadísticas y partidos',
      excitementTaglines: [
        '¡A jugar! Nos vemos en la pista',
        '¡Que comiencen los juegos!',
        'Cada partido cuenta. Tu camino en el ranking empieza ahora.',
        'La pista te llama. Es hora de responder.'
      ]
    },
    en: {
      confirmed: 'Registration Confirmed',
      waitingList: 'On Waiting List',
      registeredFor: 'You have successfully registered for',
      emailSent: 'Confirmation sent to your email',
      leagueStarts: 'League starts',
      shareWithFriends: 'Invite Friends',
      helpComplete: 'Help us make this league amazing',
      helpDescription: 'Invite more players to create balanced competitive groups.',
      backHome: '← Back to home',
      shareText: 'Want to play with me at {league}?',
      welcome: 'Welcome',
      goToDashboard: 'Go to My Player Dashboard',
      dashboardHint: 'Access your profile, stats and matches',
      excitementTaglines: [
        'Game on - see you on the court!',
        'Let the games begin!',
        'Every match counts. Your ranking journey starts now.',
        'The court is calling. Time to answer.'
      ]
    }
  }

  const t = messages[language]
  const isWaitingList = leagueStatus === 'coming_soon'

  // Random excitement tagline and quote - only set on client to avoid hydration mismatch
  const [excitementTagline, setExcitementTagline] = useState('')
  const [quote, setQuote] = useState(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const taglines = messages[language].excitementTaglines
    const randomIndex = Math.floor(Math.random() * taglines.length)
    setExcitementTagline(taglines[randomIndex])
    
    // Get a random motivational quote in the right language
    setQuote(getRandomQuote(language))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleShare = () => {
    const shareText = t.shareText.replace('{league}', leagueName)
    const fullText = `${shareText}\n\n${shareUrl}`
    
    // Open WhatsApp directly - works on both mobile and desktop
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 sm:p-8 text-white">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
              isWaitingList 
                ? 'bg-orange-500/20 text-orange-100 border border-orange-300/30' 
                : 'bg-white/20 text-white border border-white/30'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isWaitingList ? 'bg-orange-300' : 'bg-white'
              }`}></div>
              {isWaitingList ? t.waitingList : t.confirmed}
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-center">
            {t.welcome} {playerName}!
          </h1>
          <p className="text-emerald-200 text-sm sm:text-base text-center">
            {t.registeredFor}
          </p>
          <p className="text-white font-bold text-xl sm:text-2xl md:text-3xl mt-1 text-center">
            {leagueName}
          </p>
          {cityName && (
            <div className="flex items-center justify-center mt-2 sm:mt-3 text-white text-base sm:text-lg font-medium">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {cityName}
            </div>
          )}
          
          {/* Excitement tagline */}
          {mounted && excitementTagline && (
            <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-white/20">
              <p className="text-sm sm:text-base italic text-emerald-100 text-center">
                {excitementTagline}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8">
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Email confirmation */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Email</p>
                <p className="text-gray-900 font-medium text-xs sm:text-base leading-tight">{t.emailSent}</p>
              </div>
            </div>

            {/* Start date */}
            {expectedStartDate && (
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">{t.leagueStarts}</p>
                  <p className="text-gray-900 font-medium text-xs sm:text-base leading-tight">{formatDate(expectedStartDate)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Dashboard CTA - Primary action */}
          <Link
            href={`/${language}/player/dashboard`}
            className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-200 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {t.goToDashboard}
          </Link>
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 mb-6 sm:mb-8">
            {t.dashboardHint}
          </p>

          {/* Encouragement Card */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 mb-3 sm:mb-4">
            <p className="text-emerald-900 font-medium text-sm sm:text-base mb-0.5 sm:mb-1">
              {t.helpComplete}
            </p>
            <p className="text-xs sm:text-sm text-emerald-700">
              {t.helpDescription}
            </p>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            {t.shareWithFriends}
          </button>

          {/* Inspirational Quote */}
          {mounted && quote && (
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-600 italic text-sm sm:text-base">
                "{quote.text}"
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1.5 sm:mt-2">
                — {quote.author}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 sm:px-8 py-3 sm:py-4 border-t border-gray-100">
          <Link 
            href="/"
            className="text-gray-600 hover:text-emerald-600 transition-colors text-xs sm:text-sm font-medium inline-flex items-center"
          >
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
