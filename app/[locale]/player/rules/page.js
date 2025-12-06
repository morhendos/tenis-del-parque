'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function PlayerRules() {
  const params = useParams()
  const locale = params.locale || 'es'
  
  const content = {
    es: {
      title: 'Reglas de la Liga',
      subtitle: 'Todo lo que necesitas saber para participar',
      sections: [
        {
          title: 'Sistema de Puntuación',
          icon: 'trophy',
          scoring: [
            { result: 'Victoria 2-0', points: '3 puntos', type: 'win' },
            { result: 'Victoria 2-1', points: '2 puntos', type: 'win' },
            { result: 'Walkover (victoria sin jugar)', points: '2 puntos', type: 'walkover' },
            { result: 'Derrota 1-2', points: '1 punto', type: 'loss' },
            { result: 'Derrota 0-2', points: '0 puntos', type: 'loss' }
          ]
        },
        {
          title: 'Calendario de Partidos',
          icon: 'calendar',
          items: [
            'Nuevos emparejamientos cada domingo por la noche',
            'Tienes toda la semana para completar tu partido, incluyendo el domingo hasta las 23:00',
            'Contacta a tu oponente cuando puedas para coordinar',
            'Acuerden lugar, fecha y hora juntos'
          ]
        },
        {
          title: 'Formato de Partidos',
          icon: 'tennis',
          items: [
            'Se juegan 2 sets, si queda 1-1 se juega super tie-break',
            'Los jugadores pueden acordar jugar un tercer set en lugar del super tie-break',
            'Tie-break normal si hay 6-6 en un set',
            'Super tie-break a 10 puntos si hay 1-1 en sets'
          ]
        },
        {
          title: 'Clasificación y Playoffs',
          icon: 'medal',
          items: [
            'Posiciones 1-8: Clasifican a Playoff A (por el título)',
            'Posiciones 9-16: Clasifican a Playoff B',
            'Posiciones 17+: Eliminados de playoffs',
            'Ranking ELO se actualiza después de cada partido'
          ]
        },
        {
          title: 'Coordinación de Partidos',
          icon: 'chat',
          items: [
            'Habla con tu oponente para acordar lugar y hora',
            'Agrega los detalles del partido al sistema',
            'Comparte el costo de la cancha 50/50 con tu oponente',
            'Reporta el resultado en la plataforma después del partido'
          ]
        },
        {
          title: 'Reglas Especiales',
          icon: 'lightning',
          items: [
            'Puntualidad: 15 minutos de tolerancia máxima',
            'Walkover: Si el oponente no aparece, ganas 2-0',
            'Lesión: El partido se suspende, se reprograma',
            'Disputa de resultado: Contacta al administrador'
          ]
        },
        {
          title: 'Fair Play',
          icon: 'handshake',
          items: [
            'Respeta a tu oponente en todo momento',
            'Acepta las decisiones del contrario de buena fe',
            'Reporta cualquier problema al administrador'
          ]
        }
      ],
      questions: '¿Preguntas?',
      questionsDesc: 'Si tienes alguna duda sobre las reglas, no dudes en contactarnos.',
      sendEmail: 'Enviar Email',
      backToDashboard: 'Volver al Dashboard'
    },
    en: {
      title: 'League Rules',
      subtitle: 'Everything you need to know to participate',
      sections: [
        {
          title: 'Scoring System',
          icon: 'trophy',
          scoring: [
            { result: '2-0 Win', points: '3 points', type: 'win' },
            { result: '2-1 Win', points: '2 points', type: 'win' },
            { result: 'Walkover (win without playing)', points: '2 points', type: 'walkover' },
            { result: '1-2 Loss', points: '1 point', type: 'loss' },
            { result: '0-2 Loss', points: '0 points', type: 'loss' }
          ]
        },
        {
          title: 'Match Schedule',
          icon: 'calendar',
          items: [
            'New pairings every Sunday evening',
            'You have all week to complete your match, including Sunday until 23:00',
            'Contact your opponent when you can to coordinate',
            'Agree on place, date and time together'
          ]
        },
        {
          title: 'Match Format',
          icon: 'tennis',
          items: [
            'Play 2 sets, if tied 1-1 then play super tie-break',
            'Players can agree to play a third set instead of super tie-break',
            'Regular tie-break if 6-6 in a set',
            'Super tie-break to 10 points if 1-1 in sets'
          ]
        },
        {
          title: 'Standings and Playoffs',
          icon: 'medal',
          items: [
            'Positions 1-8: Qualify for Playoff A (championship)',
            'Positions 9-16: Qualify for Playoff B',
            'Positions 17+: Eliminated from playoffs',
            'ELO ranking updates after each match'
          ]
        },
        {
          title: 'Match Coordination',
          icon: 'chat',
          items: [
            'Talk with your opponent to agree on place and time',
            'Add match details to the system',
            'Share court costs 50/50 with your opponent',
            'Report the result on the platform after the match'
          ]
        },
        {
          title: 'Special Rules',
          icon: 'lightning',
          items: [
            'Punctuality: 15 minutes maximum tolerance',
            'Walkover: If opponent doesn\'t show, you win 2-0',
            'Injury: Match suspended, rescheduled',
            'Result dispute: Contact administrator'
          ]
        },
        {
          title: 'Fair Play',
          icon: 'handshake',
          items: [
            'Respect your opponent at all times',
            'Accept opponent\'s decisions in good faith',
            'Report any issues to the administrator'
          ]
        }
      ],
      questions: 'Questions?',
      questionsDesc: 'If you have any questions about the rules, don\'t hesitate to contact us.',
      sendEmail: 'Send Email',
      backToDashboard: 'Back to Dashboard'
    }
  }
  
  const t = content[locale] || content.es

  const icons = {
    trophy: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
    calendar: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    tennis: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 2C8 2 4.5 5 4 9c4-1 8-1 12 0-.5-4-4-7-8-7z" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 22c4 0 7.5-3 8-7-4 1-8 1-12 0 .5 4 4 7 8 7z" fill="none" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    medal: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    chat: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    lightning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    handshake: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Rules Sections */}
      <div className="space-y-4">
        {t.sections.map((section, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            {/* Section Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                {icons[section.icon]}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            </div>
            
            {/* Section Content */}
            {section.scoring ? (
              // Scoring table
              <div className="space-y-2">
                {section.scoring.map((row, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                      row.type === 'win' ? 'bg-emerald-50' : 
                      row.type === 'walkover' ? 'bg-amber-50' : 
                      'bg-gray-50'
                    }`}
                  >
                    <span className="text-gray-700">{row.result}</span>
                    <span className={`font-semibold ${
                      row.type === 'win' ? 'text-emerald-600' : 
                      row.type === 'walkover' ? 'text-amber-600' : 
                      'text-gray-500'
                    }`}>
                      {row.points}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              // Regular bullet list
              <ul className="space-y-2">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.questions}</h3>
          <p className="text-gray-600 mb-5">{t.questionsDesc}</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a 
              href="mailto:morhendos@gmail.com" 
              className="inline-flex items-center justify-center px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t.sendEmail}
            </a>
            <a 
              href="https://wa.me/34652714328" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-6 text-center">
        <Link
          href={`/${locale}/player/dashboard`}
          className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.backToDashboard}
        </Link>
      </div>
    </div>
  )
}
