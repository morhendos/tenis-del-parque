'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/lib/hooks/useLanguage'
import { useWelcomeModal } from '@/lib/hooks/useWelcomeModal'
import { usePlayerDashboard } from '@/lib/hooks/usePlayerDashboard'
import WelcomeModal from '@/components/ui/WelcomeModal'
import AnnouncementModal from '@/components/ui/AnnouncementModal'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'
import DashboardHeader from '@/components/player/DashboardHeader'
import StatsCards from '@/components/player/StatsCards'
import MultiLeagueCard from '@/components/player/MultiLeagueCard'
import { RecentMatches, UpcomingMatches } from '@/components/player/MatchActivity'
import QuickActions from '@/components/player/QuickActions'
import OpenRankAchievement from '@/components/player/OpenRankAchievement'
import TrophyRoom from '@/components/player/TrophyRoom'
import { dashboardStyles } from '@/styles/dashboard'

export default function PlayerDashboard() {
  const params = useParams()
  const locale = params.locale || 'es'
  const language = locale
  const isLanguageLoaded = true
  
  const { showWelcome, playerName, closeWelcome } = useWelcomeModal()
  const {
    player,
    loading,
    recentMatches,
    upcomingMatches,
    showFirstRoundAnnouncement,
    handleCloseFirstRoundAnnouncement,
    getDynamicFirstRoundAnnouncement
  } = usePlayerDashboard()

  // Show loading with standardized tennis preloader
  if (loading) {
    return (
      <TennisPreloaderInline 
        text={language === 'es' ? 'Cargando dashboard...' : 'Loading dashboard...'}
        locale={language}
      />
    )
  }

  if (!player) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-parque-purple to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'es' ? 'Bienvenido al Portal del Jugador' : 'Welcome to Player Portal'}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'es' 
              ? 'No se encontraron datos del jugador.' 
              : 'No player data found.'}
          </p>
          <Link
            href={`/${locale}/player/profile`}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-parque-purple to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {language === 'es' ? 'Configurar Perfil' : 'Set Up Profile'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{dashboardStyles}</style>
      
      <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
        {/* Welcome Header */}
        <DashboardHeader player={player} language={language} />

        {/* Stats Cards */}
        <StatsCards player={player} language={language} />

        {/* OpenRank Achievement */}
        <OpenRankAchievement player={player} language={language} locale={locale} />

        {/* Trophy Room - Achievements & Trophies */}
        <TrophyRoom language={language} locale={locale} compact />

        {/* League Cards - Now supports multiple leagues */}
        <MultiLeagueCard player={player} language={language} />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <RecentMatches matches={recentMatches} language={language} />
          <UpcomingMatches matches={upcomingMatches} language={language} />
        </div>

        {/* Quick Actions */}
        <QuickActions language={language} locale={locale} />

        {/* Welcome Modal */}
        <WelcomeModal
          isOpen={showWelcome}
          onClose={closeWelcome}
          playerName={playerName || player?.name || 'Player'}
        />
        
        {/* First Round Match Announcement */}
        {showFirstRoundAnnouncement && (
          <AnnouncementModal
            isOpen={true}
            onClose={handleCloseFirstRoundAnnouncement}
            announcement={getDynamicFirstRoundAnnouncement()}
          />
        )}
      </div>
    </>
  )
}
