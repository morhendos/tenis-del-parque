'use client'

import { useState, useEffect, useMemo } from 'react'
import { WhatsAppUtils } from '@/lib/utils/whatsappUtils'
import { getMaskedName, isDemoModeActive } from '@/lib/utils/demoMode'
import { tennisQuotes } from '@/lib/content/tennisQuotes'

export default function NextMatchCard({ match, language, leagueInfo }) {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [countdown, setCountdown] = useState(null)
  
  // Get a stable random quote based on the day (changes daily, not on every render)
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
  
  useEffect(() => {
    setIsDemoMode(isDemoModeActive())
  }, [])

  // Calculate countdown to league start
  useEffect(() => {
    if (!leagueInfo?.startDate) return
    
    const startDate = new Date(leagueInfo.startDate)
    
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
  }, [leagueInfo?.startDate])

  const content = {
    es: {
      title: 'Próximo Partido',
      noMatches: 'No tienes partidos programados',
      round: 'Ronda',
      leagueStarts: 'La liga comienza pronto',
      days: 'días',
      hours: 'horas',
      minutes: 'min'
    },
    en: {
      title: 'Next Match',
      noMatches: 'No matches scheduled',
      round: 'Round',
      leagueStarts: 'League starts soon',
      days: 'days',
      hours: 'hours',
      minutes: 'min'
    }
  }

  const t = content[language] || content.es

  // No match but we have league info - show "League Starting Soon"
  if (!match && leagueInfo) {
    const startDate = leagueInfo.startDate ? new Date(leagueInfo.startDate) : null
    const isNotStarted = leagueInfo.status === 'registration_open' || leagueInfo.status === 'coming_soon' || (startDate && startDate > new Date())
    
    if (isNotStarted && startDate) {
      return (
        <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-700 rounded-2xl p-5 shadow-lg h-full flex flex-col">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg">{t.leagueStarts}</h3>
              <p className="text-white/70 text-sm">
                {leagueInfo.name}
                {leagueInfo.location && ` · ${leagueInfo.location}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          {/* Countdown */}
          {countdown && (
            <div className="relative z-10 flex justify-center gap-3 my-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[70px] border border-white/20">
                <div className="text-3xl font-bold text-white">{countdown.days}</div>
                <div className="text-xs text-white/70 font-medium">{t.days}</div>
              </div>
              <div className="flex items-center text-white/50 text-2xl font-light">:</div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[70px] border border-white/20">
                <div className="text-3xl font-bold text-white">{countdown.hours}</div>
                <div className="text-xs text-white/70 font-medium">{t.hours}</div>
              </div>
              <div className="flex items-center text-white/50 text-2xl font-light">:</div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[70px] border border-white/20">
                <div className="text-3xl font-bold text-white">{countdown.minutes}</div>
                <div className="text-xs text-white/70 font-medium">{t.minutes}</div>
              </div>
            </div>
          )}
          
          {/* Start date pill */}
          <div className="relative z-10 flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-white font-medium">
                {startDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          {/* Motivational Quote */}
          <div className="relative z-10 mt-auto pt-4 border-t border-white/10">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <div>
                <p className="text-white/90 text-sm italic leading-relaxed">{quote.text}</p>
                <p className="text-white/50 text-xs mt-1.5 font-medium">— {quote.author}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  if (!match) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-400">{t.title}</span>
        </div>
        <p className="text-gray-400 text-sm">{t.noMatches}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">{t.title}</span>
        </div>
        <span className="text-sm text-gray-400">{t.round} {match.round}</span>
      </div>

      {/* Match Card */}
      <div className="bg-gray-50 rounded-xl p-2.5">
        <div className="flex items-center gap-2">
          {/* Position Circle - show opponent's league position */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-parque-purple to-purple-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20">
            <span className="text-white text-xs font-semibold">
              {match.opponentPosition ? `#${match.opponentPosition}` : '—'}
            </span>
          </div>
          
          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {isDemoMode ? getMaskedName(match.opponent) : match.opponent}
            </p>
          </div>
          
          {/* WhatsApp Button */}
          {match.opponentWhatsapp && (
            <div
              onClick={() => window.open(WhatsAppUtils.createMessageUrl(match.opponentWhatsapp, ''), '_blank')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
