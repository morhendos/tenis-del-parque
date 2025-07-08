import Link from 'next/link'

export default function DashboardHeader({ player, language }) {
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
                {language === 'es' ? '¡Hola' : 'Hello'}, {player.name}!
              </h1>
              <span className="text-2xl animate-pulse">👋</span>
            </div>
            <p className="text-purple-100 text-sm sm:text-base">
              {language === 'es' 
                ? 'Tu centro de control personal de tenis'
                : 'Your personal tennis command center'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 animate-slide-in-right">
            <Link
              href="/player/matches"
              className="inline-flex items-center justify-center px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium shadow-lg"
            >
              <span className="mr-2 text-lg">🎾</span>
              {language === 'es' ? 'Mis Partidos' : 'My Matches'}
            </Link>
            <Link
              href="/player/league"
              className="inline-flex items-center justify-center px-5 py-3 bg-white text-parque-purple rounded-xl hover:bg-purple-50 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium shadow-lg"
            >
              <span className="mr-2 text-lg">🏆</span>
              {language === 'es' ? 'Ver Liga' : 'View League'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 