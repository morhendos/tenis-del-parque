'use client'

import { useState, useEffect, useMemo } from 'react'
import { tennisQuotes } from '@/lib/content/tennisQuotes'

/**
 * Unified Countdown Card Component
 * Used in both player dashboard and league page
 * 
 * @param {Object} props
 * @param {string} props.leagueName - Name of the league
 * @param {string} props.location - Location/city (optional)
 * @param {Date|string} props.startDate - League start date
 * @param {string} props.status - League status
 * @param {number} props.playerCount - Number of registered players (optional)
 * @param {string} props.language - 'en' or 'es'
 * @param {boolean} props.showQuote - Whether to show motivational quote (default: true)
 * @param {boolean} props.compact - Compact mode for smaller displays (default: false)
 */
export default function CountdownCard({ 
  leagueName,
  location,
  startDate: startDateProp,
  status,
  playerCount,
  language = 'en',
  showQuote = true,
  compact = false
}) {
  const [countdown, setCountdown] = useState(null)
  
  const startDate = useMemo(() => {
    if (!startDateProp) return null
    return startDateProp instanceof Date ? startDateProp : new Date(startDateProp)
  }, [startDateProp])
  
  // Get a stable random quote based on the day
  const quote = useMemo(() => {
    const today = new Date().toDateString()
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const index = seed % tennisQuotes.length
    const q = tennisQuotes[index]
    return {
      text: q.text[language] || q.text.en,
      author: q.author
    }
  }, [language])
  
  // Calculate countdown
  useEffect(() => {
    if (!startDate) return
    
    const updateCountdown = () => {
      const now = new Date()
      const diff = startDate - now
      
      if (diff <= 0) {
        setCountdown(null)
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setCountdown({ days, hours, minutes })
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    
    return () => clearInterval(interval)
  }, [startDate])
  
  const isUpcoming = status === 'registration_open' || status === 'coming_soon'
  
  // Don't show if league has started or no start date
  if (!isUpcoming || !startDate || startDate <= new Date()) {
    return null
  }
  
  const content = {
    es: {
      title: 'La liga comienza pronto',
      days: 'días',
      hours: 'horas',
      minutes: 'min',
      registeredPlayers: 'jugadores inscritos'
    },
    en: {
      title: 'League starts soon',
      days: 'days',
      hours: 'hours',
      minutes: 'min',
      registeredPlayers: 'registered players'
    }
  }
  
  const t = content[language] || content.es
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple/5 via-purple-50 to-indigo-50 rounded-2xl border border-parque-purple/20 p-5 shadow-sm h-full flex flex-col">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-parque-purple/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-parque-purple/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-900 font-semibold text-lg">{t.title}</h3>
          <p className="text-gray-500 text-sm">
            {leagueName}
            {location && ` · ${location}`}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-parque-purple/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      {/* Countdown */}
      {countdown && (
        <div className="relative z-10 flex justify-center gap-2 my-4">
          <div className="bg-white rounded-xl px-4 py-3 text-center min-w-[70px] border border-parque-purple/10 shadow-sm">
            <div className="text-3xl font-bold text-parque-purple">{countdown.days}</div>
            <div className="text-xs text-gray-500 font-medium">{t.days}</div>
          </div>
          <div className="flex items-center text-parque-purple/30 text-2xl font-light">:</div>
          <div className="bg-white rounded-xl px-4 py-3 text-center min-w-[70px] border border-parque-purple/10 shadow-sm">
            <div className="text-3xl font-bold text-parque-purple">{countdown.hours}</div>
            <div className="text-xs text-gray-500 font-medium">{t.hours}</div>
          </div>
          <div className="flex items-center text-parque-purple/30 text-2xl font-light">:</div>
          <div className="bg-white rounded-xl px-4 py-3 text-center min-w-[70px] border border-parque-purple/10 shadow-sm">
            <div className="text-3xl font-bold text-parque-purple">{countdown.minutes}</div>
            <div className="text-xs text-gray-500 font-medium">{t.minutes}</div>
          </div>
        </div>
      )}
      
      {/* Start date pill */}
      <div className="relative z-10 flex justify-center mb-4">
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-parque-purple/10 shadow-sm">
          <svg className="w-4 h-4 text-parque-purple/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-700 font-medium">
            {startDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
      
      {/* Player count if available */}
      {playerCount > 0 && (
        <div className="relative z-10 flex justify-center mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span><strong>{playerCount}</strong> {t.registeredPlayers}</span>
          </div>
        </div>
      )}
      
      {/* Motivational Quote */}
      {showQuote && (
        <div className="relative z-10 mt-auto pt-4 border-t border-parque-purple/10">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-parque-purple/30 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <div>
              <p className="text-gray-600 text-sm italic leading-relaxed">{quote.text}</p>
              <p className="text-gray-400 text-xs mt-1.5 font-medium">— {quote.author}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
