'use client'

import { Trophy, Medal, Star } from 'lucide-react'
import { formatSeasonName } from '@/lib/services/achievementsService'

/**
 * Get tier-specific styles
 */
function getTierStyles(tier) {
  switch (tier) {
    case 'gold':
      return {
        bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
        border: 'border-amber-200',
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
        iconShadow: 'shadow-amber-500/30',
        textColor: 'text-amber-700',
        badgeBg: 'bg-amber-100',
        badgeBorder: 'border-amber-200'
      }
    case 'silver':
      return {
        bg: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100',
        border: 'border-gray-300',
        iconBg: 'bg-gradient-to-br from-gray-300 to-gray-500',
        iconShadow: 'shadow-gray-500/20',
        textColor: 'text-gray-600',
        badgeBg: 'bg-gray-100',
        badgeBorder: 'border-gray-300'
      }
    case 'bronze':
      return {
        bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100',
        border: 'border-amber-300',
        iconBg: 'bg-gradient-to-br from-amber-600 to-amber-800',
        iconShadow: 'shadow-amber-700/30',
        textColor: 'text-amber-800',
        badgeBg: 'bg-amber-100',
        badgeBorder: 'border-amber-300'
      }
    case 'standard':
    default:
      return {
        bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
        border: 'border-emerald-200',
        iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
        iconShadow: 'shadow-emerald-500/30',
        textColor: 'text-emerald-700',
        badgeBg: 'bg-emerald-100',
        badgeBorder: 'border-emerald-200'
      }
  }
}

/**
 * Get the appropriate icon component
 */
function TrophyIcon({ iconType, className }) {
  switch (iconType) {
    case 'trophy':
      return <Trophy className={className} />
    case 'medal':
      return <Medal className={className} />
    case 'star':
      return <Star className={className} />
    default:
      return <Trophy className={className} />
  }
}

/**
 * Trophy Card Component
 * Displays a single trophy/medal achievement
 */
export default function TrophyCard({ trophy, language = 'es', compact = false }) {
  const styles = getTierStyles(trophy.tier)
  const name = trophy.names?.[language] || trophy.names?.es || 'Trophy'
  const description = trophy.descriptions?.[language] || trophy.descriptions?.es || ''
  const seasonName = formatSeasonName(trophy.seasonYear, trophy.seasonType, language)
  
  if (compact) {
    return (
      <div className={`relative overflow-hidden rounded-xl border ${styles.bg} ${styles.border} p-3 shadow-sm hover:shadow-md transition-all duration-200`}>
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${styles.iconBg} ${styles.iconShadow}`}>
            <TrophyIcon iconType={trophy.icon} className="w-5 h-5 text-white" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-sm truncate">{name}</h4>
            <p className="text-xs text-gray-500 truncate">{seasonName}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${styles.bg} ${styles.border} p-5 shadow-sm hover:shadow-lg transition-all duration-300 group`}>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 transform translate-x-4 -translate-y-4">
        <TrophyIcon iconType={trophy.icon} className={`w-full h-full ${styles.textColor}`} />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Trophy Icon */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${styles.iconBg} ${styles.iconShadow} group-hover:scale-105 transition-transform duration-200`}>
              <TrophyIcon iconType={trophy.icon} className="w-7 h-7 text-white" />
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
        </div>
        
        {/* Season Info */}
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${styles.badgeBg} ${styles.textColor} border ${styles.badgeBorder}`}>
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {seasonName}
        </div>
        
        {/* League Name */}
        {trophy.leagueName && (
          <p className="mt-2 text-xs text-gray-400">
            {trophy.leagueName}
          </p>
        )}
      </div>
    </div>
  )
}
