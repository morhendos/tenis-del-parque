'use client'

import { Trophy, Medal, Star, Award, Sparkles } from 'lucide-react'
import { usePlayerAchievements } from '@/lib/hooks/usePlayerAchievements'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'
import TrophyCard from './TrophyCard'
import BadgeCard from './BadgeCard'

/**
 * Trophy Room Component
 * Displays all player achievements - trophies, placements, and badges
 */
export default function TrophyRoom({ language = 'es', locale = 'es', compact = false }) {
  const { achievements, player, loading, error } = usePlayerAchievements()

  if (loading) {
    return (
      <TennisPreloaderInline 
        text={language === 'es' ? 'Cargando logros...' : 'Loading achievements...'}
        locale={locale}
      />
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-600">
          {language === 'es' ? 'Error al cargar los logros' : 'Failed to load achievements'}
        </p>
      </div>
    )
  }

  const { trophies = [], badges = [], summary = {} } = achievements || {}
  const hasTrophies = trophies.length > 0
  const hasBadges = badges.length > 0
  const hasAchievements = hasTrophies || hasBadges

  // Empty state
  if (!hasAchievements) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {language === 'es' ? '¡Tu Sala de Trofeos Espera!' : 'Your Trophy Room Awaits!'}
        </h2>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {language === 'es' 
            ? 'Juega partidos, gana torneos y desbloquea logros especiales. ¡Tus trofeos aparecerán aquí!'
            : 'Play matches, win tournaments and unlock special achievements. Your trophies will appear here!'}
        </p>
        <div className="flex justify-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{language === 'es' ? 'Trofeos' : 'Trophies'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>{language === 'es' ? 'Insignias' : 'Badges'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>{language === 'es' ? 'Logros' : 'Achievements'}</span>
          </div>
        </div>
      </div>
    )
  }

  // Compact view (for dashboard widget)
  if (compact) {
    const topAchievements = [...trophies, ...badges].slice(0, 4)
    return (
      <div className="space-y-3">
        {topAchievements.map((item, index) => (
          item.type === 'trophy' ? (
            <TrophyCard key={`trophy-${index}`} trophy={item} language={language} compact />
          ) : (
            <BadgeCard key={`badge-${index}`} badge={item} language={language} compact />
          )
        ))}
      </div>
    )
  }

  // Full view
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600 rounded-2xl text-white p-6 sm:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white rounded-full"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              {language === 'es' ? 'Sala de Trofeos' : 'Trophy Room'}
            </h1>
          </div>
          <p className="text-purple-100 mb-6">
            {language === 'es' 
              ? 'Tus logros y reconocimientos en la liga'
              : 'Your achievements and recognitions in the league'}
          </p>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{summary.totalTrophies || 0}</div>
              <div className="text-xs text-purple-200">{language === 'es' ? 'Trofeos' : 'Trophies'}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-amber-300">{summary.goldTrophies || 0}</div>
              <div className="text-xs text-purple-200">{language === 'es' ? 'Oro' : 'Gold'}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-gray-300">{summary.silverTrophies || 0}</div>
              <div className="text-xs text-purple-200">{language === 'es' ? 'Plata' : 'Silver'}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{summary.totalBadges || 0}</div>
              <div className="text-xs text-purple-200">{language === 'es' ? 'Insignias' : 'Badges'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trophies Section */}
      {hasTrophies && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'es' ? 'Trofeos' : 'Trophies'}
            </h2>
            <span className="text-sm text-gray-500">({trophies.length})</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {trophies.map((trophy, index) => (
              <TrophyCard key={`trophy-${index}`} trophy={trophy} language={language} />
            ))}
          </div>
        </section>
      )}

      {/* Badges Section */}
      {hasBadges && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-gray-900">
              {language === 'es' ? 'Insignias' : 'Badges'}
            </h2>
            <span className="text-sm text-gray-500">({badges.length})</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {badges.map((badge, index) => (
              <BadgeCard key={`badge-${index}`} badge={badge} language={language} />
            ))}
          </div>
        </section>
      )}

      {/* Coming Soon Teaser */}
      <section className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              {language === 'es' ? '¡Más Logros Pronto!' : 'More Achievements Coming!'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'es' 
                ? 'Estamos trabajando en nuevos trofeos y desafíos especiales. ¡Sigue jugando para desbloquearlos!'
                : 'We\'re working on new trophies and special challenges. Keep playing to unlock them!'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
