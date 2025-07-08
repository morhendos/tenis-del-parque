import Link from 'next/link'

export default function QuickActions({ language }) {
  const actions = [
    {
      href: '/player/matches',
      icon: '🎾',
      label: language === 'es' ? 'Ver Partidos' : 'View Matches',
      bgGradient: 'from-purple-50 to-pink-50',
      hoverGradient: 'hover:from-purple-100 hover:to-pink-100',
      textColor: 'text-parque-purple',
      border: 'border-purple-100'
    },
    {
      href: '/player/league',
      icon: '🏆',
      label: language === 'es' ? 'Clasificación' : 'Standings',
      bgGradient: 'from-green-50 to-emerald-50',
      hoverGradient: 'hover:from-green-100 hover:to-emerald-100',
      textColor: 'text-green-700',
      border: 'border-green-100'
    },
    {
      href: '/player/profile',
      icon: '👤',
      label: language === 'es' ? 'Mi Perfil' : 'My Profile',
      bgGradient: 'from-blue-50 to-indigo-50',
      hoverGradient: 'hover:from-blue-100 hover:to-indigo-100',
      textColor: 'text-blue-700',
      border: 'border-blue-100'
    },
    {
      href: '/player/rules',
      icon: '📋',
      label: language === 'es' ? 'Reglas' : 'Rules',
      bgGradient: 'from-yellow-50 to-orange-50',
      hoverGradient: 'hover:from-yellow-100 hover:to-orange-100',
      textColor: 'text-yellow-700',
      border: 'border-yellow-100'
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-scale-in" style={{ animationDelay: '0.8s' }}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="text-xl mr-2">⚡</span>
        {language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex flex-col items-center justify-center px-4 py-6 bg-gradient-to-br ${action.bgGradient} ${action.textColor} rounded-xl ${action.hoverGradient} transition-all transform hover:scale-105 active:scale-95 text-sm font-medium border ${action.border}`}
          >
            <span className="text-3xl mb-2">{action.icon}</span>
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
} 