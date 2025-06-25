'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function EloPage() {
  const [language, setLanguage] = useState('es')
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('what')

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
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const content = {
    es: {
      nav: {
        home: 'Inicio',
        rules: 'Reglamento',
        elo: 'Sistema ELO',
        about: 'Acerca de',
        contact: 'Contacto'
      },
      hero: {
        title: 'El Sistema ELO',
        subtitle: 'Compitiendo de forma justa e inteligente'
      },
      sections: [
        {
          id: 'what',
          title: '¿Qué son los puntos ELO?',
          content: [
            {
              type: 'text',
              text: 'El sistema ELO es un método matemático para calcular los niveles de habilidad relativos de los jugadores en juegos competitivos. Cada jugador tiene una puntuación numérica que representa su nivel de habilidad actual.'
            },
            {
              type: 'cards',
              cards: [
                {
                  title: 'Dinámico',
                  description: 'Tu puntuación cambia después de cada partido',
                  icon: 'dynamic'
                },
                {
                  title: 'Justo',
                  description: 'Considera la fuerza de tu oponente',
                  icon: 'fair'
                },
                {
                  title: 'Preciso',
                  description: 'Refleja tu nivel real de juego',
                  icon: 'accurate'
                }
              ]
            },
            {
              type: 'text',
              text: 'A diferencia de los sistemas de puntos tradicionales donde ganas los mismos puntos por cada victoria, el sistema ELO considera la calidad de tu oponente. Vencer a un jugador más fuerte te da más puntos que vencer a uno más débil.'
            }
          ]
        },
        {
          id: 'history',
          title: 'Historia y origen',
          content: [
            {
              type: 'text',
              text: 'El sistema ELO fue creado por Arpad Elo, un profesor de física húngaro-estadounidense, originalmente para clasificar jugadores de ajedrez. La Federación Mundial de Ajedrez (FIDE) lo adoptó en 1970.'
            },
            {
              type: 'timeline',
              events: [
                {
                  year: '1960',
                  title: 'Creación',
                  description: 'Arpad Elo desarrolla el sistema'
                },
                {
                  year: '1970',
                  title: 'Ajedrez',
                  description: 'FIDE adopta el sistema oficialmente'
                },
                {
                  year: '2000s',
                  title: 'Expansión',
                  description: 'Se extiende a videojuegos y otros deportes'
                },
                {
                  year: '2025',
                  title: 'Tenis del Parque',
                  description: 'Lo implementamos en nuestra liga'
                }
              ]
            },
            {
              type: 'text',
              text: 'Desde entonces, el sistema se ha adaptado para muchos deportes y juegos competitivos, incluyendo tenis, fútbol, videojuegos, y ahora nuestra liga de tenis amateur.'
            }
          ]
        },
        {
          id: 'why',
          title: '¿Por qué usamos ELO?',
          content: [
            {
              type: 'text',
              text: 'Elegimos el sistema ELO para nuestra liga porque queremos que cada partido sea emocionante y justo. Los sistemas tradicionales de liga pueden crear emparejamientos desequilibrados.'
            },
            {
              type: 'comparison',
              title: 'Comparación con otros sistemas',
              items: [
                {
                  system: 'Sistema tradicional',
                  pros: ['Simple de entender', 'Familiar'],
                  cons: ['Partidos desequilibrados', 'No considera la fuerza del oponente', 'Puede desmotivar']
                },
                {
                  system: 'Sistema ELO',
                  pros: ['Emparejamientos justos', 'Motivación constante', 'Refleja el progreso real', 'Usado mundialmente'],
                  cons: ['Requiere explicación inicial']
                }
              ]
            }
          ]
        },
        {
          id: 'perfect',
          title: '¿Por qué es perfecto para nosotros?',
          content: [
            {
              type: 'features',
              features: [
                {
                  title: 'Liga amateur con diferentes niveles',
                  description: 'Tenemos jugadores desde principiantes hasta avanzados. El ELO asegura que todos tengan partidos competitivos.',
                  icon: 'levels'
                },
                {
                  title: 'Sistema suizo flexible',
                  description: 'Nuestro formato suizo se beneficia del ELO para crear emparejamientos óptimos cada ronda.',
                  icon: 'swiss'
                },
                {
                  title: 'Motivación continua',
                  description: 'Siempre hay algo por lo que jugar. Incluso si no puedes ganar la liga, puedes mejorar tu ELO.',
                  icon: 'motivation'
                },
                {
                  title: 'Progreso visible',
                  description: 'Los jugadores pueden ver su mejora a lo largo del tiempo, no solo en una temporada.',
                  icon: 'progress'
                }
              ]
            },
            {
              type: 'text',
              text: 'En Tenis del Parque, comenzarás con un ELO base según tu nivel declarado: Principiante (1000), Intermedio (1200), o Avanzado (1300). Después de cada partido, tu ELO se ajustará basándose en el resultado y la fuerza de tu oponente.'
            }
          ]
        },
        {
          id: 'howItWorks',
          title: 'Cómo funciona en nuestra liga',
          content: [
            {
              type: 'text',
              text: 'Aquí está cómo calculamos los cambios de ELO después de cada partido:'
            },
            {
              type: 'example',
              title: 'Ejemplo práctico',
              scenario: {
                player1: { name: 'Ana', elo: 1250 },
                player2: { name: 'Carlos', elo: 1150 },
                result: 'Ana gana 6-3, 6-4'
              },
              calculation: [
                'Ana tiene 100 puntos más de ELO',
                'El sistema espera que Ana gane ~64% de las veces',
                'Ana gana: +12 puntos (1262)',
                'Carlos pierde: -12 puntos (1138)',
                'Si Carlos hubiera ganado: +20/-20 puntos'
              ]
            },
            {
              type: 'formula',
              title: 'Factor K',
              description: 'Usamos un factor K de 32 para permitir cambios significativos pero no drásticos. Esto significa que el máximo que puedes ganar o perder en un partido es 32 puntos.'
            }
          ]
        }
      ],
      cta: {
        title: '¿Listo para competir?',
        subtitle: 'Únete a la liga y comienza a construir tu ranking ELO',
        button: 'Inscríbete ahora',
        link: '/#signup'
      }
    },
    en: {
      nav: {
        home: 'Home',
        rules: 'Rules',
        elo: 'ELO System',
        about: 'About',
        contact: 'Contact'
      },
      hero: {
        title: 'The ELO System',
        subtitle: 'Competing fairly and intelligently'
      },
      sections: [
        {
          id: 'what',
          title: 'What are ELO points?',
          content: [
            {
              type: 'text',
              text: 'The ELO system is a mathematical method for calculating the relative skill levels of players in competitive games. Each player has a numerical rating that represents their current skill level.'
            },
            {
              type: 'cards',
              cards: [
                {
                  title: 'Dynamic',
                  description: 'Your rating changes after every match',
                  icon: 'dynamic'
                },
                {
                  title: 'Fair',
                  description: 'Considers your opponent\'s strength',
                  icon: 'fair'
                },
                {
                  title: 'Accurate',
                  description: 'Reflects your true playing level',
                  icon: 'accurate'
                }
              ]
            },
            {
              type: 'text',
              text: 'Unlike traditional point systems where you earn the same points for each win, the ELO system considers the quality of your opponent. Beating a stronger player gives you more points than beating a weaker one.'
            }
          ]
        },
        {
          id: 'history',
          title: 'History and origin',
          content: [
            {
              type: 'text',
              text: 'The ELO system was created by Arpad Elo, a Hungarian-American physics professor, originally to rank chess players. The World Chess Federation (FIDE) adopted it in 1970.'
            },
            {
              type: 'timeline',
              events: [
                {
                  year: '1960',
                  title: 'Creation',
                  description: 'Arpad Elo develops the system'
                },
                {
                  year: '1970',
                  title: 'Chess',
                  description: 'FIDE officially adopts the system'
                },
                {
                  year: '2000s',
                  title: 'Expansion',
                  description: 'Extends to video games and other sports'
                },
                {
                  year: '2025',
                  title: 'Tenis del Parque',
                  description: 'We implement it in our league'
                }
              ]
            },
            {
              type: 'text',
              text: 'Since then, the system has been adapted for many sports and competitive games, including tennis, football, video games, and now our amateur tennis league.'
            }
          ]
        },
        {
          id: 'why',
          title: 'Why do we use ELO?',
          content: [
            {
              type: 'text',
              text: 'We chose the ELO system for our league because we want every match to be exciting and fair. Traditional league systems can create unbalanced matchups.'
            },
            {
              type: 'comparison',
              title: 'Comparison with other systems',
              items: [
                {
                  system: 'Traditional system',
                  pros: ['Simple to understand', 'Familiar'],
                  cons: ['Unbalanced matches', 'Doesn\'t consider opponent strength', 'Can be demotivating']
                },
                {
                  system: 'ELO system',
                  pros: ['Fair matchups', 'Constant motivation', 'Reflects real progress', 'Used worldwide'],
                  cons: ['Requires initial explanation']
                }
              ]
            }
          ]
        },
        {
          id: 'perfect',
          title: 'Why is it perfect for us?',
          content: [
            {
              type: 'features',
              features: [
                {
                  title: 'Amateur league with different levels',
                  description: 'We have players from beginners to advanced. ELO ensures everyone has competitive matches.',
                  icon: 'levels'
                },
                {
                  title: 'Flexible Swiss system',
                  description: 'Our Swiss format benefits from ELO to create optimal pairings each round.',
                  icon: 'swiss'
                },
                {
                  title: 'Continuous motivation',
                  description: 'There\'s always something to play for. Even if you can\'t win the league, you can improve your ELO.',
                  icon: 'motivation'
                },
                {
                  title: 'Visible progress',
                  description: 'Players can see their improvement over time, not just in one season.',
                  icon: 'progress'
                }
              ]
            },
            {
              type: 'text',
              text: 'At Tenis del Parque, you\'ll start with a base ELO according to your declared level: Beginner (1000), Intermediate (1200), or Advanced (1300). After each match, your ELO will adjust based on the result and your opponent\'s strength.'
            }
          ]
        },
        {
          id: 'howItWorks',
          title: 'How it works in our league',
          content: [
            {
              type: 'text',
              text: 'Here\'s how we calculate ELO changes after each match:'
            },
            {
              type: 'example',
              title: 'Practical example',
              scenario: {
                player1: { name: 'Ana', elo: 1250 },
                player2: { name: 'Carlos', elo: 1150 },
                result: 'Ana wins 6-3, 6-4'
              },
              calculation: [
                'Ana has 100 more ELO points',
                'The system expects Ana to win ~64% of the time',
                'Ana wins: +12 points (1262)',
                'Carlos loses: -12 points (1138)',
                'If Carlos had won: +20/-20 points'
              ]
            },
            {
              type: 'formula',
              title: 'K Factor',
              description: 'We use a K factor of 32 to allow significant but not drastic changes. This means the maximum you can win or lose in a match is 32 points.'
            }
          ]
        }
      ],
      cta: {
        title: 'Ready to compete?',
        subtitle: 'Join the league and start building your ELO ranking',
        button: 'Sign up now',
        link: '/#signup'
      }
    }
  }

  const t = content[language]

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setIsLangMenuOpen(false)
  }

  const renderContent = (contentItems) => {
    return contentItems.map((item, index) => {
      switch (item.type) {
        case 'text':
          return (
            <p key={index} className="text-gray-600 leading-relaxed mb-6 text-lg">
              {item.text}
            </p>
          )
        
        case 'cards':
          return (
            <div key={index} className="grid md:grid-cols-3 gap-6 my-12">
              {item.cards.map((card, cardIndex) => (
                <div key={cardIndex} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-parque-purple/20 to-parque-purple/10 rounded-2xl flex items-center justify-center mb-6">
                    {card.icon === 'dynamic' && (
                      <svg className="w-8 h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {card.icon === 'fair' && (
                      <svg className="w-8 h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    )}
                    {card.icon === 'accurate' && (
                      <svg className="w-8 h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <h4 className="text-xl font-medium text-parque-purple mb-3">{card.title}</h4>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              ))}
            </div>
          )
        
        case 'timeline':
          return (
            <div key={index} className="my-12">
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-parque-purple/20 via-parque-purple/40 to-parque-purple/20"></div>
                {item.events.map((event, eventIndex) => (
                  <div key={eventIndex} className={`relative flex items-center mb-12 ${eventIndex % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`w-5/12 ${eventIndex % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <span className="text-3xl font-light text-parque-purple">{event.year}</span>
                        <h4 className="text-xl font-medium text-gray-800 mt-2 mb-2">{event.title}</h4>
                        <p className="text-gray-600">{event.description}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-parque-purple rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          )
        
        case 'comparison':
          return (
            <div key={index} className="my-12">
              <h4 className="text-2xl font-light text-center text-parque-purple mb-8">{item.title}</h4>
              <div className="grid md:grid-cols-2 gap-8">
                {item.items.map((system, sysIndex) => (
                  <div key={sysIndex} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h5 className="text-xl font-medium text-gray-800 mb-6">{system.system}</h5>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-2">Ventajas:</p>
                        <ul className="space-y-2">
                          {system.pros.map((pro, proIndex) => (
                            <li key={proIndex} className="flex items-start">
                              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-600">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {system.cons.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600 mb-2">Desventajas:</p>
                          <ul className="space-y-2">
                            {system.cons.map((con, conIndex) => (
                              <li key={conIndex} className="flex items-start">
                                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-gray-600">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        
        case 'features':
          return (
            <div key={index} className="grid md:grid-cols-2 gap-8 my-12">
              {item.features.map((feature, featIndex) => (
                <div key={featIndex} className="bg-gradient-to-br from-parque-purple/5 to-parque-green/5 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-parque-purple/10">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-parque-purple/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      {feature.icon === 'levels' && (
                        <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                      {feature.icon === 'swiss' && (
                        <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      )}
                      {feature.icon === 'motivation' && (
                        <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      {feature.icon === 'progress' && (
                        <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-medium text-parque-purple mb-3">{feature.title}</h4>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        
        case 'example':
          return (
            <div key={index} className="my-12 bg-gradient-to-br from-parque-purple/5 to-transparent rounded-3xl p-8 shadow-lg">
              <h4 className="text-2xl font-light text-parque-purple mb-6">{item.title}</h4>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white/90 rounded-2xl p-6">
                  <h5 className="text-lg font-medium text-gray-800 mb-4">{language === 'es' ? 'Antes del partido' : 'Before the match'}</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.scenario.player1.name}</span>
                      <span className="text-2xl font-light text-parque-purple">{item.scenario.player1.elo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.scenario.player2.name}</span>
                      <span className="text-2xl font-light text-parque-purple">{item.scenario.player2.elo}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 rounded-2xl p-6">
                  <h5 className="text-lg font-medium text-gray-800 mb-4">{language === 'es' ? 'Resultado' : 'Result'}</h5>
                  <p className="text-lg text-gray-700">{item.scenario.result}</p>
                </div>
              </div>
              <div className="bg-white/90 rounded-2xl p-6">
                <h5 className="text-lg font-medium text-gray-800 mb-4">{language === 'es' ? 'Cálculo' : 'Calculation'}</h5>
                <ul className="space-y-2">
                  {item.calculation.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start">
                      <span className="text-parque-green mr-2">→</span>
                      <span className="text-gray-600">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        
        case 'formula':
          return (
            <div key={index} className="my-12 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h4 className="text-xl font-medium text-parque-purple mb-4">{item.title}</h4>
              <p className="text-gray-600">{item.description}</p>
            </div>
          )
        
        default:
          return null
      }
    })
  }

  return (
    <main>
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
                <Link href="/rules" className="text-gray-700 hover:text-parque-purple transition-colors font-medium">{t.nav.rules}</Link>
                <Link href="/elo" className="text-parque-purple font-medium border-b-2 border-parque-purple">{t.nav.elo}</Link>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-purple/70 mb-6 animate-fadeInUp">
              {t.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-light animate-fadeInUp animation-delay-200">
              {t.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {t.sections.map((section, sectionIndex) => (
              <div key={section.id} className="mb-24 last:mb-0 animate-fadeInUp" style={{animationDelay: `${sectionIndex * 100}ms`}}>
                <h2 className="text-3xl md:text-4xl font-light text-parque-purple mb-10">
                  {section.title}
                </h2>
                {renderContent(section.content)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-white/70 to-transparent">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-96 h-96 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light text-parque-purple mb-6">
              {t.cta.title}
            </h2>
            <p className="text-xl text-gray-600 mb-12 font-light">
              {t.cta.subtitle}
            </p>
            <Link 
              href={t.cta.link}
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
      <footer className="bg-white/80 backdrop-blur-sm py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 font-light mb-4 md:mb-0">© 2025 Tenis del Parque - Sotogrande. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
            <div className="flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-parque-purple transition-colors font-medium">
                {t.nav.home}
              </Link>
              <Link href="/rules" className="text-gray-600 hover:text-parque-purple transition-colors font-medium">
                {t.nav.rules}
              </Link>
              <Link href="/#contact" className="text-gray-600 hover:text-parque-purple transition-colors font-medium">
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}