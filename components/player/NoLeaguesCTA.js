'use client'

import Link from 'next/link'
import { MapPin, Trophy, Users, ArrowRight, Star } from 'lucide-react'

/**
 * Component shown to players who have an account but haven&apos;t joined any league yet
 */
export default function NoLeaguesCTA({ playerName, language, locale }) {
  const content = {
    es: {
      greeting: `¡Hola ${playerName}!`,
      title: 'Únete a una Liga',
      subtitle: 'Tu cuenta está lista. Ahora es momento de encontrar una liga en tu ciudad y empezar a competir.',
      ctaButton: 'Ver Ligas Disponibles',
      features: [
        {
          icon: MapPin,
          title: 'Ligas Locales',
          description: 'Encuentra ligas cerca de ti en la Costa del Sol'
        },
        {
          icon: Trophy,
          title: 'Sistema de Ranking',
          description: 'Compite y sube en el ranking ELO'
        },
        {
          icon: Users,
          title: 'Niveles para Todos',
          description: 'Bronce, Plata y Oro según tu experiencia'
        }
      ],
      howItWorks: {
        title: '¿Cómo funciona?',
        steps: [
          'Elige una liga en tu ciudad',
          'Selecciona tu nivel de juego',
          'Recibe tu calendario de partidos',
          '¡Juega y sube en el ranking!'
        ]
      }
    },
    en: {
      greeting: `Hi ${playerName}!`,
      title: 'Join a League',
      subtitle: 'Your account is ready. Now find a league in your city and start competing.',
      ctaButton: 'View Available Leagues',
      features: [
        {
          icon: MapPin,
          title: 'Local Leagues',
          description: 'Find leagues near you on the Costa del Sol'
        },
        {
          icon: Trophy,
          title: 'Ranking System',
          description: 'Compete and climb the ELO rankings'
        },
        {
          icon: Users,
          title: 'Levels for Everyone',
          description: 'Bronze, Silver and Gold based on your experience'
        }
      ],
      howItWorks: {
        title: 'How does it work?',
        steps: [
          'Choose a league in your city',
          'Select your playing level',
          'Receive your match schedule',
          'Play and climb the rankings!'
        ]
      }
    }
  }

  const c = content[language] || content.es

  return (
    <div className="animate-fade-in-up">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎾</span>
          <span className="text-lg font-medium opacity-90">{c.greeting}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{c.title}</h1>
        <p className="text-purple-100 text-sm sm:text-base mb-6">{c.subtitle}</p>
        
        <Link
          href={`/${locale}/leagues`}
          className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-6 py-3 rounded-xl hover:bg-purple-50 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          {c.ctaButton}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {c.features.map((feature, idx) => (
          <div 
            key={idx}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <feature.icon className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          {c.howItWorks.title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {c.howItWorks.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                {idx + 1}
              </div>
              <p className="text-sm text-gray-700 pt-1">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
