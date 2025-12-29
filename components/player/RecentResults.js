'use client'

import { useState, useEffect } from 'react'
import { getMaskedName, isDemoModeActive } from '@/lib/utils/demoMode'

export default function RecentResults({ matches, language, maxResults = 3 }) {
  const [isDemoMode, setIsDemoMode] = useState(false)
  
  useEffect(() => {
    setIsDemoMode(isDemoModeActive())
  }, [])

  const content = {
    es: {
      title: 'Actividad Reciente',
      noMatches: 'Sin partidos completados',
      round: 'R',
      win: 'V',
      loss: 'D',
      viewAll: 'Ver todos'
    },
    en: {
      title: 'Recent Activity',
      noMatches: 'No completed matches',
      round: 'R',
      win: 'W',
      loss: 'L',
      viewAll: 'View all'
    }
  }

  const t = content[language] || content.es

  // Format score for display
  const formatScore = (score) => {
    if (!score) return ''
    if (score.walkover) return 'W/O'
    if (!score.sets || score.sets.length === 0) return ''
    
    return score.sets.map(set => `${set.player1}-${set.player2}`).join(' ')
  }

  // Get display matches (limited to maxResults)
  const displayMatches = (matches || []).slice(0, maxResults)

  if (!displayMatches || displayMatches.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-gray-400">{t.title}</span>
        </div>
        <p className="text-gray-400 text-xs">{t.noMatches}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-semibold text-gray-700">{t.title}</span>
      </div>

      {/* Match List - Compact */}
      <div className="space-y-2">
        {displayMatches.map((match, index) => {
          const isWin = match.result === 'won'
          const scoreStr = formatScore(match.score)
          const eloChange = match.eloChange || 0
          const position = match.opponentPosition
          
          return (
            <div 
              key={match._id || index}
              className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
            >
              {/* Win/Loss indicator */}
              <div className={`w-1 h-8 rounded-full flex-shrink-0 ${
                isWin ? 'bg-green-500' : 'bg-red-400'
              }`} />
              
              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {isDemoMode ? getMaskedName(match.opponent) : match.opponent}
                  </p>
                  {position && (
                    <span className="text-xs text-gray-400">#{position}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{t.round}{match.round}</span>
                  {scoreStr && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="font-mono">{scoreStr}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* ELO Change */}
              <div className={`text-sm font-medium ${
                eloChange >= 0 ? 'text-green-600' : 'text-red-500'
              }`}>
                {eloChange >= 0 ? '+' : ''}{eloChange}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
