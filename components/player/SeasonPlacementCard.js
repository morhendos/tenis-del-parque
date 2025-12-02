'use client'

import { Award, Users } from 'lucide-react'
import { formatSeasonName, getPositionSuffix } from '@/lib/services/achievementsService'

/**
 * Get position-based styling
 */
function getPositionStyles(position) {
  if (position === 1) {
    return {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      border: 'border-amber-200',
      positionBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      textColor: 'text-amber-700'
    }
  }
  if (position === 2) {
    return {
      bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
      border: 'border-gray-300',
      positionBg: 'bg-gradient-to-br from-gray-300 to-gray-500',
      textColor: 'text-gray-600'
    }
  }
  if (position === 3) {
    return {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-amber-300',
      positionBg: 'bg-gradient-to-br from-amber-600 to-amber-800',
      textColor: 'text-amber-800'
    }
  }
  if (position <= 8) {
    return {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
      positionBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      textColor: 'text-emerald-700'
    }
  }
  return {
    bg: 'bg-gradient-to-br from-slate-50 to-gray-50',
    border: 'border-slate-200',
    positionBg: 'bg-gradient-to-br from-slate-400 to-slate-600',
    textColor: 'text-slate-600'
  }
}

/**
 * Season Placement Card Component
 * Displays a player's final position in a season
 */
export default function SeasonPlacementCard({ placement, language = 'es', compact = false }) {
  const styles = getPositionStyles(placement.position)
  const seasonName = formatSeasonName(placement.seasonYear, placement.seasonType, language)
  const positionText = getPositionSuffix(placement.position, language)
  
  const content = {
    es: {
      of: 'de',
      players: 'jugadores',
      regularSeason: 'Temporada Regular',
      seed: 'Cabeza de serie'
    },
    en: {
      of: 'of',
      players: 'players',
      regularSeason: 'Regular Season',
      seed: 'Seed'
    }
  }
  
  const t = content[language] || content.es

  if (compact) {
    return (
      <div className={`rounded-xl border ${styles.bg} ${styles.border} p-3 shadow-sm hover:shadow-md transition-all`}>
        <div className="flex items-center space-x-3">
          {/* Position Badge */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${styles.positionBg}`}>
            <span className="text-white font-bold text-sm">{positionText}</span>
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{seasonName}</p>
            <p className="text-xs text-gray-400">
              {t.of} {placement.totalPlayers} {t.players}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${styles.bg} ${styles.border} p-5 shadow-sm hover:shadow-lg transition-all duration-300`}>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px'
        }} />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className={`w-5 h-5 ${styles.textColor}`} />
            <span className="text-sm font-medium text-gray-500">{t.regularSeason}</span>
          </div>
          <span className="text-xs text-gray-400">{seasonName}</span>
        </div>
        
        {/* Position Display */}
        <div className="flex items-center space-x-4">
          {/* Large Position Number */}
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${styles.positionBg}`}>
            <span className="text-white font-bold text-2xl">{positionText}</span>
          </div>
          
          {/* Details */}
          <div>
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-1.5" />
              <span className="text-sm">
                {t.of} {placement.totalPlayers} {t.players}
              </span>
            </div>
            
            {placement.seed && (
              <p className="text-xs text-gray-400 mt-1">
                {t.seed} #{placement.seed}
              </p>
            )}
          </div>
        </div>
        
        {/* League Name */}
        {placement.leagueName && (
          <p className="mt-3 text-xs text-gray-400 border-t border-gray-200 pt-3">
            {placement.leagueName}
          </p>
        )}
      </div>
    </div>
  )
}
