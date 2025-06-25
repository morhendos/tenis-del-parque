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
  const [scrolled, setScrolled] = useState(false)

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
                <Link href="/rules" className="text-gray-700 hover:text-parque-purple transition-colors font-medium">{t.nav.rules}</Link>
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-parque-yellow/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="text-center max-w-5xl mx-auto">
            <span className="inline-block bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-6 py-3 rounded-full text-sm font-medium mb-8 animate-fadeInUp shadow-xl">
              {t.hero.badge}
            </span>
            
            {/* Logo */}
            <div className="mb-10 flex justify-center animate-fadeInUp animation-delay-200">
              <div className="relative w-64 h-64 md:w-80 md:h-80 transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="/logo.png"
                  alt="Tenis del Parque"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-purple/70 mb-8 animate-fadeInUp animation-delay-400">
              {t.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 font-light leading-relaxed animate-fadeInUp animation-delay-600">
              {t.hero.tagline}
            </p>
            
            <a href="#signup" className="inline-block bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-12 py-6 rounded-full text-lg font-medium hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fadeInUp animation-delay-800 group">
              {t.hero.cta}
              <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-24 max-w-3xl mx-auto animate-fadeInUp animation-delay-1000">
              {t.hero.stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                    <div className="text-4xl md:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-green mb-2 group-hover:scale-110 transition-transform">
                      {stat.number}
                    </div>
                    <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6">
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">{t.features.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {t.features.items.map((feature, index) => (
              <div key={index} className="group animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 h-full border border-gray-100 hover:border-parque-purple/20">
                  <div className="w-20 h-20 bg-gradient-to-br from-parque-purple/20 to-parque-purple/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {feature.icon === 'swiss' && (
                      <svg className="w-10 h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    )}
                    {feature.icon === 'calendar' && (
                      <svg className="w-10 h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {feature.icon === 'community' && (
                      <svg className="w-10 h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {feature.icon === 'ranking' && (
                      <svg className="w-10 h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-medium text-parque-purple mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6">
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">{t.howItWorks.subtitle}</p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {t.howItWorks.steps.map((step, index) => (
                <div key={index} className="flex gap-6 group animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
                  <div className="w-14 h-14 bg-gradient-to-br from-parque-purple to-parque-purple/80 text-white rounded-2xl flex items-center justify-center flex-shrink-0 font-medium text-xl shadow-lg group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-parque-purple mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parque-green/5 via-transparent to-parque-purple/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6">
              {t.levels.title}
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">{t.levels.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.levels.categories.map((level, index) => (
              <div key={index} className="group animate-fadeInUp" style={{animationDelay: `${index * 150}ms`}}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 text-center border border-gray-100 hover:border-parque-purple/20 h-full">
                  <div className="mb-6">
                    <h3 className="text-3xl font-light text-parque-purple mb-3">{level.name}</h3>
                    <p className="text-parque-green font-medium text-lg">{level.elo}</p>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-center text-parque-purple mb-20">
            {t.testimonials.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {t.testimonials.items.map((testimonial, index) => (
              <div key={index} className="group animate-fadeInUp" style={{animationDelay: `${index * 150}ms`}}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 h-full">
                  <div className="mb-8">
                    <svg className="w-12 h-12 text-parque-purple/20 group-hover:text-parque-purple/30 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-8 italic text-lg leading-relaxed">"{testimonial.text}"</p>
                  <div className="border-t border-gray-100 pt-6">
                    <p className="font-medium text-parque-purple text-lg">{testimonial.author}</p>
                    <p className="text-sm text-gray-500 mt-1">{testimonial.level}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white/70 to-transparent relative">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-center text-parque-purple mb-20">
            {t.faq.title}
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {t.faq.items.map((item, index) => (
              <div key={index} className="animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-lg font-medium text-parque-purple mb-3 flex items-start">
                    <span className="text-parque-green mr-3 text-2xl">•</span>
                    {item.q}
                  </h3>
                  <p className="text-gray-600 leading-relaxed ml-8">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section id="signup" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-96 h-96 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-center text-parque-purple mb-8">
              {t.signup.title}
            </h2>
            <p className="text-center text-gray-600 mb-16 text-lg font-light leading-relaxed">
              {t.signup.subtitle}
            </p>
            
            {isSubmitted ? (
              <div className="bg-gradient-to-br from-parque-green/20 to-parque-green/10 border-2 border-parque-green/30 rounded-3xl p-16 text-center animate-fadeIn">
                <svg className="w-24 h-24 text-parque-green mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-3xl font-light text-parque-purple mb-4">{t.signup.success.title}</h3>
                <p className="text-gray-600 text-lg font-light">{t.signup.success.message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="group">
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
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-parque-purple/20 focus:border-parque-purple outline-none transition-all text-lg bg-white/80 backdrop-blur-sm"
                    placeholder={language === 'es' ? 'Juan García' : 'John Smith'}
                  />
                </div>
                <div className="group">
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
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-parque-purple/20 focus:border-parque-purple outline-none transition-all text-lg bg-white/80 backdrop-blur-sm"
                    placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white py-5 rounded-2xl font-medium text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.signup.form.submitting}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {t.signup.form.submit}
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 font-light mb-4 md:mb-0">{t.footer.copyright}</p>
            <div className="flex space-x-8">
              <Link href="/rules" className="text-gray-600 hover:text-parque-purple transition-colors font-medium">
                {t.footer.links.rules}
              </Link>
              <Link href="#" className="text-gray-600 hover:text-parque-purple transition-colors font-medium">
                {t.footer.links.contact}
              </Link>
            </div>
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