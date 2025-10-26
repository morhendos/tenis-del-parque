import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function DashboardHeader({ player, language }) {
  const params = useParams()
  const locale = params?.locale || 'es'
  
  // Count leagues if player has registrations
  const leagueCount = player?.registrations?.length || 0
  const isMultiLeague = leagueCount > 1
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple via-purple-600 to-purple-700 rounded-2xl text-white p-6 sm:p-8 shadow-xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="animate-slide-in-left">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {language === 'es' ? '¡Hola' : 'Hello'}, {player.name.split(' ')[0]}!
              </h1>
            </div>
            <p className="text-purple-100 text-sm sm:text-base">
              {language === 'es' 
                ? 'Tu centro de control personal de tenis'
                : 'Your personal tennis command center'}
            </p>
            {/* Multi-league badge */}
            {isMultiLeague && (
              <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                {language === 'es' 
                  ? `${leagueCount} Ligas Activas` 
                  : `${leagueCount} Active Leagues`}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 animate-slide-in-right">
            <Link
              href={`/${locale}/player/matches`}
              className="inline-flex items-center justify-center px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 A10 10 0 0 1 12 22 M12 2 A10 10 0 0 0 12 22"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
              {language === 'es' ? 'Mis Partidos' : 'My Matches'}
            </Link>
            <Link
              href={`/${locale}/player/league`}
              className="inline-flex items-center justify-center px-5 py-3 bg-white text-parque-purple rounded-xl hover:bg-purple-50 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              {isMultiLeague 
                ? (language === 'es' ? 'Mis Ligas' : 'My Leagues')
                : (language === 'es' ? 'Ver Liga' : 'View League')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
