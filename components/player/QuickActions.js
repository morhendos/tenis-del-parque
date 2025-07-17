import Link from 'next/link'

export default function QuickActions({ language, locale }) {
  const actions = [
    {
      title: language === 'es' ? 'Ver Calendario' : 'View Schedule',
      description: language === 'es' ? 'Consulta tus próximos partidos' : 'Check your upcoming matches',
      href: `/${locale}/player/matches`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      title: language === 'es' ? 'Reportar Resultado' : 'Report Result',
      description: language === 'es' ? 'Envía el resultado de tu partido' : 'Submit your match result',
      href: `/${locale}/player/matches`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      title: language === 'es' ? 'Ver Clasificación' : 'View Standings',
      description: language === 'es' ? 'Consulta tu posición en la liga' : 'Check your league position',
      href: `/${locale}/player/league`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    },
    {
      title: language === 'es' ? 'Actualizar Perfil' : 'Update Profile',
      description: language === 'es' ? 'Mantén tu información actualizada' : 'Keep your information up to date',
      href: `/${locale}/player/profile`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'bg-gray-50 text-gray-600 hover:bg-gray-100'
    }
  ]

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`group relative p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${action.color}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-800">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-600">
                    {action.description}
                  </p>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}