import { Calendar, Users, CreditCard, TrendingUp, Award, Info } from 'lucide-react'

// Level descriptions for different league types
const levelDescriptions = {
  es: {
    beginner: {
      title: 'Nivel Principiante',
      description: 'Perfecto para jugadores que están comenzando o tienen experiencia básica. Enfoque en aprender fundamentos y disfrutar del juego en un ambiente relajado.',
      skills: [
        'Jugadores nuevos o con experiencia limitada',
        'Golpes básicos en desarrollo',
        'Enfoque en aprender y divertirse',
        'Ambiente amigable y sin presión'
      ]
    },
    intermediate: {
      title: 'Nivel Intermedio',
      description: 'Ideal para jugadores con fundamentos sólidos que buscan mejorar su juego. Partidos competitivos pero amistosos con jugadores de nivel similar.',
      skills: [
        'Dominio de golpes básicos',
        'Capacidad de mantener rallies consistentes',
        'Conocimiento de estrategia básica',
        'Nivel competitivo moderado'
      ]
    },
    advanced: {
      title: 'Nivel Avanzado',
      description: 'Para jugadores experimentados con técnica sólida y juego competitivo. Partidos intensos con alta calidad de juego.',
      skills: [
        'Técnica refinada en todos los golpes',
        'Juego estratégico avanzado',
        'Experiencia en competición',
        'Alta intensidad y competitividad'
      ]
    },
    open: {
      title: 'Liga Abierta',
      description: 'Liga multi-nivel donde jugadores de diferentes habilidades compiten. El sistema ELO garantiza partidos equilibrados basados en tu nivel real.',
      skills: [
        'Todos los niveles bienvenidos',
        'Emparejamientos basados en ELO',
        'Oportunidad de jugar contra variedad de jugadores',
        'Ambiente inclusivo y competitivo'
      ]
    }
  },
  en: {
    beginner: {
      title: 'Beginner Level',
      description: 'Perfect for players who are starting out or have basic experience. Focus on learning fundamentals and enjoying the game in a relaxed environment.',
      skills: [
        'New players or limited experience',
        'Basic strokes in development',
        'Focus on learning and having fun',
        'Friendly, no-pressure atmosphere'
      ]
    },
    intermediate: {
      title: 'Intermediate Level',
      description: 'Ideal for players with solid fundamentals looking to improve their game. Competitive yet friendly matches with similarly skilled players.',
      skills: [
        'Command of basic strokes',
        'Ability to maintain consistent rallies',
        'Basic strategy knowledge',
        'Moderate competitive level'
      ]
    },
    advanced: {
      title: 'Advanced Level',
      description: 'For experienced players with solid technique and competitive play. Intense matches with high-quality tennis.',
      skills: [
        'Refined technique on all strokes',
        'Advanced strategic play',
        'Competition experience',
        'High intensity and competitiveness'
      ]
    },
    open: {
      title: 'Open League',
      description: 'Multi-level league where players of different abilities compete. The ELO system ensures balanced matches based on your actual level.',
      skills: [
        'All levels welcome',
        'ELO-based matchmaking',
        'Opportunity to play against variety of players',
        'Inclusive and competitive environment'
      ]
    }
  }
}

export default function LeagueInfoTab({ league, currentSeason, language, locale }) {
  const t = {
    es: {
      upcomingTitle: '¡Próximamente!',
      upcomingSubtitle: 'Esta liga comenzará pronto',
      leagueDetails: 'Detalles de la Liga',
      startDate: 'Fecha de Inicio',
      endDate: 'Fecha de Fin',
      availableSpots: 'Plazas Disponibles',
      price: 'Precio',
      free: 'Gratis',
      registerNow: '¡Inscríbete Ahora!',
      leagueLevel: 'Nivel de la Liga',
      whatToExpect: '¿Qué Esperar?',
      aboutLeague: 'Sobre Esta Liga',
      tournamentFormat: 'Formato del Torneo',
      rounds: 'rondas',
      swissFormat: 'Sistema Suizo',
      swissDescription: 'El sistema suizo empareja jugadores de nivel similar en cada ronda, garantizando partidos competitivos y equilibrados.',
      playoffSystem: 'Sistema de Playoffs',
      playoffDescription: 'Los mejores jugadores de la fase regular clasifican para los playoffs finales.',
      eloRanking: 'Ranking ELO',
      eloDescription: 'Tu clasificación se actualiza después de cada partido basándose en el resultado y el nivel de tu oponente.',
      whyJoin: '¿Por Qué Unirse?',
      benefits: [
        'Conoce a otros jugadores apasionados por el tenis',
        'Mejora tu juego con partidos competitivos regulares',
        'Sistema de emparejamiento justo basado en habilidad',
        'Seguimiento detallado de tu progreso y estadísticas'
      ]
    },
    en: {
      upcomingTitle: 'Coming Soon!',
      upcomingSubtitle: 'This league will start soon',
      leagueDetails: 'League Details',
      startDate: 'Start Date',
      endDate: 'End Date',
      availableSpots: 'Available Spots',
      price: 'Price',
      free: 'Free',
      registerNow: 'Register Now!',
      leagueLevel: 'League Level',
      whatToExpect: 'What to Expect?',
      aboutLeague: 'About This League',
      tournamentFormat: 'Tournament Format',
      rounds: 'rounds',
      swissFormat: 'Swiss System',
      swissDescription: 'The Swiss system pairs players of similar level in each round, ensuring competitive and balanced matches.',
      playoffSystem: 'Playoff System',
      playoffDescription: 'Top players from the regular season qualify for the final playoffs.',
      eloRanking: 'ELO Ranking',
      eloDescription: 'Your rating is updated after each match based on the result and your opponent&apos;s level.',
      whyJoin: 'Why Join?',
      benefits: [
        'Meet other passionate tennis players',
        'Improve your game with regular competitive matches',
        'Fair skill-based matchmaking system',
        'Detailed tracking of your progress and statistics'
      ]
    }
  }

  const content = t[language]
  
  // Determine league level from the skillLevel field or fallback to name/slug detection
  const getLeagueLevel = () => {
    // First, check if league has a skillLevel field
    if (league.skillLevel) {
      // Map 'all' to 'open' for display purposes
      if (league.skillLevel === 'all') return 'open'
      return league.skillLevel // 'beginner', 'intermediate', or 'advanced'
    }
    
    // Fallback: try to detect from name/slug
    const name = league.name?.toLowerCase() || league.slug?.toLowerCase() || ''
    if (name.includes('beginner') || name.includes('principiante')) return 'beginner'
    if (name.includes('advanced') || name.includes('avanzado')) return 'advanced'
    if (name.includes('open') || name.includes('abierta') || name.includes('general')) return 'open'
    
    // Default to intermediate if we can't determine
    return 'intermediate'
  }

  const leagueLevel = getLeagueLevel()
  const levelInfo = levelDescriptions[language][leagueLevel]

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8 bg-gradient-to-br from-parque-purple/5 to-emerald-50 rounded-2xl">
        <div className="text-7xl mb-4">🎾</div>
        <h3 className="text-3xl md:text-4xl font-bold text-parque-purple mb-3">
          {content.upcomingTitle}
        </h3>
        <p className="text-lg text-gray-600">
          {content.upcomingSubtitle}
        </p>
      </div>

      {/* Key Details Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* League Details Card */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-parque-purple/20 transition-all duration-300 hover:shadow-lg">
          <h4 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
            <Info className="w-6 h-6 text-parque-purple" />
            {content.leagueDetails}
          </h4>
          
          <div className="space-y-5">
            {league.seasonConfig?.startDate && (
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-emerald-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{content.startDate}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(league.seasonConfig.startDate)}
                  </p>
                </div>
              </div>
            )}

            {league.seasonConfig?.endDate && (
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{content.endDate}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(league.seasonConfig.endDate)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{content.availableSpots}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {league.seasonConfig?.maxPlayers || 32}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-amber-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{content.price}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {league.seasonConfig?.price?.isFree || league.seasonConfig?.price?.amount === 0
                    ? content.free
                    : `${league.seasonConfig?.price?.amount}€`}
                </p>
              </div>
            </div>
          </div>

          {league.status === 'registration_open' && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <a
                href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${league.slug}`}
                className="block w-full text-center bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-4 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {content.registerNow}
              </a>
            </div>
          )}
        </div>

        {/* League Level Card */}
        <div className="bg-gradient-to-br from-parque-purple/5 to-purple-50 border-2 border-purple-100 rounded-2xl p-6 hover:border-parque-purple/30 transition-all duration-300 hover:shadow-lg">
          <h4 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-parque-purple" />
            {content.leagueLevel}
          </h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="text-2xl font-bold text-parque-purple mb-2">
                {levelInfo.title}
              </h5>
              <p className="text-gray-700 leading-relaxed">
                {levelInfo.description}
              </p>
            </div>

            <div className="pt-4 border-t border-purple-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">{content.whatToExpect}</p>
              <ul className="space-y-2">
                {levelInfo.skills.map((skill, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* About League Section */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8">
        <h4 className="font-bold text-2xl text-gray-900 mb-6">{content.aboutLeague}</h4>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Swiss Format */}
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <h5 className="font-semibold text-lg text-gray-900">{content.swissFormat}</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              {content.swissDescription}
            </p>
            {league.config?.roundsPerSeason && (
              <p className="text-sm font-medium text-emerald-600">
                {league.config.roundsPerSeason} {content.rounds}
              </p>
            )}
          </div>

          {/* Playoff System */}
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <span className="text-2xl">🏆</span>
            </div>
            <h5 className="font-semibold text-lg text-gray-900">{content.playoffSystem}</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              {content.playoffDescription}
            </p>
          </div>

          {/* ELO Ranking */}
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h5 className="font-semibold text-lg text-gray-900">{content.eloRanking}</h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              {content.eloDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Why Join Section */}
      <div className="bg-gradient-to-br from-parque-purple to-purple-600 text-white rounded-2xl p-6 md:p-8">
        <h4 className="font-bold text-2xl mb-6">{content.whyJoin}</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {content.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-1 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">✓</span>
              </div>
              <p className="text-white/90">{benefit}</p>
            </div>
          ))}
        </div>
        
        {league.status === 'registration_open' && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <a
              href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${league.slug}`}
              className="block w-full md:w-auto text-center bg-white text-parque-purple px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {content.registerNow}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
