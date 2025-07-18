'use client'

import { useParams } from 'next/navigation'
import { rulesContent } from '@/lib/content/rulesContent'

export default function PlayerRulesPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const t = rulesContent[locale]

  // Map the sections from rulesContent to the player rules format
  const sectionsMap = {
    'match': 'matchFormat',
    'points': 'scoring',
    'schedule': 'courtReservation',
    'conduct': 'conduct',
    'playoffs': 'playoffs'
  }

  // Get the relevant sections from rulesContent
  const getSection = (sectionId) => {
    return t.sections.find(section => section.id === sectionId)
  }

  const rules = [
    {
      id: 'match-format',
      title: getSection('match')?.title || (locale === 'es' ? 'Formato de Partidos' : 'Match Format'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: getSection('match')?.items || []
    },
    {
      id: 'scoring',
      title: getSection('points')?.title || (locale === 'es' ? 'Sistema de Puntos' : 'Point System'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      content: getSection('points')?.items || []
    },
    {
      id: 'court-reservation',
      title: getSection('schedule')?.title || (locale === 'es' ? 'Programación de Partidos' : 'Match Scheduling'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      content: getSection('schedule')?.items || []
    },
    {
      id: 'conduct',
      title: getSection('conduct')?.title || (locale === 'es' ? 'Reglas de Conducta' : 'Code of Conduct'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      content: getSection('conduct')?.items || []
    },
    {
      id: 'playoffs',
      title: getSection('playoffs')?.title || (locale === 'es' ? 'Playoffs' : 'Playoffs'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      content: getSection('playoffs')?.items || []
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {locale === 'es' ? 'Reglas del Torneo' : 'Tournament Rules'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {locale === 'es' 
            ? 'Todo lo que necesitas saber para participar'
            : 'Everything you need to know to participate'}
        </p>
      </div>

      {/* Rules Sections */}
      <div className="space-y-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 text-parque-purple">
                {rule.icon}
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-900">
                {rule.title}
              </h2>
            </div>
            <ul className="space-y-2">
              {rule.content.map((item, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {locale === 'es' ? '¿Tienes preguntas?' : 'Have questions?'}
            </h3>
            <p className="mt-2 text-sm text-blue-700">
              {locale === 'es' 
                ? 'Si tienes alguna duda sobre las reglas o el formato del torneo, no dudes en contactar con la organización.'
                : 'If you have any questions about the rules or tournament format, please don\'t hesitate to contact the organization.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}