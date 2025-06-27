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
  const [activePreview, setActivePreview] = useState(0)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [hoveredPlayer, setHoveredPlayer] = useState(null)
  const [selectedMatch, setSelectedMatch] = useState(null)

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
            description: 'Sigue tu progreso con nuestro sistema de ranking Elo en tiempo real. <a href="/elo" class="text-parque-purple underline hover:text-parque-purple/80">Aprende más sobre ELO</a>',
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
            elo: 'Elo 1200-1299',
            description: 'Para jugadores regulares con técnica sólida buscando mejorar.'
          },
          {
            name: 'Avanzado',
            elo: 'Elo 1300+',
            description: 'Jugadores experimentados buscando competición seria.'
          }
        ]
      },
      platformPreview: {
        title: 'Descubre la Plataforma',
        subtitle: 'Todo lo que necesitas en un solo lugar',
        tabs: [
          { name: 'Clasificación', id: 'standings' },
          { name: 'Rankings', id: 'rankings' },
          { name: 'Resultados', id: 'results' },
          { name: 'Próximos', id: 'upcoming' },
          { name: 'Estadísticas', id: 'statistics' },
          { name: 'Bracket', id: 'bracket' }
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
        elo: 'ELO System',
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
            description: 'Track your progress with our real-time Elo ranking system. <a href="/elo" class="text-parque-purple underline hover:text-parque-purple/80">Learn more about ELO</a>',
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
            elo: 'Elo 1200-1299',
            description: 'For regular players with solid technique looking to improve.'
          },
          {
            name: 'Advanced',
            elo: 'Elo 1300+',
            description: 'Experienced players seeking serious competition.'
          }
        ]
      },
      platformPreview: {
        title: 'Discover the Platform',
        subtitle: 'Everything you need in one place',
        tabs: [
          { name: 'Standings', id: 'standings' },
          { name: 'Rankings', id: 'rankings' },
          { name: 'Results', id: 'results' },
          { name: 'Upcoming', id: 'upcoming' },
          { name: 'Statistics', id: 'statistics' },
          { name: 'Bracket', id: 'bracket' }
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

  const handleTabChange = (index) => {
    setIsLoadingPreview(true)
    setTimeout(() => {
      setActivePreview(index)
      setIsLoadingPreview(false)
    }, 300)
  }

  // Enhanced mock data with more player details
  const mockData = {
    standings: [
      { position: 1, name: 'Rafael M.', points: 21, played: 7, wins: 7, losses: 0, sets: '14-2', winRate: '100%', avgGamesWon: 6.2, form: 'WWWWW' },
      { position: 2, name: 'Carlos S.', points: 18, played: 7, wins: 6, losses: 1, sets: '12-4', winRate: '86%', avgGamesWon: 5.8, form: 'WWWLW' },
      { position: 3, name: 'Ana G.', points: 15, played: 7, wins: 5, losses: 2, sets: '11-6', winRate: '71%', avgGamesWon: 5.5, form: 'WLWWL' },
      { position: 4, name: 'James W.', points: 12, played: 7, wins: 4, losses: 3, sets: '9-8', winRate: '57%', avgGamesWon: 5.2, form: 'LWLWW' },
      { position: 5, name: 'María L.', points: 9, played: 7, wins: 3, losses: 4, sets: '8-9', winRate: '43%', avgGamesWon: 4.8, form: 'WLLWL' },
      { position: 6, name: 'David K.', points: 6, played: 7, wins: 2, losses: 5, sets: '5-11', winRate: '29%', avgGamesWon: 4.5, form: 'LLLWL' },
      { position: 7, name: 'Sophie B.', points: 3, played: 7, wins: 1, losses: 6, sets: '3-12', winRate: '14%', avgGamesWon: 4.2, form: 'LLLLL' },
      { position: 8, name: 'Tom H.', points: 0, played: 7, wins: 0, losses: 7, sets: '2-14', winRate: '0%', avgGamesWon: 3.8, form: 'LLLLL' }
    ],
    rankings: [
      { position: 1, name: 'Rafael M.', elo: 1487, trend: 'up', change: '+23', peakElo: 1487, matches: 45, titles: 3 },
      { position: 2, name: 'Carlos S.', elo: 1452, trend: 'up', change: '+15', peakElo: 1465, matches: 42, titles: 2 },
      { position: 3, name: 'Ana G.', elo: 1398, trend: 'down', change: '-8', peakElo: 1420, matches: 38, titles: 1 },
      { position: 4, name: 'James W.', elo: 1345, trend: 'up', change: '+12', peakElo: 1345, matches: 40, titles: 1 },
      { position: 5, name: 'María L.', elo: 1289, trend: 'same', change: '0', peakElo: 1310, matches: 35, titles: 0 },
      { position: 6, name: 'David K.', elo: 1234, trend: 'down', change: '-18', peakElo: 1280, matches: 33, titles: 0 },
      { position: 7, name: 'Sophie B.', elo: 1198, trend: 'up', change: '+5', peakElo: 1220, matches: 30, titles: 0 },
      { position: 8, name: 'Tom H.', elo: 1145, trend: 'down', change: '-22', peakElo: 1200, matches: 28, titles: 0 }
    ],
    results: [
      { id: 1, player1: 'Rafael M.', player2: 'Carlos S.', score: '6-4, 7-5', date: '22 Jun', court: 'Club Sotogrande', duration: '1h 45m', aces: { p1: 8, p2: 6 }, winners: { p1: 24, p2: 18 } },
      { id: 2, player1: 'Ana G.', player2: 'María L.', score: '6-3, 2-6, 10-8', date: '21 Jun', court: 'La Reserva', duration: '2h 10m', aces: { p1: 4, p2: 5 }, winners: { p1: 20, p2: 22 } },
      { id: 3, player1: 'James W.', player2: 'David K.', score: '6-2, 6-3', date: '20 Jun', court: 'Real Club Valderrama', duration: '1h 15m', aces: { p1: 10, p2: 3 }, winners: { p1: 28, p2: 15 } },
      { id: 4, player1: 'Sophie B.', player2: 'Tom H.', score: '4-6, 6-4, 10-7', date: '19 Jun', court: 'Club Sotogrande', duration: '2h 30m', aces: { p1: 2, p2: 3 }, winners: { p1: 18, p2: 16 } }
    ],
    upcoming: [
      { player1: 'Rafael M.', player2: 'Ana G.', round: 8, deadline: '29 Jun', headToHead: '2-0', lastMeeting: '15 May' },
      { player1: 'Carlos S.', player2: 'James W.', round: 8, deadline: '29 Jun', headToHead: '1-1', lastMeeting: '8 Jun' },
      { player1: 'María L.', player2: 'David K.', round: 8, deadline: '29 Jun', headToHead: '3-2', lastMeeting: '1 Jun' },
      { player1: 'Sophie B.', player2: 'Tom H.', round: 8, deadline: '29 Jun', headToHead: '0-1', lastMeeting: '25 May' }
    ],
    statistics: {
      topAces: [
        { name: 'James W.', total: 68 },
        { name: 'Rafael M.', total: 56 },
        { name: 'Carlos S.', total: 48 }
      ],
      longestMatches: [
        { players: 'Sophie B. vs Tom H.', duration: '2h 30m' },
        { players: 'Ana G. vs María L.', duration: '2h 10m' },
        { players: 'Rafael M. vs Carlos S.', duration: '1h 45m' }
      ],
      winStreaks: [
        { name: 'Rafael M.', streak: 7 },
        { name: 'Carlos S.', streak: 4 },
        { name: 'James W.', streak: 2 }
      ]
    },
    bracket: [
      { round: 'Cuartos', matches: [
        { p1: 'Rafael M.', p2: 'Tom H.', winner: 'Rafael M.' },
        { p1: 'Carlos S.', p2: 'Sophie B.', winner: 'Carlos S.' },
        { p1: 'Ana G.', p2: 'David K.', winner: 'Ana G.' },
        { p1: 'James W.', p2: 'María L.', winner: 'James W.' }
      ]},
      { round: 'Semifinales', matches: [
        { p1: 'Rafael M.', p2: 'James W.', winner: 'Rafael M.' },
        { p1: 'Carlos S.', p2: 'Ana G.', winner: 'Carlos S.' }
      ]},
      { round: 'Final', matches: [
        { p1: 'Rafael M.', p2: 'Carlos S.', winner: null }
      ]}
    ]
  }

  // Player card component
  const PlayerCard = ({ player }) => {
    if (!hoveredPlayer || hoveredPlayer !== player) return null
    
    const playerStats = mockData.rankings.find(p => p.name === player) || {}
    const standingStats = mockData.standings.find(p => p.name === player) || {}
    
    return (
      <div className="absolute z-20 top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl p-6 w-80 animate-fadeIn border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-800">{player}</h4>
          <span className="text-sm bg-parque-purple/10 text-parque-purple px-3 py-1 rounded-full">
            Elo: {playerStats.elo || 'N/A'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">{language === 'es' ? 'Partidos' : 'Matches'}</p>
            <p className="font-medium text-gray-800">{playerStats.matches || 0}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">{language === 'es' ? 'Títulos' : 'Titles'}</p>
            <p className="font-medium text-gray-800">{playerStats.titles || 0}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">{language === 'es' ? 'Tasa de victoria' : 'Win Rate'}</p>
            <p className="font-medium text-gray-800">{standingStats.winRate || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">{language === 'es' ? 'Forma' : 'Form'}</p>
            <div className="flex space-x-1">
              {(standingStats.form || '').split('').slice(-5).map((result, i) => (
                <span key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  result === 'W' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {result}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {language === 'es' ? 'Elo máximo:' : 'Peak Elo:'} {playerStats.peakElo || 'N/A'}
          </p>
        </div>
      </div>
    )
  }

  // Enhanced renderPreviewContent function
  const renderPreviewContent = () => {
    const previews = ['standings', 'rankings', 'results', 'upcoming', 'statistics', 'bracket']
    const currentPreview = previews[activePreview]

    if (isLoadingPreview) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-parque-purple/20 border-t-parque-purple rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
          </div>
        </div>
      )
    }

    switch(currentPreview) {
      case 'standings':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-2 text-sm font-medium text-gray-600">Pos</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">{language === 'es' ? 'Jugador' : 'Player'}</th>
                  <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Pts</th>
                  <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">PJ</th>
                  <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">G</th>
                  <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">P</th>
                  <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Sets</th>
                  <th className="text-center py-4 px-2 text-sm font-medium text-gray-600 hidden md:table-cell">%</th>
                </tr>
              </thead>
              <tbody>
                {mockData.standings.map((player, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 group">
                    <td className="py-4 px-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transform group-hover:scale-110 transition-transform ${
                        player.position <= 3 ? 'bg-gradient-to-br from-parque-yellow to-parque-yellow/70 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {player.position}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-800 relative">
                      <span 
                        className="cursor-pointer hover:text-parque-purple transition-colors"
                        onMouseEnter={() => setHoveredPlayer(player.name)}
                        onMouseLeave={() => setHoveredPlayer(null)}
                      >
                        {player.name}
                      </span>
                      <PlayerCard player={player.name} />
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="font-semibold text-parque-purple bg-parque-purple/10 px-2 py-1 rounded-lg">
                        {player.points}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center text-gray-600">{player.played}</td>
                    <td className="py-4 px-2 text-center">
                      <span className="text-green-600 font-medium">{player.wins}</span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="text-red-600 font-medium">{player.losses}</span>
                    </td>
                    <td className="py-4 px-2 text-center text-gray-600">{player.sets}</td>
                    <td className="py-4 px-2 text-center text-gray-600 hidden md:table-cell">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-parque-green to-parque-green/70 rounded-full transition-all duration-1000"
                            style={{ width: player.winRate }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs">{player.winRate}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      
      case 'rankings':
        return (
          <div className="space-y-3">
            {mockData.rankings.map((player, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-medium transform transition-all duration-300 ${
                      player.position <= 3 
                        ? 'bg-gradient-to-br from-parque-purple to-parque-purple/70 text-white shadow-lg scale-110' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {player.position}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-lg cursor-pointer hover:text-parque-purple transition-colors relative"
                          onMouseEnter={() => setHoveredPlayer(player.name)}
                          onMouseLeave={() => setHoveredPlayer(null)}>
                        {player.name}
                        <PlayerCard player={player.name} />
                      </h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-sm text-gray-500">Elo: <span className="font-medium text-gray-700">{player.elo}</span></p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-400">{language === 'es' ? 'Máx:' : 'Peak:'} {player.peakElo}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`text-lg font-medium flex items-center space-x-1 ${
                        player.trend === 'up' ? 'text-green-600' : player.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        <span>{player.change}</span>
                        {player.trend === 'up' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        )}
                        {player.trend === 'down' && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{player.matches} {language === 'es' ? 'partidos' : 'matches'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'results':
        return (
          <div className="space-y-4">
            {mockData.results.map((match, index) => (
              <div key={index} 
                   className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group"
                   onClick={() => setSelectedMatch(match)}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{match.date}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{match.duration}</span>
                  </div>
                  <span className="text-sm text-parque-purple font-medium flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{match.court}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-lg mb-1">{match.player1}</p>
                    <p className="text-gray-600">{match.player2}</p>
                  </div>
                  <div className="px-8 py-4 bg-gradient-to-br from-parque-purple/10 to-parque-purple/5 rounded-2xl border border-parque-purple/20 group-hover:from-parque-purple/20 group-hover:to-parque-purple/10 transition-all">
                    <p className="font-semibold text-parque-purple text-center text-lg">{match.score}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>{language === 'es' ? 'Aces:' : 'Aces:'} {match.aces.p1} - {match.aces.p2}</span>
                  <span>{language === 'es' ? 'Winners:' : 'Winners:'} {match.winners.p1} - {match.winners.p2}</span>
                </div>
              </div>
            ))}
          </div>
        )

      case 'upcoming':
        return (
          <div className="space-y-4">
            {mockData.upcoming.map((match, index) => (
              <div key={index} className="bg-gradient-to-r from-parque-purple/5 to-parque-green/5 rounded-2xl p-6 border border-parque-purple/20 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] hover:border-parque-purple/40">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-parque-purple bg-parque-purple/10 px-3 py-1 rounded-full">
                    {language === 'es' ? 'Ronda' : 'Round'} {match.round}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{language === 'es' ? 'Fecha límite:' : 'Deadline:'} {match.deadline}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <p className="font-medium text-gray-800 text-lg mb-1">{match.player1}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="bg-gray-100 px-2 py-1 rounded">H2H: {match.headToHead}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-light text-gray-400">vs</span>
                    <span className="text-xs text-gray-400 mt-2">{language === 'es' ? 'Último:' : 'Last:'} {match.lastMeeting}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-800 text-lg mb-1">{match.player2}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      <button className="bg-parque-purple/10 text-parque-purple px-3 py-1 rounded-full hover:bg-parque-purple/20 transition-colors">
                        {language === 'es' ? 'Contactar' : 'Contact'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'statistics':
        return (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Top Aces */}
            <div className="bg-gradient-to-br from-parque-purple/5 to-transparent rounded-2xl p-6 border border-parque-purple/10">
              <h4 className="text-lg font-medium text-parque-purple mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{language === 'es' ? 'Más Aces' : 'Top Aces'}</span>
              </h4>
              <div className="space-y-3">
                {mockData.statistics.topAces.map((player, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{player.name}</span>
                    </div>
                    <span className="text-2xl font-light text-parque-purple">{player.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Longest Matches */}
            <div className="bg-gradient-to-br from-parque-green/5 to-transparent rounded-2xl p-6 border border-parque-green/10">
              <h4 className="text-lg font-medium text-parque-green mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{language === 'es' ? 'Partidos más largos' : 'Longest Matches'}</span>
              </h4>
              <div className="space-y-3">
                {mockData.statistics.longestMatches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{match.players}</span>
                    <span className="font-medium text-parque-green">{match.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Win Streaks */}
            <div className="bg-gradient-to-br from-parque-yellow/5 to-transparent rounded-2xl p-6 border border-parque-yellow/10">
              <h4 className="text-lg font-medium text-parque-yellow mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>{language === 'es' ? 'Rachas de victorias' : 'Win Streaks'}</span>
              </h4>
              <div className="space-y-3">
                {mockData.statistics.winStreaks.map((player, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{player.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(Math.min(player.streak, 5))].map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        ))}
                      </div>
                      <span className="text-lg font-medium text-yellow-600">{player.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'bracket':
        return (
          <div className="overflow-x-auto">
            <div className="min-w-[800px] p-4">
              <div className="flex justify-between items-start">
                {mockData.bracket.map((round, roundIndex) => (
                  <div key={roundIndex} className="flex-1">
                    <h4 className="text-center font-medium text-parque-purple mb-6">{round.round}</h4>
                    <div className={`space-y-${8 - roundIndex * 2}`}>
                      {round.matches.map((match, matchIndex) => (
                        <div key={matchIndex} className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-parque-purple/50 transition-all duration-300 transform hover:scale-105">
                          <div className="space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded ${match.winner === match.p1 ? 'bg-green-50 font-medium' : ''}`}>
                              <span className={match.winner === match.p1 ? 'text-green-700' : 'text-gray-600'}>{match.p1}</span>
                              {match.winner === match.p1 && <span className="text-green-600">✓</span>}
                            </div>
                            <div className="border-t border-gray-100"></div>
                            <div className={`flex items-center justify-between p-2 rounded ${match.winner === match.p2 ? 'bg-green-50 font-medium' : ''}`}>
                              <span className={match.winner === match.p2 ? 'text-green-700' : 'text-gray-600'}>{match.p2}</span>
                              {match.winner === match.p2 && <span className="text-green-600">✓</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
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
                <Link href="/elo" className="text-gray-700 hover:text-parque-purple transition-colors font-medium">{t.nav.elo}</Link>
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
        
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="text-center max-w-5xl mx-auto">
            <span className="inline-block bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-8 py-4 rounded-full text-sm font-medium mb-8 animate-fadeInUp shadow-xl">
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
            
            {/* Stats - Fixed spacing */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-24 max-w-4xl mx-auto animate-fadeInUp animation-delay-1000">
              {t.hero.stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                    <div className="text-3xl md:text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-green mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                      {stat.number}
                    </div>
                    <div className="text-xs md:text-sm lg:text-base text-gray-600 font-medium">{stat.label}</div>
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

      {/* Features Section - Fixed spacing */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6 md:mb-8">
              {t.features.title}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto">{t.features.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {t.features.items.map((feature, index) => (
              <div key={index} className="group animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 h-full border border-gray-100 hover:border-parque-purple/20">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-parque-purple/20 to-parque-purple/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {feature.icon === 'swiss' && (
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    )}
                    {feature.icon === 'calendar' && (
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {feature.icon === 'community' && (
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {feature.icon === 'ranking' && (
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-parque-purple mb-3 md:mb-4">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: feature.description }} />
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

      {/* Platform Preview Section */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-white/70 to-transparent">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-parque-yellow/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-parque-purple/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6">
              {t.platformPreview.title}
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">{t.platformPreview.subtitle}</p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center mb-12 gap-3">
              {t.platformPreview.tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(index)}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform ${
                    activePreview === index
                      ? 'bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white shadow-lg scale-105'
                      : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md hover:scale-105'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Preview Content */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 animate-fadeIn min-h-[500px]">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-light text-parque-purple">
                  {t.platformPreview.tabs[activePreview].name}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500">{language === 'es' ? 'En vivo' : 'Live'}</span>
                </div>
              </div>
              
              {renderPreviewContent()}
            </div>
          </div>
        </div>

        {/* Match Details Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedMatch(null)}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full animate-scaleIn" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-light text-parque-purple">{language === 'es' ? 'Detalles del partido' : 'Match Details'}</h3>
                <button 
                  onClick={() => setSelectedMatch(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl">
                  <div className="text-center">
                    <p className="text-2xl font-medium text-gray-800 mb-2">{selectedMatch.player1}</p>
                    <p className="text-4xl font-light text-parque-purple">{selectedMatch.aces.p1}</p>
                    <p className="text-sm text-gray-500 mt-1">Aces</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-light text-gray-400 mb-2">vs</p>
                    <p className="text-2xl font-medium text-parque-purple">{selectedMatch.score}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-medium text-gray-800 mb-2">{selectedMatch.player2}</p>
                    <p className="text-4xl font-light text-parque-purple">{selectedMatch.aces.p2}</p>
                    <p className="text-sm text-gray-500 mt-1">Aces</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-parque-purple/5 rounded-xl p-4">
                    <p className="text-2xl font-light text-parque-purple">{selectedMatch.winners.p1}</p>
                    <p className="text-sm text-gray-600">Winners</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-lg font-medium text-gray-800">{selectedMatch.duration}</p>
                    <p className="text-sm text-gray-600">{language === 'es' ? 'Duración' : 'Duration'}</p>
                  </div>
                  <div className="bg-parque-purple/5 rounded-xl p-4">
                    <p className="text-2xl font-light text-parque-purple">{selectedMatch.winners.p2}</p>
                    <p className="text-sm text-gray-600">Winners</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <span>{selectedMatch.date}</span>
                  <span>{selectedMatch.court}</span>
                </div>
              </div>
            </div>
          </div>
        )}
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
              <Link href="/elo" className="text-gray-600 hover:text-parque-purple transition-colors font-medium">
                {t.nav.elo}
              </Link>
              <Link href="#" className="text-gray-600 hover:text-parque-purple transition-colors font-medium">
                {t.footer.links.contact}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}