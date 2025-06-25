'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

function RulesPage() {
  const [language, setLanguage] = useState('es')

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
          items: [
            'La liga consta de 8 rondas utilizando el sistema suizo',
            'Una ronda por semana durante la temporada',
            'Los emparejamientos se realizan automáticamente según tu nivel y resultados',
            'Al final de la temporada, los mejores 8 jugadores avanzan a playoffs'
          ]
        },
        {
          title: 'Formato de Partidos',
          items: [
            'Cada partido consiste en 2 sets',
            'En caso de empate (1-1), se juega un super tie-break a 10 puntos',
            'Debes ganar por diferencia de 2 puntos',
            'Los jugadores pueden acordar jugar un 3er set completo si ambos lo prefieren'
          ]
        },
        {
          title: 'Categorías',
          items: [
            'Principiante: Elo 0-1199',
            'Intermedio: Elo 0-1299',
            'Avanzado: Elo 1150+',
            'Si hay pocos jugadores, las categorías pueden combinarse'
          ]
        },
        {
          title: 'Sistema de Puntos',
          items: [
            'Victoria 2-0: 3 puntos para el ganador',
            'Victoria 2-1: 2 puntos para el ganador, 1 punto para el perdedor',
            'La clasificación se basa en: puntos totales, fuerza de oponentes, y otros criterios',
            'El ranking Elo se actualiza después de cada partido'
          ]
        },
        {
          title: 'Programación de Partidos',
          items: [
            'Los emparejamientos se publican los domingos',
            'Tienes una semana para jugar tu partido',
            'Contacta a tu oponente lo antes posible para acordar fecha y hora',
            'Los jugadores reservan la pista y dividen el costo 50/50'
          ]
        },
        {
          title: 'Wild Cards y Flexibilidad',
          items: [
            'Cada jugador tiene 4 "wild cards" por temporada',
            'Usa una wild card para posponer un partido una semana',
            'Puedes saltarte una ronda usando el botón "Saltar ronda"',
            'Las wild cards no se transfieren a la siguiente temporada'
          ]
        },
        {
          title: 'Reglas de Conducta',
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
          items: [
            'Los mejores 8 jugadores de cada categoría clasifican',
            'Formato de eliminación directa',
            'Mismo formato de partido que la temporada regular',
            'En caso de disputa, el jugador mejor clasificado avanza'
          ]
        },
        {
          title: 'Walkover y Ausencias',
          items: [
            'Si tu oponente no se presenta, ganas 3-0',
            'Necesitas prueba de la ausencia (captura de pantalla)',
            'El jugador ausente debe pagar el costo total de la pista',
            'Las ausencias repetidas pueden resultar en exclusión'
          ]
        },
        {
          title: 'Costos',
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
          items: [
            'The league consists of 8 rounds using the Swiss system',
            'One round per week during the season',
            'Pairings are made automatically based on your level and results',
            'At season end, top 8 players advance to playoffs'
          ]
        },
        {
          title: 'Match Format',
          items: [
            'Each match consists of 2 sets',
            'In case of tie (1-1), a super tie-break to 10 points is played',
            'Must win by 2 points difference',
            'Players can agree to play a full 3rd set if both prefer'
          ]
        },
        {
          title: 'Categories',
          items: [
            'Beginner: Elo 0-1199',
            'Intermediate: Elo 0-1299',
            'Advanced: Elo 1150+',
            'Categories may be combined if player numbers are low'
          ]
        },
        {
          title: 'Point System',
          items: [
            '2-0 victory: 3 points for winner',
            '2-1 victory: 2 points for winner, 1 point for loser',
            'Ranking based on: total points, opponent strength, and other criteria',
            'Elo rating updates after each match'
          ]
        },
        {
          title: 'Match Scheduling',
          items: [
            'Pairings published on Sundays',
            'You have one week to play your match',
            'Contact your opponent as soon as possible to agree on date and time',
            'Players book the court and split costs 50/50'
          ]
        },
        {
          title: 'Wild Cards & Flexibility',
          items: [
            'Each player has 4 wild cards per season',
            'Use a wild card to postpone a match by one week',
            'You can skip a round using the "Skip round" button',
            'Wild cards do not transfer to next season'
          ]
        },
        {
          title: 'Code of Conduct',
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
          items: [
            'Top 8 players from each category qualify',
            'Single elimination format',
            'Same match format as regular season',
            'In case of dispute, higher-ranked player advances'
          ]
        },
        {
          title: 'Walkover & No-shows',
          items: [
            'If opponent doesn\'t show, you win 3-0',
            'Need proof of absence (screenshot)',
            'No-show player must pay full court cost',
            'Repeated absences may result in exclusion'
          ]
        },
        {
          title: 'Costs',
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
                <Link href="/rules" className="text-parque-purple font-medium">{t.nav.rules}</Link>
              </div>
            </div>
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="bg-parque-purple/10 px-4 py-2 rounded-full text-parque-purple font-medium hover:bg-parque-purple/20 transition-colors"
            >
              {language === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-parque-purple/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-light text-parque-purple mb-4">
              {t.hero.title}
            </h1>
            <p className="text-xl text-gray-600 font-light">
              {t.hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Rules Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {t.sections.map((section, index) => (
              <div key={index} className="mb-12">
                <h2 className="text-2xl md:text-3xl font-light text-parque-purple mb-6">
                  {section.title}
                </h2>
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
                  <ul className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-parque-green mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{item}</span>
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
      <section className="py-20 md:py-32 bg-gradient-to-br from-parque-purple/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light text-parque-purple mb-8">
              {t.cta.title}
            </h2>
            <Link
              href="/#signup"
              className="inline-block bg-parque-purple text-white px-10 py-5 rounded-full text-lg font-medium hover:bg-parque-purple/90 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              {t.cta.button}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 py-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p className="font-light">© 2025 Tenis del Parque - Sotogrande. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default RulesPage