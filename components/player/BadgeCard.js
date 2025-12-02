'use client'

import { Award, Shield, Zap, TrendingUp, Star, BadgeCheck } from 'lucide-react'
import { formatSeasonName } from '@/lib/services/achievementsService'

/**
 * Get icon component by name
 */
function BadgeIcon({ iconType, className }) {
  switch (iconType) {
    case 'badge':
      return <BadgeCheck className={className} />
    case 'shield':
      return <Shield className={className} />
    case 'zap':
      return <Zap className={className} />
    case 'trending-up':
      return <TrendingUp className={className} />
    case 'star':
      return <Star className={className} />
    case 'award':
      return <Award className={className} />
    default:
      return <Award className={className} />
  }
}

/**
 * Get tier-specific styles for badges
 */
function getBadgeStyles(tier) {
  switch (tier) {
    case 'special':
      return {
        bg: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50',
        border: 'border-purple-200',
        iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
        iconShadow: 'shadow-purple-500/30',
        textColor: 'text-purple-700',
        badgeBg: 'bg-purple-100',
        badgeBorder: 'border-purple-200'
      }
    case 'standard':
    default:
      return {
        bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
        border: 'border-emerald-200',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
        iconShadow: 'shadow-emerald-500/30',
        textColor: 'text-emerald-700',
        badgeBg: 'bg-emerald-100',
        badgeBorder: 'border-emerald-200'
      }
  }
}

/**
 * Badge Card Component
 * Displays a special achievement badge
 */
export default function BadgeCard({ badge, language = 'es', compact = false }) {
  const styles = getBadgeStyles(badge.tier)
  const name = badge.names?.[language] || badge.names?.es || 'Badge'
  const description = badge.descriptions?.[language] || badge.descriptions?.es || ''
  const seasonName = badge.seasonYear ? formatSeasonName(badge.seasonYear, badge.seasonType, language) : null

  // Extra details based on badge type
  const getExtraInfo = () => {
    if (badge.id === 'iron_will' && badge.matchesPlayed) {
      return language === 'es' 
        ? `${badge.matchesPlayed} partidos jugados`
        : `${badge.matchesPlayed} matches played`
    }
    if (badge.id === 'giant_slayer' && badge.upsetCount) {
      return language === 'es'
        ? `${badge.upsetCount} victoria${badge.upsetCount > 1 ? 's' : ''} contra rivales superiores`
        : `${badge.upsetCount} upset win${badge.upsetCount > 1 ? 's' : ''}`
    }
    if (badge.id === 'founding_member' && badge.cityName) {
      return badge.cityName
    }
    return null
  }

  const extraInfo = getExtraInfo()

  if (compact) {
    return (
      <div className={`rounded-xl border ${styles.bg} ${styles.border} p-3 shadow-sm hover:shadow-md transition-all duration-200`}>
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${styles.iconBg} ${styles.iconShadow}`}>
            <BadgeIcon iconType={badge.icon} className="w-5 h-5 text-white" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{name}</h4>
            <p className="text-xs text-gray-500 truncate">{seasonName || description}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${styles.bg} ${styles.border} p-5 shadow-sm hover:shadow-lg transition-all duration-300 group`}>
      
      {/* Decorative shimmer effect for special badges */}
      {badge.tier === 'special' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      )}
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start space-x-3 mb-3">
          {/* Badge Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${styles.iconBg} ${styles.iconShadow} group-hover:scale-105 transition-transform duration-200`}>
            <BadgeIcon iconType={badge.icon} className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        
        {/* Extra Info */}
        {extraInfo && (
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${styles.badgeBg} ${styles.textColor} border ${styles.badgeBorder}`}>
            {extraInfo}
          </div>
        )}
        
        {/* Season Info (if applicable) */}
        {seasonName && !extraInfo && (
          <p className="text-xs text-gray-400 mt-2">
            {seasonName}
          </p>
        )}
      </div>
    </div>
  )
}
