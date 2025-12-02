'use client'

import { Trophy, Award, Star, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import TrophyCard from './TrophyCard'
import SeasonPlacementCard from './SeasonPlacementCard'
import BadgeCard from './BadgeCard'
import { usePlayerAchievements } from '@/lib/hooks/usePlayerAchievements'

/**
 * Trophy Room Component
 * Displays player achievements in a trophy cabinet layout
 */
export default function TrophyRoom({ language = 'es', locale = 'es', compact = false }) {
  const { achievements, loading, error } = usePlayerAchievements()

  const content = {
    es: {
      title: 'Sala de Trofeos',
      subtitle: 'Tus logros y reconocimientos',
      trophies: 'Trofeos',
      placements: 'Clasificaciones',
      badges: 'Insignias',
      noAchievements: 'Aún no tienes logros',
      noAchievementsDesc: 'Participa en torneos y temporadas para ganar trofeos e insignias',
      viewAll: 'Ver todo',
      loading: 'Cargando logros...',
      error: 'Error al cargar los logros'
    },
    en: {
      title: 'Trophy Room',
      subtitle: 'Your achievements and recognition',
      trophies: 'Trophies',
      placements: 'Placements',
      badges: 'Badges',
      noAchievements: 'No achievements yet',
      noAchievementsDesc: 'Participate in tournaments and seasons to earn trophies and badges',
      viewAll: 'View all',
      loading: 'Loading achievements...',
      error: 'Error loading achievements'
    }
  }

  const t = content[language] || content.es

  // Loading state
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600 text-sm">{t.error}</p>
      </div>
    )
  }

  // Empty state
  const hasAnyAchievements = achievements && (
    achievements.trophies?.length > 0 ||
    achievements.seasonPlacements?.length > 0 ||
    achievements.badges?.length > 0
  )

  if (!hasAnyAchievements) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 p-6">
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{t.noAchievements}</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">{t.noAchievementsDesc}</p>
        </div>
      </div>
    )
  }

  // Compact view for dashboard
  if (compact) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-amber-50/50 via-white to-purple-50/50 p-5 shadow-sm hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{t.title}</h3>
              <p className="text-xs text-gray-500">{t.subtitle}</p>
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="flex items-center space-x-2">
            {achievements.summary?.goldTrophies > 0 && (
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                {achievements.summary.goldTrophies} 🏆
              </span>
            )}
            {achievements.summary?.silverTrophies > 0 && (
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                {achievements.summary.silverTrophies} 🥈
              </span>
            )}
            {achievements.summary?.bronzeTrophies > 0 && (
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                {achievements.summary.bronzeTrophies} 🥉
              </span>
            )}
          </div>
        </div>

        {/* Quick Preview - Top 3 items */}
        <div className="space-y-2">
          {achievements.trophies?.slice(0, 2).map((trophy, index) => (
            <TrophyCard key={`trophy-${index}`} trophy={trophy} language={language} compact />
          ))}
          {achievements.badges?.slice(0, 1).map((badge, index) => (
            <BadgeCard key={`badge-${index}`} badge={badge} language={language} compact />
          ))}
        </div>

        {/* View All Link */}
        {(achievements.trophies?.length > 2 || achievements.badges?.length > 1 || achievements.seasonPlacements?.length > 0) && (
          <Link
            href={`/${locale}/player/achievements`}
            className="mt-4 flex items-center justify-center w-full py-2.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
          >
            {t.viewAll}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>
    )
  }

  // Full view
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>
      </div>

      {/* Trophies Section */}
      {achievements.trophies?.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">{t.trophies}</h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              {achievements.trophies.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.trophies.map((trophy, index) => (
              <TrophyCard key={`trophy-${index}`} trophy={trophy} language={language} />
            ))}
          </div>
        </section>
      )}

      {/* Season Placements Section */}
      {achievements.seasonPlacements?.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900">{t.placements}</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              {achievements.seasonPlacements.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.seasonPlacements.map((placement, index) => (
              <SeasonPlacementCard key={`placement-${index}`} placement={placement} language={language} />
            ))}
          </div>
        </section>
      )}

      {/* Badges Section */}
      {achievements.badges?.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">{t.badges}</h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
              {achievements.badges.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.badges.map((badge, index) => (
              <BadgeCard key={`badge-${index}`} badge={badge} language={language} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
