'use client'

import { useState, useEffect, useMemo } from 'react'

export default function LeagueCountdownCard({ league, language }) {
  const [countdown, setCountdown] = useState(null)
  
  const startDateStr = league?.seasonConfig?.startDate
  const startDate = useMemo(() => startDateStr ? new Date(startDateStr) : null, [startDateStr])
  const isUpcoming = league?.status === 'registration_open' || league?.status === 'coming_soon'
  
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
  
  // Don't show if league has started or no start date
  if (!isUpcoming || !startDate || startDate <= new Date()) {
    return null
  }
  
  const content = {
    es: {
      title: 'La liga comienza pronto',
      startsOn: 'Fecha de inicio',
      days: 'días',
      hours: 'horas',
      minutes: 'min',
      getReady: 'Prepárate para competir. Pronto recibirás tu primer emparejamiento.',
      registeredPlayers: 'jugadores inscritos'
    },
    en: {
      title: 'League starts soon',
      startsOn: 'Start date',
      days: 'days',
      hours: 'hours',
      minutes: 'min',
      getReady: 'Get ready to compete. You\'ll receive your first match pairing soon.',
      registeredPlayers: 'registered players'
    }
  }
  
  const t = content[language] || content.es
  
  return (
    <div className="bg-gradient-to-br from-parque-purple/5 via-purple-50 to-indigo-50 rounded-xl border border-parque-purple/20 p-5 shadow-sm max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-parque-purple/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-lg font-semibold text-gray-900">{t.title}</span>
      </div>
      
      {/* Countdown boxes */}
      {countdown && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 text-center border border-parque-purple/10 shadow-sm">
            <div className="text-3xl font-bold text-parque-purple">{countdown.days}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t.days}</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-parque-purple/10 shadow-sm">
            <div className="text-3xl font-bold text-parque-purple">{countdown.hours}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t.hours}</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-parque-purple/10 shadow-sm">
            <div className="text-3xl font-bold text-parque-purple">{countdown.minutes}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{t.minutes}</div>
          </div>
        </div>
      )}
      
      {/* Start date */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-parque-purple/10 mb-3">
        <span className="text-sm text-gray-600">{t.startsOn}</span>
        <span className="text-sm font-semibold text-parque-purple">
          {startDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>
      
      {/* Player count if available */}
      {league?.playerCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span><strong>{league.playerCount}</strong> {t.registeredPlayers}</span>
        </div>
      )}
      
      <p className="text-sm text-gray-600">{t.getReady}</p>
    </div>
  )
}
