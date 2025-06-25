'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

function RulesPage() {
  const [language, setLanguage] = useState('es')
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

  // Detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0]
    const detectedLang = browserLang.toLowerCase().startsWith('es') ? 'es' : 'en'
    setLanguage(detectedLang)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      
      // Update active section based on scroll position
      const sections = document.querySelectorAll('.rule-section')
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 200 && rect.bottom >= 200) {
          setActiveSection(index)
        }
      })
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const content = {
    es: {
      nav: {
        home: 'Inicio',
        rules: 'Reglamento'
      },
      hero: {
        title: 'Reglamento Oficial',
        subtitle: 'Todo lo que necesitas saber para participar en Tenis del Parque'
      },
      sections: [
        {
          title: 'Formato de la Liga',
          icon: 'format',
          items: [
            'La liga consta de 8 rondas utilizando el sistema suizo',
            'Una ronda por semana durante la temporada',
            'Los emparejamientos se realizan automáticamente según tu nivel y resultados',
            'Al final de la temporada, los mejores 8 jugadores avanzan a playoffs'
          ]
        },
        {
          title: 'Formato de Partidos',
          icon: 'match',
          items: [
            'Cada partido consiste en 2 sets',
            'En caso de empate (1-1), se juega un super tie-break a 10 puntos',
            'Debes ganar por diferencia de 2 puntos',
            'Los jugadores pueden acordar jugar un 3er set completo si ambos lo prefieren'
          ]
        },
        {
          title: 'Categorías',
          icon: 'categories',
          items: [
            'Principiante: Elo 0-1199',
            'Intermedio: Elo 1200-1299',
            'Avanzado: Elo 1300+',
            'Si hay pocos jugadores, las categorías pueden combinarse'
          ]
        },
        {
          title: 'Sistema de Puntos',
          icon: 'points',
          items: [
            'Victoria 2-0: 3 puntos para el ganador',
            'Victoria 2-1: 2 puntos para el ganador, 1 punto para el perdedor',
            'La clasificación se basa en: puntos totales, fuerza de oponentes, y otros criterios',
            'El ranking Elo se actualiza después de cada partido'
          ]
        },
        {
          title: 'Programación de Partidos',
          icon: 'schedule',
          items: [
            'Los emparejamientos se publican los domingos',
            'Tienes una semana para jugar tu partido',
            'Contacta a tu oponente lo antes posible para acordar fecha y hora',
            'Los jugadores reservan la pista y dividen el costo 50/50'
          ]
        },
        {
          title: 'Wild Cards y Flexibilidad',
          icon: 'flexibility',
          items: [
            'Cada jugador tiene 4 "wild cards" por temporada',
            'Usa una wild card para posponer un partido una semana',
            'Puedes saltarte una ronda usando el botón "Saltar ronda"',
            'Las wild cards no se transfieren a la siguiente temporada'
          ]
        },
        {
          title: 'Reglas de Conducta',
          icon: 'conduct',
          items: [
            'Respeto mutuo entre todos los jugadores',
            'Puntualidad en los partidos programados',
            'Cancelaciones con mínimo 12 horas de anticipación',
            'División justa de costos de pista',
            'Reporte honesto de resultados'
          ]
        },
        {
          title: 'Playoffs',
          icon: 'playoffs',
          items: [
            'Los mejores 8 jugadores de cada categoría clasifican',
            'Formato de eliminación directa',
            'Mismo formato de partido que la temporada regular',
            'En caso de disputa, el jugador mejor clasificado avanza'
          ]
        },
        {
          title: 'Walkover y Ausencias',
          icon: 'walkover',
          items: [
            'Si tu oponente no se presenta, ganas 3-0',
            'Necesitas prueba de la ausencia (captura de pantalla)',
            'El jugador ausente debe pagar el costo total de la pista',
            'Las ausencias repetidas pueden resultar en exclusión'
          ]
        },
        {
          title: 'Costos',
          icon: 'costs',
          items: [
            'Inscripción: €0 para la primera temporada (normalmente €79)',
            'Incluye: 8 rondas, acceso a plataforma, rankings, eventos sociales',
            'Costos de pista NO incluidos - pago directo al club',
            'Sin reembolsos después del inicio de la temporada'
          ]
        }
      ],
      cta: {
        title: '¿Listo para competir?',
        button: 'Inscríbete ahora'
      }
    },
    en: {
      nav: {
        home: 'Home',
        rules: 'Rules'
      },
      hero: {
        title: 'Official Rules',
        subtitle: 'Everything you need to know to participate in Tenis del Parque'
      },
      sections: [
        {
          title: 'League Format',
          icon: 'format',
          items: [
            'The league consists of 8 rounds using the Swiss system',
            'One round per week during the season',
            'Pairings are made automatically based on your level and results',
            'At season end, top 8 players advance to playoffs'
          ]
        },
        {
          title: 'Match Format',
          icon: 'match',
          items: [
            'Each match consists of 2 sets',
            'In case of tie (1-1), a super tie-break to 10 points is played',
            'Must win by 2 points difference',
            'Players can agree to play a full 3rd set if both prefer'
          ]
        },
        {
          title: 'Categories',
          icon: 'categories',
          items: [
            'Beginner: Elo 0-1199',
            'Intermediate: Elo 1200-1299',
            'Advanced: Elo 1300+',
            'Categories may be combined if player numbers are low'
          ]
        },
        {
          title: 'Point System',
          icon: 'points',
          items: [
            '2-0 victory: 3 points for winner',
            '2-1 victory: 2 points for winner, 1 point for loser',
            'Ranking based on: total points, opponent strength, and other criteria',
            'Elo rating updates after each match'
          ]
        },
        {
          title: 'Match Scheduling',
          icon: 'schedule',
          items: [
            'Pairings published on Sundays',
            'You have one week to play your match',
            'Contact your opponent as soon as possible to agree on date and time',
            'Players book the court and split costs 50/50'
          ]
        },
        {
          title: 'Wild Cards & Flexibility',
          icon: 'flexibility',
          items: [
            'Each player has 4 wild cards per season',
            'Use a wild card to postpone a match by one week',
            'You can skip a round using the "Skip round" button',
            'Wild cards do not transfer to next season'
          ]
        },
        {
          title: 'Code of Conduct',
          icon: 'conduct',
          items: [
            'Mutual respect among all players',
            'Punctuality for scheduled matches',
            'Cancellations with minimum 12 hours notice',
            'Fair splitting of court costs',
            'Honest reporting of results'
          ]
        },
        {
          title: 'Playoffs',
          icon: 'playoffs',
          items: [
            'Top 8 players from each category qualify',
            'Single elimination format',
            'Same match format as regular season',
            'In case of dispute, higher-ranked player advances'
          ]
        },
        {
          title: 'Walkover & No-shows',
          icon: 'walkover',
          items: [
            'If opponent doesn\'t show, you win 3-0',
            'Need proof of absence (screenshot)',
            'No-show player must pay full court cost',
            'Repeated absences may result in exclusion'
          ]
        },
        {
          title: 'Costs',
          icon: 'costs',
          items: [
            'Registration: €0 for first season (normally €79)',
            'Includes: 8 rounds, platform access, rankings, social events',
            'Court costs NOT included - paid directly to club',
            'No refunds after season start'
          ]
        }
      ],
      cta: {
        title: 'Ready to compete?',
        button: 'Sign up now'
      }
    }
  }

  const t = content[language]

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setIsLangMenuOpen(false)
  }

  const getIcon = (iconName) => {
    const icons = {
      format: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      match: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      categories: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      points: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      schedule: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      flexibility: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      conduct: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      playoffs: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      walkover: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      costs: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return icons[iconName] || null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full backdrop-blur-md z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-lg' : 'bg-white/70'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="block transform hover:scale-105 transition-transform">
                <div className="relative h-10 w-40">
                  <Image
                    src="/logo-horizontal-02.png"
                    alt="Tenis del Parque"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-parque-purple transition-colors font-medium">{t.nav.home}</Link>
                <Link href="/rules" className="text-parque-purple font-medium">{t.nav.rules}</Link>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-xl hover:border-parque-purple hover:shadow-md transition-all duration-300"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="text-gray-700 font-medium">
                  {language === 'es' ? 'Español' : 'English'}
                </span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 py-1 animate-fadeIn">
                  <button
                    onClick={() => handleLanguageChange('es')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                      language === 'es' ? 'bg-parque-purple/10' : ''
                    }`}
                  >
                    <span className="text-2xl">🇪🇸</span>
                    <span className={`font-medium ${language === 'es' ? 'text-parque-purple' : 'text-gray-700'}`}>
                      Español
                    </span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                      language === 'en' ? 'bg-parque-purple/10' : ''
                    }`}
                  >
                    <span className="text-2xl">🇬🇧</span>
                    <span className={`font-medium ${language === 'en' ? 'text-parque-purple' : 'text-gray-700'}`}>
                      English
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Click outside to close language menu */}
      {isLangMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsLangMenuOpen(false)}
        />
      )}

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-72 h-72 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-purple/70 mb-6 animate-fadeInUp">
              {t.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light animate-fadeInUp animation-delay-200">
              {t.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Navigation sidebar */}
      <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4">
          {t.sections.map((section, index) => (
            <button
              key={index}
              onClick={() => {
                const element = document.querySelectorAll('.rule-section')[index]
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              className={`block w-full p-3 rounded-xl mb-2 transition-all duration-300 ${
                activeSection === index 
                  ? 'bg-parque-purple text-white' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={section.title}
            >
              {getIcon(section.icon)}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Content */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {t.sections.map((section, index) => (
              <div 
                key={index} 
                className="rule-section mb-16 animate-fadeInUp"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-parque-purple to-parque-purple/80 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg">
                    {getIcon(section.icon)}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light text-parque-purple">
                    {section.title}
                  </h2>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  <ul className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start group">
                        <svg className="w-6 h-6 text-parque-green mt-0.5 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700 leading-relaxed text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light text-parque-purple mb-10">
              {t.cta.title}
            </h2>
            <Link
              href="/#signup"
              className="inline-block bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-12 py-6 rounded-full text-lg font-medium hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
            >
              {t.cta.button}
              <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p className="font-light">© 2025 Tenis del Parque - Sotogrande. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
          animation-fill-mode: both;
        }
        
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        
        .delay-1000 { animation-delay: 1000ms; }
        .delay-2000 { animation-delay: 2000ms; }
      `}</style>
    </main>
  )
}

export default RulesPage