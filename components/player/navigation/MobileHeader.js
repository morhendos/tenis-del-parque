'use client'

import { usePathname } from 'next/navigation'

export default function MobileHeader({ locale }) {
  const pathname = usePathname()
  
  // Get page title and subtitle based on current path
  const getPageInfo = () => {
    if (pathname.includes('/messages')) {
      return {
        title: locale === 'es' ? 'Mensajes' : 'Messages',
        subtitle: locale === 'es' ? 'Anuncios importantes' : 'Important announcements'
      }
    }
    if (pathname.includes('/achievements')) {
      return {
        title: locale === 'es' ? 'Trofeos' : 'Trophies',
        subtitle: locale === 'es' ? 'Logros e insignias' : 'Achievements & badges'
      }
    }
    if (pathname.includes('/openrank')) {
      return {
        title: 'OpenRank',
        subtitle: locale === 'es' ? 'Ranking global ELO' : 'Global ELO ranking'
      }
    }
    if (pathname.includes('/matches')) {
      return {
        title: locale === 'es' ? 'Partidos' : 'Matches',
        subtitle: locale === 'es' ? 'Historial y calendario' : 'History & schedule'
      }
    }
    if (pathname.includes('/profile')) {
      return {
        title: locale === 'es' ? 'Perfil' : 'Profile',
        subtitle: locale === 'es' ? 'Configuración de cuenta' : 'Account settings'
      }
    }
    if (pathname.includes('/league')) {
      return {
        title: locale === 'es' ? 'Mi Liga' : 'My League',
        subtitle: locale === 'es' ? 'Clasificación' : 'Standings'
      }
    }
    if (pathname.includes('/rules')) {
      return {
        title: locale === 'es' ? 'Reglas' : 'Rules',
        subtitle: locale === 'es' ? 'Reglas de la liga' : 'League rules'
      }
    }
    // Dashboard is default
    return {
      title: 'Dashboard',
      subtitle: locale === 'es' ? 'Vista general' : 'Overview'
    }
  }

  const { title, subtitle } = getPageInfo()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 lg:hidden">
      <div className="px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </header>
  )
}
