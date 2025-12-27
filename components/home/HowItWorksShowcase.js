'use client';

import Link from 'next/link';

// Minimal Icons
const Icons = {
  Calendar: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Trophy: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  ChartUp: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 9l-5 5-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Users: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Shuffle: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  Target: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Check: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowRight: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Snowflake: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="m20 16-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4" />
    </svg>
  ),
  Sun: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  Leaf: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  Wind: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  ),
  Zap: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Globe: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
};

const content = {
  es: {
    badge: 'Cómo Funciona',
    title: 'La Liga en un Vistazo',
    subtitle: 'Todo lo que necesitas saber en 30 segundos',
    
    // Flow steps
    flow: {
      season: {
        label: 'Elige Temporada',
        description: '4 temporadas al año'
      },
      level: {
        label: 'Tu Nivel',
        description: 'Oro · Plata · Bronce'
      },
      matches: {
        label: '8 Partidos',
        description: '1 por semana'
      },
      playoffs: {
        label: 'Playoffs',
        description: 'Top 8 jugadores'
      }
    },
    
    // Seasons
    seasons: [
      { id: 'winter', name: 'Invierno', months: 'Ene-Mar' },
      { id: 'spring', name: 'Primavera', months: 'Abr-Jun' },
      { id: 'summer', name: 'Verano', months: 'Jul-Sep' },
      { id: 'autumn', name: 'Otoño', months: 'Oct-Dic' }
    ],
    
    // Levels
    levels: [
      { id: 'gold', name: 'Oro', elo: '1400+' },
      { id: 'silver', name: 'Plata', elo: '1200-1400' },
      { id: 'bronze', name: 'Bronce', elo: '1000-1200' }
    ],
    
    // Playoffs
    playoffRounds: {
      quarter: 'Cuartos',
      semi: 'Semi',
      final: 'Final'
    },
    
    // ELO + Swiss Section
    eloSwiss: {
      title: 'Sistema ELO + Swiss',
      subtitle: 'Emparejamiento inteligente para partidos justos',
      eloTitle: 'Puntos ELO',
      eloDescription: 'Sistema matemático que mide tu nivel real. Vencer a rivales fuertes te da más puntos.',
      swissTitle: 'Sistema Swiss',
      swissDescription: 'Sin eliminación: juegas las 8 rondas. Cada semana te emparejamos con alguien de puntuación similar.',
      resultTitle: 'El Resultado',
      benefits: [
        'Partidos siempre equilibrados',
        'Progreso medible cada semana',
        'Sin 6-0 aburridos'
      ],
      yourElo: 'Tu ELO',
      opponent: 'Rival',
      balancedMatch: 'Partido equilibrado'
    },
    
    learnMore: 'Más detalles',
    eloLink: 'Sistema ELO',
    swissLink: 'Sistema Swiss',
    
    // OpenRank Section
    openrank: {
      badge: 'Ranking Global',
      title: 'OpenRank',
      subtitle: 'Tu ELO cuenta para el ranking global. Compara tu nivel con jugadores de todas las ciudades.',
      features: [
        { title: 'Ranking Unificado', desc: 'Un número que define tu nivel' },
        { title: 'Múltiples Ciudades', desc: 'Compite en toda España' },
        { title: 'Historial Completo', desc: 'Tu progreso en el tiempo' }
      ],
      liveRanking: 'Top Jugadores',
      viewAll: 'Ver ranking completo'
    }
  },
  en: {
    badge: 'How It Works',
    title: 'The League at a Glance',
    subtitle: 'Everything you need to know in 30 seconds',
    
    flow: {
      season: {
        label: 'Pick Season',
        description: '4 seasons per year'
      },
      level: {
        label: 'Your Level',
        description: 'Gold · Silver · Bronze'
      },
      matches: {
        label: '8 Matches',
        description: '1 per week'
      },
      playoffs: {
        label: 'Playoffs',
        description: 'Top 8 players'
      }
    },
    
    seasons: [
      { id: 'winter', name: 'Winter', months: 'Jan-Mar' },
      { id: 'spring', name: 'Spring', months: 'Apr-Jun' },
      { id: 'summer', name: 'Summer', months: 'Jul-Sep' },
      { id: 'autumn', name: 'Autumn', months: 'Oct-Dec' }
    ],
    
    levels: [
      { id: 'gold', name: 'Gold', elo: '1400+' },
      { id: 'silver', name: 'Silver', elo: '1200-1400' },
      { id: 'bronze', name: 'Bronze', elo: '1000-1200' }
    ],
    
    playoffRounds: {
      quarter: 'Quarter',
      semi: 'Semi',
      final: 'Final'
    },
    
    eloSwiss: {
      title: 'ELO + Swiss System',
      subtitle: 'Smart matching for fair games',
      eloTitle: 'ELO Points',
      eloDescription: 'Mathematical system measuring your real level. Beating stronger opponents earns more points.',
      swissTitle: 'Swiss System',
      swissDescription: 'No elimination: play all 8 rounds. Each week paired with someone of similar score.',
      resultTitle: 'The Result',
      benefits: [
        'Always balanced matches',
        'Measurable weekly progress',
        'No boring 6-0 games'
      ],
      yourElo: 'Your ELO',
      opponent: 'Opponent',
      balancedMatch: 'Balanced match'
    },
    
    learnMore: 'Learn more',
    eloLink: 'ELO System',
    swissLink: 'Swiss System',
    
    // OpenRank Section
    openrank: {
      badge: 'Global Ranking',
      title: 'OpenRank',
      subtitle: 'Your ELO counts towards global ranking. Compare your level with players from all cities.',
      features: [
        { title: 'Unified Ranking', desc: 'One number defining your level' },
        { title: 'Multiple Cities', desc: 'Compete across Spain' },
        { title: 'Complete History', desc: 'Track progress over time' }
      ],
      liveRanking: 'Top Players',
      viewAll: 'View full ranking'
    }
  }
};

const seasonIcons = {
  winter: Icons.Snowflake,
  spring: Icons.Leaf,
  summer: Icons.Sun,
  autumn: Icons.Wind
};

const seasonColors = {
  winter: { bg: 'from-blue-400 to-cyan-400', text: 'text-blue-900' },
  spring: { bg: 'from-green-400 to-emerald-400', text: 'text-green-900' },
  summer: { bg: 'from-yellow-400 to-orange-400', text: 'text-yellow-900' },
  autumn: { bg: 'from-orange-400 to-red-400', text: 'text-orange-900' }
};

const levelStyles = {
  gold: { bg: 'bg-gradient-to-r from-yellow-300 to-amber-400', text: 'text-yellow-900' },
  silver: { bg: 'bg-gradient-to-r from-gray-200 to-slate-300', text: 'text-gray-800' },
  bronze: { bg: 'bg-gradient-to-r from-orange-300 to-amber-500', text: 'text-orange-900' }
};

export default function HowItWorksShowcase({ locale = 'es' }) {
  const t = content[locale] || content.es;

  return (
    <section id="how-it-works" className="relative py-16 sm:py-24 overflow-hidden scroll-mt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800" />
      
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-parque-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-parque-green/10 rounded-full blur-3xl" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/80 mb-4 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-parque-green animate-pulse" />
            {t.badge}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            {t.title}
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* === VISUAL FLOW === */}
        <div className="mb-16 sm:mb-20">
          {/* Desktop: Horizontal flow */}
          <div className="hidden md:flex items-stretch justify-between gap-3 lg:gap-4">
            {/* Step 1: Season */}
            <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-parque-purple to-violet-600 flex items-center justify-center">
                  <Icons.Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">{t.flow.season.label}</div>
                  <div className="text-xs text-gray-500">{t.flow.season.description}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {t.seasons.map((season) => {
                  const Icon = seasonIcons[season.id];
                  const colors = seasonColors[season.id];
                  return (
                    <div key={season.id} className={`bg-gradient-to-br ${colors.bg} rounded-lg p-2 text-center`}>
                      <Icon className={`w-4 h-4 mx-auto ${colors.text} mb-0.5`} />
                      <div className={`text-[10px] font-semibold ${colors.text} truncate`}>{season.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Icons.ArrowRight className="w-5 h-5 text-white/30 flex-shrink-0 self-center" />

            {/* Step 2: Level */}
            <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                  <Icons.Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">{t.flow.level.label}</div>
                  <div className="text-xs text-gray-500">{t.flow.level.description}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                {t.levels.map((level) => (
                  <div key={level.id} className={`${levelStyles[level.id].bg} rounded-lg px-3 py-1.5 flex items-center justify-between`}>
                    <span className={`text-xs font-bold ${levelStyles[level.id].text}`}>{level.name}</span>
                    <span className={`text-[10px] font-medium ${levelStyles[level.id].text} opacity-80`}>ELO {level.elo}</span>
                  </div>
                ))}
              </div>
            </div>

            <Icons.ArrowRight className="w-5 h-5 text-white/30 flex-shrink-0 self-center" />

            {/* Step 3: Matches */}
            <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-parque-green to-emerald-600 flex items-center justify-center">
                  <Icons.Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">{t.flow.matches.label}</div>
                  <div className="text-xs text-gray-500">{t.flow.matches.description}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xs font-medium text-white/60">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <Icons.ArrowRight className="w-5 h-5 text-white/30 flex-shrink-0 self-center" />

            {/* Step 4: Playoffs - Quarterfinals, Semifinals, Final - 2 brackets */}
            <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-parque-purple to-pink-600 flex items-center justify-center">
                  <Icons.Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">{t.flow.playoffs.label}</div>
                  <div className="text-xs text-gray-500">{t.flow.playoffs.description}</div>
                </div>
              </div>
              {/* Two bracket rows */}
              <div className="space-y-3">
                {['A', 'B'].map((bracket, idx) => (
                  <div key={bracket} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 w-3">{bracket}</span>
                    {/* Quarterfinals - 2x2 grid */}
                    <div className="grid grid-cols-2 gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-5 h-5 rounded bg-white/10 border border-white/20" />
                      ))}
                    </div>
                    <Icons.ArrowRight className="w-4 h-4 text-white/20" />
                    {/* Semifinals - 2x1 */}
                    <div className="grid grid-cols-1 gap-1">
                      <div className="w-5 h-5 rounded bg-white/15 border border-white/25" />
                      <div className="w-5 h-5 rounded bg-white/15 border border-white/25" />
                    </div>
                    <Icons.ArrowRight className="w-4 h-4 text-white/20" />
                    {/* Final - different colors for A and B */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-lg ${
                      idx === 0 
                        ? 'bg-gradient-to-br from-yellow-300 to-amber-400' 
                        : 'bg-gradient-to-br from-parque-purple to-violet-500'
                    }`}>
                      <Icons.Trophy className={`w-4 h-4 ${idx === 0 ? 'text-yellow-900' : 'text-white'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: Vertical compact flow */}
          <div className="md:hidden space-y-3">
            {/* Row 1: Season + Level */}
            <div className="flex items-stretch gap-2">
              {/* Season */}
              <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-parque-purple to-violet-600 flex items-center justify-center">
                    <Icons.Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm text-white font-semibold">{t.flow.season.label}</div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {t.seasons.map((season) => {
                    const Icon = seasonIcons[season.id];
                    const colors = seasonColors[season.id];
                    return (
                      <div key={season.id} className={`bg-gradient-to-br ${colors.bg} rounded-lg p-2 text-center`}>
                        <Icon className={`w-4 h-4 mx-auto ${colors.text}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <Icons.ArrowRight className="w-4 h-4 text-white/30" />
              </div>

              {/* Level */}
              <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                    <Icons.Target className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm text-white font-semibold">{t.flow.level.label}</div>
                </div>
                <div className="space-y-1">
                  {t.levels.map((level) => (
                    <div key={level.id} className={`${levelStyles[level.id].bg} rounded px-2 py-1 flex items-center justify-between`}>
                      <span className={`text-[10px] font-bold ${levelStyles[level.id].text}`}>{level.name}</span>
                      <span className={`text-[9px] font-medium ${levelStyles[level.id].text} opacity-80`}>{level.elo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Matches + Playoffs */}
            <div className="flex items-stretch gap-2">
              {/* Matches */}
              <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-parque-green to-emerald-600 flex items-center justify-center">
                    <Icons.Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-white font-semibold">{t.flow.matches.label}</div>
                    <div className="text-[10px] text-gray-500">{t.flow.matches.description}</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square rounded bg-white/10 border border-white/20 flex items-center justify-center text-[9px] text-white/50">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <Icons.ArrowRight className="w-4 h-4 text-white/30" />
              </div>

              {/* Playoffs */}
              <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-parque-purple to-pink-600 flex items-center justify-center">
                    <Icons.Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-white font-semibold">{t.flow.playoffs.label}</div>
                    <div className="text-[10px] text-gray-500">{t.flow.playoffs.description}</div>
                  </div>
                </div>
                {/* Two mini brackets */}
                <div className="space-y-2">
                  {['A', 'B'].map((bracket, idx) => (
                    <div key={bracket} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-500 w-3">{bracket}</span>
                      {/* Quarterfinals - 2x2 grid */}
                      <div className="grid grid-cols-2 gap-0.5">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-4 h-4 rounded bg-white/10 border border-white/20" />
                        ))}
                      </div>
                      <Icons.ArrowRight className="w-3 h-3 text-white/20" />
                      {/* Semifinals */}
                      <div className="grid grid-cols-1 gap-0.5">
                        <div className="w-4 h-4 rounded bg-white/15 border border-white/25" />
                        <div className="w-4 h-4 rounded bg-white/15 border border-white/25" />
                      </div>
                      <Icons.ArrowRight className="w-3 h-3 text-white/20" />
                      {/* Final */}
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                        idx === 0 
                          ? 'bg-gradient-to-br from-yellow-300 to-amber-400' 
                          : 'bg-gradient-to-br from-parque-purple to-violet-500'
                      }`}>
                        <Icons.Trophy className={`w-3 h-3 ${idx === 0 ? 'text-yellow-900' : 'text-white'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === ELO + SWISS SECTION === */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {t.eloSwiss.title}
            </h3>
            <p className="text-gray-400">{t.eloSwiss.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* ELO + Swiss Cards */}
            <div className="space-y-4">
              {/* ELO Card */}
              <Link href={`/${locale}/elo`} className="block bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 hover:border-parque-purple/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-parque-purple to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icons.ChartUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold mb-1">{t.eloSwiss.eloTitle}</h4>
                    <p className="text-sm text-gray-400 mb-2">{t.eloSwiss.eloDescription}</p>
                    <span className="inline-flex items-center gap-1 text-purple-400 text-sm font-medium group-hover:gap-2 transition-all">
                      {t.eloLink}
                      <Icons.ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
              
              {/* Swiss Card */}
              <Link href={`/${locale}/swiss`} className="block bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 hover:border-parque-green/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-parque-green to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icons.Shuffle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold mb-1">{t.eloSwiss.swissTitle}</h4>
                    <p className="text-sm text-gray-400 mb-2">{t.eloSwiss.swissDescription}</p>
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                      {t.swissLink}
                      <Icons.ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Benefits + Visual Demo - Compact */}
            <div className="bg-gradient-to-br from-parque-purple to-violet-700 rounded-2xl p-5 text-white flex flex-col">
              <h4 className="text-base font-bold mb-3 flex items-center gap-2">
                <Icons.Zap className="w-4 h-4" />
                {t.eloSwiss.resultTitle}
              </h4>
              
              <ul className="space-y-1.5 mb-4">
                {t.eloSwiss.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icons.Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              {/* Visual ELO matching demo - Compact */}
              <div className="bg-white/10 rounded-xl p-3 mt-auto">
                <div className="flex items-center gap-3">
                  {/* Your ELO */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] opacity-70">{t.eloSwiss.yourElo}</span>
                      <span className="text-xs font-bold">1,285</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-[57%] bg-gradient-to-r from-yellow-400 to-parque-green rounded-full" />
                    </div>
                  </div>
                  
                  {/* VS */}
                  <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded">VS</span>
                  
                  {/* Opponent ELO */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] opacity-70">{t.eloSwiss.opponent}</span>
                      <span className="text-xs font-bold">1,262</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-[52%] bg-gradient-to-r from-yellow-400 to-parque-green rounded-full" />
                    </div>
                  </div>
                </div>
                
                {/* Match quality */}
                <div className="text-center mt-2">
                  <span className="inline-flex items-center gap-1 text-[9px] bg-white/20 px-2 py-0.5 rounded-full">
                    <svg className="w-2.5 h-2.5 text-parque-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t.eloSwiss.balancedMatch}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* === OPENRANK SECTION === */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-parque-green/20 rounded-full text-sm font-medium text-parque-green mb-3">
              <Icons.Globe className="w-3.5 h-3.5" />
              {t.openrank.badge}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {t.openrank.title}
            </h3>
            <p className="text-gray-400 max-w-lg mx-auto">{t.openrank.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Features */}
            <div className="grid gap-3">
              {t.openrank.features.map((feature, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    idx === 0 ? 'bg-gradient-to-br from-parque-purple to-violet-600' :
                    idx === 1 ? 'bg-gradient-to-br from-parque-green to-emerald-600' :
                    'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    {idx === 0 && <Icons.Trophy className="w-5 h-5 text-white" />}
                    {idx === 1 && <Icons.Globe className="w-5 h-5 text-white" />}
                    {idx === 2 && <Icons.ChartUp className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Live Ranking Preview */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-parque-green animate-pulse" />
                  <span className="text-white font-semibold text-sm">OpenRank Live</span>
                </div>
                <span className="text-[10px] text-gray-500">{t.openrank.liveRanking}</span>
              </div>
              
              <div className="divide-y divide-white/5">
                {[
                  { rank: 1, name: 'Carlos M.', elo: 1487, city: 'Marbella', change: '+12' },
                  { rank: 2, name: 'Roberto G.', elo: 1465, city: 'Sotogrande', change: '+8' },
                  { rank: 3, name: 'Ana S.', elo: 1442, city: 'Estepona', change: '+15' },
                ].map((player, idx) => (
                  <div key={idx} className="px-4 py-2.5 flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                      'bg-gradient-to-br from-orange-400 to-amber-600 text-orange-900'
                    }`}>
                      {player.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{player.name}</div>
                      <div className="text-[10px] text-gray-500">{player.city}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm font-bold tabular-nums">{player.elo}</div>
                      <div className="text-[10px] text-parque-green font-medium">{player.change}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-4 py-3 border-t border-white/10">
                <Link 
                  href={`/${locale}/openrank`}
                  className="flex items-center justify-center gap-2 text-parque-green text-sm font-medium hover:text-parque-green/80 transition-colors group"
                >
                  {t.openrank.viewAll}
                  <Icons.ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
