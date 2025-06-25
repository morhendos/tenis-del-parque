'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [language, setLanguage] = useState('es')
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)

  // Detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0]
    const detectedLang = browserLang.toLowerCase().startsWith('es') ? 'es' : 'en'
    setLanguage(detectedLang)
  }, [])

  const content = {
    es: {
      nav: {
        home: 'Inicio',
        rules: 'Reglamento',
        about: 'Acerca de',
        contact: 'Contacto'
      },
      hero: {
        badge: 'Temporada de verano 2025',
        title: 'Compite. Mejora. Conecta.',
        tagline: 'La primera liga de tenis amateur en Sotogrande que combina competición seria con ambiente social.',
        cta: 'Únete a la Liga',
        stats: [
          { number: '8', label: 'Rondas por temporada' },
          { number: '3', label: 'Niveles de juego' },
          { number: '€0', label: 'Primera temporada' }
        ]
      },
      features: {
        title: '¿Por qué Tenis del Parque?',
        subtitle: 'Un sistema probado que funciona para jugadores amateur',
        items: [
          {
            title: 'Sistema Suizo',
            description: 'Juega contra oponentes de tu nivel. El sistema se ajusta automáticamente.',
            icon: 'swiss'
          },
          {
            title: 'Flexibilidad Total',
            description: 'Tú eliges cuándo jugar. Sistema de "wild cards" para máxima flexibilidad.',
            icon: 'calendar'
          },
          {
            title: 'Comunidad Local',
            description: 'Conoce a otros jugadores de Sotogrande. Eventos sociales incluidos.',
            icon: 'community'
          },
          {
            title: 'Rankings en Vivo',
            description: 'Sigue tu progreso con nuestro sistema de ranking Elo en tiempo real.',
            icon: 'ranking'
          }
        ]
      },
      howItWorks: {
        title: 'Cómo funciona',
        subtitle: 'Simple, flexible y diseñado para ti',
        steps: [
          {
            title: 'Inscríbete',
            description: 'Elige tu nivel: principiante, intermedio o avanzado. Gratis para la primera temporada.'
          },
          {
            title: 'Recibe tu emparejamiento',
            description: 'Cada domingo recibirás tu oponente para la semana. Contacta y acuerda el horario.'
          },
          {
            title: 'Juega tu partido',
            description: '2 sets + super tie-break si es necesario. Reserva la pista y divide los costos.'
          },
          {
            title: 'Reporta resultados',
            description: 'Sube los resultados en nuestra plataforma. Tu ranking se actualiza automáticamente.'
          }
        ]
      },
      levels: {
        title: 'Encuentra tu nivel',
        subtitle: 'Tres categorías para asegurar partidos equilibrados',
        categories: [
          {
            name: 'Principiante',
            elo: 'Elo 0-1199',
            description: 'Perfecto para jugadores casuales y aquellos retomando el tenis.'
          },
          {
            name: 'Intermedio',
            elo: 'Elo 0-1299',
            description: 'Para jugadores regulares con técnica sólida buscando mejorar.'
          },
          {
            name: 'Avanzado',
            elo: 'Elo 1150+',
            description: 'Jugadores experimentados buscando competición seria.'
          }
        ]
      },
      testimonials: {
        title: 'Lo que dicen nuestros jugadores',
        items: [
          {
            text: 'La flexibilidad es perfecta para mi agenda. Puedo jugar cuando me conviene.',
            author: 'Carlos M.',
            level: 'Nivel Intermedio'
          },
          {
            text: 'He conocido a grandes jugadores y amigos. Es más que solo tenis.',
            author: 'Ana S.',
            level: 'Nivel Principiante'
          },
          {
            text: 'El sistema de ranking me motiva a mejorar cada semana. ¡Excelente concepto!',
            author: 'James W.',
            level: 'Nivel Avanzado'
          }
        ]
      },
      faq: {
        title: 'Preguntas frecuentes',
        items: [
          {
            q: '¿Qué incluye la inscripción?',
            a: '8 rondas de competición, acceso a la plataforma, rankings en vivo, y eventos sociales de la liga. ¡La primera temporada es totalmente gratis!'
          },
          {
            q: '¿Quién paga las pistas?',
            a: 'Los jugadores dividen el costo de la pista 50/50. Puedes elegir cualquier club en Sotogrande.'
          },
          {
            q: '¿Qué pasa si no puedo jugar una semana?',
            a: 'Usa una de tus 4 "wild cards" para posponer el partido o sáltate la ronda.'
          },
          {
            q: '¿Hay playoffs?',
            a: 'Sí, los mejores 8 jugadores de cada categoría avanzan a los playoffs al final de la temporada.'
          }
        ]
      },
      signup: {
        title: 'Únete a la temporada inaugural',
        subtitle: 'Plazas limitadas para la temporada de verano 2025. Sé parte de algo especial desde el principio. ¡Primera temporada gratis!',
        form: {
          name: 'Nombre completo',
          email: 'Email',
          submit: 'Reservar mi plaza',
          submitting: 'Enviando...'
        },
        success: {
          title: '¡Bienvenido a la Liga!',
          message: 'Te contactaremos pronto con los detalles de inscripción.'
        }
      },
      footer: {
        copyright: '© 2025 Tenis del Parque - Sotogrande. Todos los derechos reservados.',
        links: {
          rules: 'Reglamento',
          privacy: 'Privacidad',
          terms: 'Términos',
          contact: 'Contacto'
        }
      }
    },
    en: {
      nav: {
        home: 'Home',
        rules: 'Rules',
        about: 'About',
        contact: 'Contact'
      },
      hero: {
        badge: 'Summer Season 2025',
        title: 'Compete. Improve. Connect.',
        tagline: 'The first amateur tennis league in Sotogrande combining serious competition with social atmosphere.',
        cta: 'Join the League',
        stats: [
          { number: '8', label: 'Rounds per season' },
          { number: '3', label: 'Playing levels' },
          { number: '€0', label: 'First season' }
        ]
      },
      features: {
        title: 'Why Tenis del Parque?',
        subtitle: 'A proven system that works for amateur players',
        items: [
          {
            title: 'Swiss System',
            description: 'Play against opponents at your level. The system adjusts automatically.',
            icon: 'swiss'
          },
          {
            title: 'Total Flexibility',
            description: 'You choose when to play. Wild card system for maximum flexibility.',
            icon: 'calendar'
          },
          {
            title: 'Local Community',
            description: 'Meet other Sotogrande players. Social events included.',
            icon: 'community'
          },
          {
            title: 'Live Rankings',
            description: 'Track your progress with our real-time Elo ranking system.',
            icon: 'ranking'
          }
        ]
      },
      howItWorks: {
        title: 'How it works',
        subtitle: 'Simple, flexible, and designed for you',
        steps: [
          {
            title: 'Sign up',
            description: 'Choose your level: beginner, intermediate, or advanced. Free for the first season.'
          },
          {
            title: 'Get matched',
            description: 'Every Sunday receive your opponent for the week. Contact and agree on time.'
          },
          {
            title: 'Play your match',
            description: '2 sets + super tie-break if needed. Book the court and split costs.'
          },
          {
            title: 'Report results',
            description: 'Upload results on our platform. Your ranking updates automatically.'
          }
        ]
      },
      levels: {
        title: 'Find your level',
        subtitle: 'Three categories to ensure balanced matches',
        categories: [
          {
            name: 'Beginner',
            elo: 'Elo 0-1199',
            description: 'Perfect for casual players and those getting back into tennis.'
          },
          {
            name: 'Intermediate',
            elo: 'Elo 0-1299',
            description: 'For regular players with solid technique looking to improve.'
          },
          {
            name: 'Advanced',
            elo: 'Elo 1150+',
            description: 'Experienced players seeking serious competition.'
          }
        ]
      },
      testimonials: {
        title: 'What our players say',
        items: [
          {
            text: 'The flexibility is perfect for my schedule. I can play when it suits me.',
            author: 'Carlos M.',
            level: 'Intermediate Level'
          },
          {
            text: "I've met great players and friends. It's more than just tennis.",
            author: 'Ana S.',
            level: 'Beginner Level'
          },
          {
            text: 'The ranking system motivates me to improve every week. Excellent concept!',
            author: 'James W.',
            level: 'Advanced Level'
          }
        ]
      },
      faq: {
        title: 'Frequently asked questions',
        items: [
          {
            q: "What's included in registration?",
            a: '8 rounds of competition, platform access, live rankings, and league social events. The first season is completely free!'
          },
          {
            q: 'Who pays for courts?',
            a: 'Players split court costs 50/50. You can choose any club in Sotogrande.'
          },
          {
            q: "What if I can't play one week?",
            a: 'Use one of your 4 wild cards to postpone the match or skip the round.'
          },
          {
            q: 'Are there playoffs?',
            a: 'Yes, the top 8 players in each category advance to playoffs at season end.'
          }
        ]
      },
      signup: {
        title: 'Join the inaugural season',
        subtitle: 'Limited spots for Summer 2025 season. Be part of something special from the beginning. First season free!',
        form: {
          name: 'Full name',
          email: 'Email',
          submit: 'Reserve my spot',
          submitting: 'Sending...'
        },
        success: {
          title: 'Welcome to the League!',
          message: "We'll contact you soon with registration details."
        }
      },
      footer: {
        copyright: '© 2025 Tenis del Parque - Sotogrande. All rights reserved.',
        links: {
          rules: 'Rules',
          privacy: 'Privacy',
          terms: 'Terms',
          contact: 'Contact'
        }
      }
    }
  }

  const t = content[language]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    setTimeout(() => {
      setFormData({ name: '', email: '' })
      setIsSubmitted(false)
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setIsLangMenuOpen(false)
  }

  return (
    <main className="min-h-screen bg-parque-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="block">
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
                <Link href="/" className="text-gray-700 hover:text-parque-purple transition-colors">{t.nav.home}</Link>
                <Link href="/rules" className="text-gray-700 hover:text-parque-purple transition-colors">{t.nav.rules}</Link>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-parque-purple transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="text-gray-700 font-medium">
                  {language === 'es' ? 'Español' : 'English'}
                </span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1">
                  <button
                    onClick={() => handleLanguageChange('es')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                      language === 'es' ? 'bg-parque-purple/5' : ''
                    }`}
                  >
                    <span className="text-2xl">🇪🇸</span>
                    <span className={`font-medium ${language === 'es' ? 'text-parque-purple' : 'text-gray-700'}`}>
                      Español
                    </span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                      language === 'en' ? 'bg-parque-purple/5' : ''
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
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/5 via-transparent to-parque-green/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <span className="inline-block bg-parque-purple/10 text-parque-purple px-4 py-2 rounded-full text-sm font-medium mb-6">
              {t.hero.badge}
            </span>
            
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <Image
                  src="/logo.png"
                  alt="Tenis del Parque"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-light text-parque-purple mb-6">
              {t.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              {t.hero.tagline}
            </p>
            
            <a href="#signup" className="inline-block bg-parque-purple text-white px-10 py-5 rounded-full text-lg font-medium hover:bg-parque-purple/90 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              {t.hero.cta}
            </a>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
              {t.hero.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-light text-parque-purple mb-2">{stat.number}</div>
                  <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-parque-purple mb-4">
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-600 font-light">{t.features.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {t.features.items.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-parque-purple/10 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon === 'swiss' && (
                    <svg className="w-8 h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  )}
                  {feature.icon === 'calendar' && (
                    <svg className="w-8 h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {feature.icon === 'community' && (
                    <svg className="w-8 h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                  {feature.icon === 'ranking' && (
                    <svg className="w-8 h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-medium text-parque-purple mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-parque-purple mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600 font-light">{t.howItWorks.subtitle}</p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {t.howItWorks.steps.map((step, index) => (
                <div key={index} className="flex gap-6">
                  <div className="w-12 h-12 bg-parque-purple text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-parque-purple mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-parque-green/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-parque-purple mb-4">
              {t.levels.title}
            </h2>
            <p className="text-xl text-gray-600 font-light">{t.levels.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.levels.categories.map((level, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <h3 className="text-2xl font-medium text-parque-purple mb-2">{level.name}</h3>
                <p className="text-parque-green font-medium mb-4">{level.elo}</p>
                <p className="text-gray-600">{level.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-light text-center text-parque-purple mb-16">
            {t.testimonials.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.testimonials.items.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="mb-6">
                  <svg className="w-10 h-10 text-parque-purple/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-medium text-parque-purple">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-white/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-light text-center text-parque-purple mb-16">
            {t.faq.title}
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {t.faq.items.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-medium text-parque-purple mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section id="signup" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-light text-center text-parque-purple mb-6">
              {t.signup.title}
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg font-light leading-relaxed">
              {t.signup.subtitle}
            </p>
            
            {isSubmitted ? (
              <div className="bg-parque-green/10 border-2 border-parque-green/30 rounded-2xl p-12 text-center">
                <svg className="w-20 h-20 text-parque-green mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-3xl font-light text-parque-purple mb-4">{t.signup.success.title}</h3>
                <p className="text-gray-600 text-lg font-light">{t.signup.success.message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-3">
                    {t.signup.form.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent outline-none transition-all text-lg"
                    placeholder={language === 'es' ? 'Juan García' : 'John Smith'}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-3">
                    {t.signup.form.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent outline-none transition-all text-lg"
                    placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-parque-purple text-white py-5 rounded-xl font-medium text-lg hover:bg-parque-purple/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  {isSubmitting ? t.signup.form.submitting : t.signup.form.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 font-light mb-4 md:mb-0">{t.footer.copyright}</p>
            <div className="flex space-x-6">
              <Link href="/rules" className="text-gray-600 hover:text-parque-purple transition-colors">
                {t.footer.links.rules}
              </Link>
              <Link href="#" className="text-gray-600 hover:text-parque-purple transition-colors">
                {t.footer.links.contact}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}