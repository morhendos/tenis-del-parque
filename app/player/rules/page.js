'use client'

import { useLanguage } from '../../../lib/hooks/useLanguage'

export default function PlayerRules() {
  const { language } = useLanguage()
  
  const content = {
    es: {
      title: "📋 Reglas de la Liga",
      subtitle: "Todo lo que necesitas saber para participar",
      sections: [
        {
          icon: "🏆",
          title: "Sistema de Puntuación",
          items: [
            "Victoria 2-0: 3 puntos",
            "Victoria 2-1: 2 puntos", 
            "Derrota 1-2: 1 punto",
            "Derrota 0-2: 0 puntos"
          ]
        },
        {
          icon: "📅",
          title: "Calendario de Partidos",
          items: [
            "Nuevos emparejamientos cada domingo por la noche",
            "Tienes toda la semana para completar tu partido, incluyendo el domingo hasta las 23:00",
            "Contacta a tu oponente cuando puedas para coordinar",
            "Acuerden lugar, fecha y hora juntos"
          ]
        },
        {
          icon: "🎾",
          title: "Formato de Partidos",
          items: [
            "Se juegan 2 sets, si queda 1-1 se juega super tie-break",
            "Los jugadores pueden acordar jugar un tercer set en lugar del super tie-break",
            "Tie-break normal si hay 6-6 en un set",
            "Super tie-break a 10 puntos si hay 1-1 en sets"
          ]
        },
        {
          icon: "🏅",
          title: "Clasificación y Playoffs",
          items: [
            "Posiciones 1-8: Clasifican a Playoff A (por el título)",
            "Posiciones 9-16: Clasifican a Playoff B",
            "Posiciones 17+: Eliminados de playoffs",
            "Ranking ELO se actualiza después de cada partido"
          ]
        },
        {
          icon: "📱",
          title: "Coordinación de Partidos",
          items: [
            "Habla con tu oponente para acordar lugar y hora",
            "Agrega los detalles del partido al sistema",
            "Comparte el costo de la cancha 50/50 con tu oponente",
            "Reporta el resultado en la plataforma después del partido"
          ]
        },
        {
          icon: "⚡",
          title: "Reglas Especiales",
          items: [
            "Puntualidad: 15 minutos de tolerancia máxima",
            "Walkover: Si el oponente no aparece, ganas 2-0",
            "Lesión: El partido se suspende, se reprograma",
            "Disputa de resultado: Contacta al administrador"
          ]
        },
        {
          icon: "🤝",
          title: "Fair Play",
          items: [
            "Respeta a tu oponente en todo momento",
            "Acepta las decisiones del contrario de buena fe",
            "Reporta cualquier problema al administrador"
          ]
        }
      ]
    },
    en: {
      title: "📋 League Rules",
      subtitle: "Everything you need to know to participate",
      sections: [
        {
          icon: "🏆",
          title: "Scoring System",
          items: [
            "2-0 Win: 3 points",
            "2-1 Win: 2 points",
            "1-2 Loss: 1 point", 
            "0-2 Loss: 0 points"
          ]
        },
        {
          icon: "📅",
          title: "Match Schedule",
          items: [
            "New pairings every Sunday evening",
            "You have all week to complete your match, including Sunday until 23:00",
            "Contact your opponent when you can to coordinate",
            "Agree on place, date and time together"
          ]
        },
        {
          icon: "🎾",
          title: "Match Format",
          items: [
            "Play 2 sets, if tied 1-1 then play super tie-break",
            "Players can agree to play a third set instead of super tie-break",
            "Regular tie-break if 6-6 in a set",
            "Super tie-break to 10 points if 1-1 in sets"
          ]
        },
        {
          icon: "🏅",
          title: "Standings and Playoffs",
          items: [
            "Positions 1-8: Qualify for Playoff A (championship)",
            "Positions 9-16: Qualify for Playoff B",
            "Positions 17+: Eliminated from playoffs",
            "ELO ranking updates after each match"
          ]
        },
        {
          icon: "📱",
          title: "Match Coordination",
          items: [
            "Talk with your opponent to agree on place and time",
            "Add match details to the system",
            "Share court costs 50/50 with your opponent",
            "Report the result on the platform after the match"
          ]
        },
        {
          icon: "⚡",
          title: "Special Rules",
          items: [
            "Punctuality: 15 minutes maximum tolerance",
            "Walkover: If opponent doesn't show, you win 2-0",
            "Injury: Match suspended, rescheduled",
            "Result dispute: Contact administrator"
          ]
        },
        {
          icon: "🤝",
          title: "Fair Play",
          items: [
            "Respect your opponent at all times",
            "Accept opponent's decisions in good faith",
            "Report any issues to the administrator"
          ]
        }
      ]
    }
  }
  
  const currentContent = content[language]
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-parque-purple to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{currentContent.title}</h1>
            <p className="text-xl text-purple-100">{currentContent.subtitle}</p>
          </div>
        </div>
      </div>
      
      {/* Rules Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {currentContent.sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">{section.icon}</div>
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-parque-purple rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'es' ? '¿Preguntas?' : 'Questions?'}
          </h3>
          <p className="text-gray-600 mb-6">
            {language === 'es' 
              ? 'Si tienes alguna duda sobre las reglas, no dudes en contactarnos.'
              : 'If you have any questions about the rules, don\'t hesitate to contact us.'}
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="mailto:morhendos@gmail.com" 
              className="bg-parque-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              {language === 'es' ? 'Enviar Email' : 'Send Email'}
            </a>
            <a 
              href="https://wa.me/34652714328" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              {language === 'es' ? 'WhatsApp' : 'WhatsApp'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 