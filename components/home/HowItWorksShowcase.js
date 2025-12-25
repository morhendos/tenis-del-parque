'use client';

import Link from 'next/link';

// Custom SVG Icons
const Icons = {
  Calendar: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" />
    </svg>
  ),
  Trophy: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  ChartUp: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 9l-5 5-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 9h-4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Globe: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Smartphone: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" strokeLinecap="round" />
    </svg>
  ),
  Users: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
  Award: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Zap: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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
  Snowflake: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="m20 16-4-4 4-4" />
      <path d="m4 8 4 4-4 4" />
      <path d="m16 4-4 4-4-4" />
      <path d="m8 20 4-4 4 4" />
    </svg>
  ),
  Check: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Play: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  TennisBall: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M18.09 6.24C16.5 9.15 16.5 14.85 18.09 17.76" />
      <path d="M5.91 6.24C7.5 9.15 7.5 14.85 5.91 17.76" />
    </svg>
  )
};

// Season data
const seasons = [
  { id: 'winter', name: { es: 'Invierno', en: 'Winter' }, months: { es: 'Ene - Mar', en: 'Jan - Mar' }, icon: Icons.Snowflake, color: 'from-blue-400 to-cyan-300' },
  { id: 'spring', name: { es: 'Primavera', en: 'Spring' }, months: { es: 'Abr - Jun', en: 'Apr - Jun' }, icon: Icons.Leaf, color: 'from-green-400 to-emerald-300' },
  { id: 'summer', name: { es: 'Verano', en: 'Summer' }, months: { es: 'Jul - Sep', en: 'Jul - Sep' }, icon: Icons.Sun, color: 'from-yellow-400 to-orange-300' },
  { id: 'autumn', name: { es: 'Otoño', en: 'Autumn' }, months: { es: 'Oct - Dic', en: 'Oct - Dec' }, icon: Icons.Leaf, color: 'from-orange-400 to-red-300' }
];

// Skill levels data
const skillLevels = [
  { 
    id: 'gold', 
    name: { es: 'Oro', en: 'Gold' }, 
    description: { es: 'Jugadores avanzados', en: 'Advanced players' },
    elo: '1400+',
    color: 'from-yellow-300 via-yellow-400 to-amber-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-700',
    icon: '🥇'
  },
  { 
    id: 'silver', 
    name: { es: 'Plata', en: 'Silver' }, 
    description: { es: 'Jugadores intermedios', en: 'Intermediate players' },
    elo: '1200-1400',
    color: 'from-gray-300 via-gray-400 to-slate-500',
    bgColor: 'bg-gradient-to-br from-gray-50 to-slate-100',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    icon: '🥈'
  },
  { 
    id: 'bronze', 
    name: { es: 'Bronce', en: 'Bronze' }, 
    description: { es: 'Jugadores principiantes', en: 'Beginner players' },
    elo: '1000-1200',
    color: 'from-orange-300 via-orange-400 to-amber-600',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-700',
    icon: '🥉'
  }
];

// Content translations
const content = {
  es: {
    mainTitle: 'Así Funciona la Liga',
    mainSubtitle: 'Todo lo que necesitas saber para empezar a jugar',
    
    seasonSection: {
      title: '4 Temporadas al Año',
      subtitle: 'Siempre hay una temporada a punto de empezar',
      matchesLabel: '8 partidos',
      playoffsLabel: '+ Playoffs',
      joinAnytime: 'Únete en cualquier momento'
    },
    
    structureSection: {
      title: 'Estructura de Temporada',
      regularSeason: {
        title: '8 Partidos de Liga',
        description: '1 partido por semana durante 2 meses',
        features: ['Rivales de tu nivel', 'Horarios flexibles', 'Sistema de puntos']
      },
      playoffs: {
        title: 'Playoffs Finales',
        description: 'Los mejores compiten por el título',
        features: ['Semifinales', 'Final épica', '¡Trofeo al campeón!']
      }
    },
    
    levelsSection: {
      title: '3 Niveles de Juego',
      subtitle: 'Compite con jugadores de tu nivel exacto',
      findYourLevel: 'Encuentra tu nivel'
    },
    
    eloSection: {
      title: 'Sistema ELO + Swiss',
      subtitle: 'Emparejamiento inteligente para partidos justos',
      eloTitle: 'Puntos ELO',
      eloDescription: 'Sistema matemático que mide tu nivel real. Cuantos más partidos juegas, más preciso se vuelve. Vencer a rivales fuertes te da más puntos.',
      eloLink: 'Más sobre ELO',
      swissTitle: 'Sistema Swiss',
      swissDescription: 'Formato sin eliminación: juegas las 8 rondas. Cada semana te emparejamos con alguien de puntuación similar para partidos equilibrados.',
      swissLink: 'Más sobre Swiss',
      benefits: [
        'Partidos siempre equilibrados',
        'Progreso medible semana a semana',
        'Sin 6-0 aburridos'
      ]
    },
    
    openrankSection: {
      title: 'OpenRank Global',
      subtitle: 'Tu ranking trasciende tu liga local',
      description: 'Tu ELO cuenta para el ranking global OpenRank. Compara tu nivel con jugadores de todas las ciudades y sube en el ranking mundial.',
      features: [
        { title: 'Ranking Unificado', description: 'Un solo número que define tu nivel' },
        { title: 'Múltiples Ciudades', description: 'Compara tu nivel con toda España' },
        { title: 'Historial Completo', description: 'Mira tu progreso a lo largo del tiempo' }
      ]
    },
    
    appSection: {
      title: 'Todo en Tu Móvil',
      subtitle: 'Gestiona tu liga desde cualquier lugar',
      features: [
        'Tu centro de mando personal',
        'Ranking global en tiempo real',
        'Registra resultados al instante'
      ],
      installPrompt: 'Instala la app gratis'
    }
  },
  en: {
    mainTitle: 'How the League Works',
    mainSubtitle: 'Everything you need to know to start playing',
    
    seasonSection: {
      title: '4 Seasons Per Year',
      subtitle: 'There\'s always a season about to start',
      matchesLabel: '8 matches',
      playoffsLabel: '+ Playoffs',
      joinAnytime: 'Join anytime'
    },
    
    structureSection: {
      title: 'Season Structure',
      regularSeason: {
        title: '8 League Matches',
        description: '1 match per week for 2 months',
        features: ['Opponents at your level', 'Flexible scheduling', 'Points system']
      },
      playoffs: {
        title: 'Final Playoffs',
        description: 'Top players compete for the title',
        features: ['Semifinals', 'Epic final', 'Trophy for the champion!']
      }
    },
    
    levelsSection: {
      title: '3 Skill Levels',
      subtitle: 'Compete with players at your exact level',
      findYourLevel: 'Find your level'
    },
    
    eloSection: {
      title: 'ELO + Swiss System',
      subtitle: 'Smart matching for fair games',
      eloTitle: 'ELO Points',
      eloDescription: 'Mathematical system that measures your real level. The more matches you play, the more accurate it becomes. Beating stronger opponents earns you more points.',
      eloLink: 'Learn more about ELO',
      swissTitle: 'Swiss System',
      swissDescription: 'No-elimination format: you play all 8 rounds. Each week we pair you with someone of similar score for balanced matches.',
      swissLink: 'Learn more about Swiss',
      benefits: [
        'Always balanced matches',
        'Measurable progress week by week',
        'No boring 6-0 games'
      ]
    },
    
    openrankSection: {
      title: 'Global OpenRank',
      subtitle: 'Your ranking transcends your local league',
      description: 'Your ELO counts towards the global OpenRank ranking. Compare your level with players from all cities and climb the worldwide rankings.',
      features: [
        { title: 'Unified Ranking', description: 'One number that defines your level' },
        { title: 'Multiple Cities', description: 'Compare your level across all of Spain' },
        { title: 'Complete History', description: 'Track your progress over time' }
      ]
    },
    
    appSection: {
      title: 'Everything on Your Phone',
      subtitle: 'Manage your league from anywhere',
      features: [
        'Your personal command center',
        'Global rankings in real-time',
        'Record results instantly'
      ],
      installPrompt: 'Install the free app'
    }
  }
};

export default function HowItWorksShowcase({ locale = 'es' }) {
  const t = content[locale] || content.es;

  return (
    <div id="how-it-works" className="relative overflow-hidden scroll-mt-16">
      {/* Main Section Header */}
      <section className="pt-6 sm:pt-8 pb-16 sm:pb-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t.mainTitle}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {t.mainSubtitle}
            </p>
          </div>
          
          {/* ===== SEASONS SECTION ===== */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {t.seasonSection.title}
              </h3>
              <p className="text-gray-600">{t.seasonSection.subtitle}</p>
            </div>
            
            {/* Seasons - Mobile: horizontal scroll */}
            <div className="sm:hidden -mx-4 px-4">
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {seasons.map((season) => {
                  const SeasonIcon = season.icon;
                  return (
                    <div 
                      key={season.id}
                      className="flex-shrink-0 w-[140px] snap-center bg-white rounded-xl p-4 shadow-md border border-gray-100 text-center"
                    >
                      <div className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-br ${season.color} flex items-center justify-center mb-3 shadow-sm`}>
                        <SeasonIcon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mb-0.5">{season.name[locale]}</h4>
                      <p className="text-xs text-gray-500 mb-2">{season.months[locale]}</p>
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 bg-parque-purple/10 text-parque-purple text-xs font-medium rounded-full">
                          {t.seasonSection.matchesLabel}
                        </span>
                        <span className="px-2 py-0.5 bg-parque-green/10 text-parque-green text-xs font-medium rounded-full">
                          {t.seasonSection.playoffsLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Seasons grid - Desktop */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-4 lg:gap-6">
              {seasons.map((season) => {
                const SeasonIcon = season.icon;
                return (
                  <div 
                    key={season.id}
                    className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 text-center"
                  >
                    <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${season.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                      <SeasonIcon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{season.name[locale]}</h4>
                    <p className="text-sm text-gray-500 mb-3">{season.months[locale]}</p>
                    <div className="flex flex-col gap-1.5">
                      <span className="px-3 py-1 bg-parque-purple/10 text-parque-purple text-xs font-medium rounded-full">
                        {t.seasonSection.matchesLabel}
                      </span>
                      <span className="px-3 py-1 bg-parque-green/10 text-parque-green text-xs font-medium rounded-full">
                        {t.seasonSection.playoffsLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* ===== SEASON STRUCTURE SECTION ===== */}
          <div className="mb-20">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {t.structureSection.title}
              </h3>
            </div>
            
            {/* Mobile: compact side-by-side */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              {/* Regular Season - Compact */}
              <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-parque-purple to-parque-purple/80 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                  <Icons.Calendar className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {t.structureSection.regularSeason.title}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  {t.structureSection.regularSeason.description}
                </p>
                <ul className="space-y-1">
                  {t.structureSection.regularSeason.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Icons.Check className="w-3 h-3 text-parque-purple flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Playoffs - Compact */}
              <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-parque-green to-emerald-600 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                  <Icons.Trophy className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {t.structureSection.playoffs.title}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  {t.structureSection.playoffs.description}
                </p>
                <ul className="space-y-1">
                  {t.structureSection.playoffs.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Icons.Check className="w-3 h-3 text-parque-green flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Desktop: original layout */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-6 lg:gap-8">
              {/* Regular Season */}
              <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-parque-purple/10 to-transparent rounded-full blur-2xl" />
                
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-parque-purple to-parque-purple/80 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Icons.Calendar className="w-7 h-7 text-white" />
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {t.structureSection.regularSeason.title}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {t.structureSection.regularSeason.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {t.structureSection.regularSeason.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className="w-5 h-5 rounded-full bg-parque-purple/10 flex items-center justify-center flex-shrink-0">
                          <Icons.Check className="w-3 h-3 text-parque-purple" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Playoffs - Desktop */}
              <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-parque-green/10 to-transparent rounded-full blur-2xl" />
                
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-parque-green to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <Icons.Trophy className="w-7 h-7 text-white" />
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {t.structureSection.playoffs.title}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {t.structureSection.playoffs.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {t.structureSection.playoffs.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className="w-5 h-5 rounded-full bg-parque-green/10 flex items-center justify-center flex-shrink-0">
                          <Icons.Check className="w-3 h-3 text-parque-green" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
            </div>
          </div>
          
          {/* ===== SKILL LEVELS SECTION ===== */}
          <div className="mb-20">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {t.levelsSection.title}
              </h3>
              <p className="text-gray-600">{t.levelsSection.subtitle}</p>
            </div>
            
            {/* Mobile: horizontal scroll */}
            <div className="sm:hidden -mx-4 px-4">
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {skillLevels.map((level) => (
                  <div 
                    key={level.id}
                    className={`flex-shrink-0 w-[140px] snap-center ${level.bgColor} rounded-xl p-4 border-2 ${level.borderColor} text-center`}
                  >
                    <div className="text-4xl mb-2">{level.icon}</div>
                    <h4 className={`text-base font-bold ${level.textColor} mb-0.5`}>
                      {level.name[locale]}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">{level.description[locale]}</p>
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${level.color} text-white text-xs font-bold shadow-sm`}>
                      ELO {level.elo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop: grid */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-4 lg:gap-6">
              {skillLevels.map((level) => (
                <div 
                  key={level.id}
                  className={`relative ${level.bgColor} rounded-2xl p-6 border-2 ${level.borderColor} hover:shadow-xl transition-all duration-300 group overflow-hidden`}
                >
                  {/* Shimmer effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative text-center">
                    {/* Medal icon */}
                    <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                      {level.icon}
                    </div>
                    
                    <h4 className={`text-xl font-bold ${level.textColor} mb-1`}>
                      {level.name[locale]}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">{level.description[locale]}</p>
                    
                    {/* ELO Badge */}
                    <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${level.color} text-white text-sm font-bold shadow-md`}>
                      ELO {level.elo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* ===== ELO + SWISS SECTION ===== */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-parque-purple/5 via-white to-parque-green/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {t.eloSection.title}
            </h3>
            <p className="text-gray-600">{t.eloSection.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* ELO explanation */}
            <div className="space-y-6">
              <Link href={`/${locale}/elo`} className="block bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-parque-purple/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-parque-purple to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icons.ChartUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{t.eloSection.eloTitle}</h4>
                    <p className="text-gray-600 mb-3">{t.eloSection.eloDescription}</p>
                    <span className="inline-flex items-center gap-1 text-parque-purple font-medium text-sm group-hover:gap-2 transition-all">
                      {t.eloSection.eloLink}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
              
              <Link href={`/${locale}/swiss`} className="block bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-parque-green/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-parque-green to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icons.Shuffle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{t.eloSection.swissTitle}</h4>
                    <p className="text-gray-600 mb-3">{t.eloSection.swissDescription}</p>
                    <span className="inline-flex items-center gap-1 text-parque-green font-medium text-sm group-hover:gap-2 transition-all">
                      {t.eloSection.swissLink}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Benefits */}
            <div className="bg-gradient-to-br from-parque-purple to-violet-700 rounded-2xl p-8 text-white shadow-xl">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Icons.Zap className="w-6 h-6" />
                {locale === 'es' ? 'El Resultado' : 'The Result'}
              </h4>
              
              <ul className="space-y-4">
                {t.eloSection.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icons.Check className="w-4 h-4" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              {/* Visual ELO pairing demo */}
              <div className="mt-8 space-y-3">
                {/* Your ELO */}
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm opacity-80">{locale === 'es' ? 'Tu ELO' : 'Your ELO'}</span>
                    <span className="font-bold">1,285</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-[57%] bg-gradient-to-r from-yellow-400 to-parque-green rounded-full" />
                  </div>
                </div>
                
                {/* VS indicator */}
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                    VS
                  </span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>
                
                {/* Opponent ELO */}
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm opacity-80">{locale === 'es' ? 'Rival' : 'Opponent'}</span>
                    <span className="font-bold">1,262</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-[52%] bg-gradient-to-r from-yellow-400 to-parque-green rounded-full" />
                  </div>
                </div>
                
                {/* Match quality indicator */}
                <div className="text-center pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-white/20 px-3 py-1.5 rounded-full">
                    <svg className="w-3.5 h-3.5 text-parque-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {locale === 'es' ? 'Partido equilibrado' : 'Balanced match'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ===== OPENRANK SECTION ===== */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        {/* Background - Dark with subtle texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-parque-purple/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-parque-green/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-parque-purple/10 to-parque-green/10 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 border border-white/10">
              <Icons.Globe className="w-4 h-4 text-parque-green" />
              <span className="bg-gradient-to-r from-parque-green to-emerald-400 bg-clip-text text-transparent font-semibold">
                {locale === 'es' ? 'Ranking Global' : 'Global Ranking'}
              </span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t.openrankSection.title}
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t.openrankSection.description}
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {t.openrankSection.features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                {/* Glow on hover */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${idx === 0 ? 'bg-gradient-to-br from-parque-purple/20 to-transparent' : idx === 1 ? 'bg-gradient-to-br from-parque-green/20 to-transparent' : 'bg-gradient-to-br from-blue-500/20 to-transparent'}`} />
                
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${idx === 0 ? 'bg-gradient-to-br from-parque-purple to-violet-600' : idx === 1 ? 'bg-gradient-to-br from-parque-green to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'} shadow-lg`}>
                    {idx === 0 && <Icons.Award className="w-7 h-7 text-white" />}
                    {idx === 1 && <Icons.Globe className="w-7 h-7 text-white" />}
                    {idx === 2 && <Icons.ChartUp className="w-7 h-7 text-white" />}
                  </div>
                  
                  <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Live Ranking Preview */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-parque-green animate-pulse" />
                <span className="text-white font-semibold">
                  {locale === 'es' ? 'OpenRank en Vivo' : 'Live OpenRank'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {locale === 'es' ? 'Top jugadores' : 'Top players'}
              </span>
            </div>
            
            {/* Mock ranking rows */}
            <div className="divide-y divide-white/5">
              {[
                { rank: 1, name: 'Carlos M.', elo: 1487, city: 'Marbella', change: '+12' },
                { rank: 2, name: 'Roberto G.', elo: 1465, city: 'Sotogrande', change: '+8' },
                { rank: 3, name: 'Ana S.', elo: 1442, city: 'Estepona', change: '+15' },
              ].map((player, idx) => (
                <div key={idx} className="px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900' :
                    idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                    'bg-gradient-to-br from-orange-400 to-amber-600 text-white'
                  }`}>
                    {player.rank}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{player.name}</div>
                    <div className="text-xs text-gray-500">{player.city}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-bold tabular-nums">{player.elo}</div>
                    <div className="text-xs text-parque-green font-medium">{player.change}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View all link */}
            <div className="px-6 py-4 border-t border-white/10">
              <Link 
                href={`/${locale}/openrank`}
                className="flex items-center justify-center gap-2 text-parque-green font-medium hover:text-parque-green/80 transition-colors group"
              >
                {locale === 'es' ? 'Ver ranking completo' : 'View full ranking'}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
