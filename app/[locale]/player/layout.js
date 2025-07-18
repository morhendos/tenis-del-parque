'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { announcementContent } from '@/lib/content/announcementContent'

export default function PlayerLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const locale = params.locale || 'es'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false)
  const [playerData, setPlayerData] = useState(null)

  const checkAuth = useCallback(async () => {
    try {
      if (status === 'loading') return
      
      if (status === 'unauthenticated') {
        router.push(`/${locale}/login?return=${pathname}`)
        return
      }
      
      if (session?.user) {
        setUser(session.user)
        
        // Fetch player profile to get the latest seenAnnouncements
        try {
          const profileResponse = await fetch('/api/player/profile')
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            setPlayerData(profileData)
            
            // Check for new announcements
            const allAnnouncementIds = [
              announcementContent.firstRoundDelay.id,
              announcementContent.firstRoundMatch.id
            ]
            
            const seenAnnouncements = profileData.user?.preferences?.seenAnnouncements || []
            const hasUnseen = allAnnouncementIds.some(id => !seenAnnouncements.includes(id))
            
            setHasNewAnnouncement(hasUnseen)
          }
        } catch (error) {
          console.error('Error fetching player data:', error)
          // Fallback to session data
          const seenAnnouncements = session.user?.seenAnnouncements || []
          const allAnnouncementIds = [
            announcementContent.firstRoundDelay.id,
            announcementContent.firstRoundMatch.id
          ]
          const hasUnseen = allAnnouncementIds.some(id => !seenAnnouncements.includes(id))
          setHasNewAnnouncement(hasUnseen)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [router, status, session, locale, pathname])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Re-check for new announcements when pathname changes (user navigates)
  useEffect(() => {
    if (session?.user && !loading) {
      checkAuth()
    }
  }, [pathname, session, loading, checkAuth])

  const navigation = [
    { 
      name: 'Dashboard', 
      href: `/${locale}/player/dashboard`, 
      icon: '🏠', 
      description: locale === 'es' ? 'Vista general y estadísticas' : 'Overview & stats' 
    },
    { 
      name: locale === 'es' ? 'Mi Liga' : 'My League', 
      href: `/${locale}/player/league`, 
      icon: '🏆', 
      description: locale === 'es' ? 'Clasificación de liga' : 'League standings' 
    },
    { 
      name: locale === 'es' ? 'Partidos' : 'Matches', 
      href: `/${locale}/player/matches`, 
      icon: '🎾', 
      description: locale === 'es' ? 'Historial de partidos' : 'Match history' 
    },
    { 
      name: locale === 'es' ? 'Mensajes' : 'Messages', 
      href: `/${locale}/player/messages`, 
      icon: '📬', 
      description: locale === 'es' ? 'Anuncios importantes' : 'Important announcements',
      badge: hasNewAnnouncement ? 'new' : null
    },
    { 
      name: locale === 'es' ? 'Perfil' : 'Profile', 
      href: `/${locale}/player/profile`, 
      icon: '👤', 
      description: locale === 'es' ? 'Configuración de cuenta' : 'Account settings' 
    },
    { 
      name: locale === 'es' ? 'Reglas' : 'Rules', 
      href: `/${locale}/player/rules`, 
      icon: '📋', 
      description: locale === 'es' ? 'Reglas de la liga' : 'League rules' 
    },
  ]

  const isActive = (href) => pathname === href

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push(`/${locale}/login`)
  }

  // Close mobile menu when clicking navigation items
  const handleNavClick = () => {
    setIsSidebarOpen(false)
  }

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">{locale === 'es' ? 'Cargando...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="relative h-full">
          {/* Simplified Header - Remove tiny logo on mobile */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-parque-purple via-purple-600 to-indigo-600 px-6 py-6">
            <div className="flex items-center justify-between">
              <Link href={`/${locale}/player/dashboard`} className="group" onClick={handleNavClick}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <span className="text-2xl">🎾</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Tenis del Parque</h1>
                    <p className="text-sm text-purple-200">
                      {locale === 'es' ? 'Hub de Jugadores' : 'Player Hub'}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-white hover:text-purple-200 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation - Scrollable area between header and footer */}
          <nav className="absolute top-28 bottom-20 left-0 right-0 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-parque-purple to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-parque-purple'
                }`}
              >
                <span className="text-2xl mr-4">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold flex items-center space-x-2">
                    <span>{item.name}</span>
                    {item.badge === 'new' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                        {locale === 'es' ? 'Nuevo' : 'New'}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${
                    isActive(item.href) ? 'text-purple-200' : 'text-gray-500 group-hover:text-purple-600'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Enhanced User Section - Always visible at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-parque-purple to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.email?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {playerData?.player?.name || user?.name || user?.email?.split('@')[0] || (locale === 'es' ? 'Jugador' : 'Player')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {locale === 'es' ? 'Miembro activo' : 'Active member'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                title={locale === 'es' ? 'Cerrar sesión' : 'Sign out'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        {/* Enhanced Top bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">
                  {pathname.includes('messages') ? 
                    (locale === 'es' ? 'Mensajes' : 'Messages') :
                   pathname.includes('matches') ? 
                    (locale === 'es' ? 'Mis Partidos' : 'My Matches') :
                   pathname.includes('profile') ? 
                    (locale === 'es' ? 'Mi Perfil' : 'My Profile') :
                   pathname.includes('league') ? 
                    (locale === 'es' ? 'Mi Liga' : 'My League') :
                   pathname.includes('rules') ? 
                    (locale === 'es' ? 'Reglas' : 'Rules') :
                   'Dashboard'}
                </h1>
                <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
                  {pathname.includes('messages') ? 
                    (locale === 'es' ? 'Anuncios y comunicaciones importantes' : 'Important announcements and communications') :
                   pathname.includes('matches') ? 
                    (locale === 'es' ? 'Historial y calendario de partidos' : 'Match history and schedule') :
                   pathname.includes('profile') ? 
                    (locale === 'es' ? 'Configuración de cuenta' : 'Account settings') :
                   pathname.includes('league') ? 
                    (locale === 'es' ? 'Clasificación y resultados' : 'Standings and results') :
                   pathname.includes('rules') ? 
                    (locale === 'es' ? 'Reglas de la liga' : 'League rules') :
                    (locale === 'es' ? 'Vista general de tu actividad' : 'Overview of your activity')}
                </p>
              </div>
            </div>
            

          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-2 md:px-6 py-4 md:py-8 max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
