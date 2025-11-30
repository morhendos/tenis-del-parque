'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { announcementContent } from '@/lib/content/announcementContent'
import { ToastContainer } from '@/components/ui/Toast'

export default function PlayerLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const urlLocale = params.locale || 'es'
  const [locale, setLocale] = useState(urlLocale) // Use state for locale instead of const
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false)
  const [playerData, setPlayerData] = useState(null)

  const checkAuth = useCallback(async () => {
    try {
      if (status === 'loading') return
      
      if (status === 'unauthenticated') {
        router.push(`/${urlLocale}/login?return=${pathname}`)
        return
      }
      
      if (session?.user) {
        setUser(session.user)
        
        // Fetch user preferences to get the latest seenAnnouncements
        try {
          const preferencesResponse = await fetch('/api/player/preferences')
          if (preferencesResponse.ok) {
            const preferencesData = await preferencesResponse.json()
            
            // Check for new announcements
            const allAnnouncementIds = [
              announcementContent.firstRoundMatch.id
            ]
            
            const seenAnnouncements = preferencesData.seenAnnouncements || []
            const hasUnseen = allAnnouncementIds.some(id => !seenAnnouncements.includes(id))
            
            setHasNewAnnouncement(hasUnseen)
          }
          
          // Also fetch player profile for name display AND language preference
          const profileResponse = await fetch('/api/player/profile')
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            setPlayerData(profileData)
            
            // Check if user has a language preference
            const userLanguage = profileData.user?.preferences?.language
            
            if (userLanguage && userLanguage !== urlLocale) {
              // User's preferred language differs from URL locale
              // Redirect to the correct locale while preserving the rest of the path
              const pathWithoutLocale = pathname.replace(`/${urlLocale}`, '')
              const newPath = `/${userLanguage}${pathWithoutLocale}`
              
              console.log(`[Player Layout] Redirecting from ${pathname} to ${newPath} based on user preference`)
              router.replace(newPath)
              return // Don't continue loading, we're redirecting
            } else {
              // Use the user's preference or URL locale
              setLocale(userLanguage || urlLocale)
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Don't fall back to session data since it doesn't contain seenAnnouncements anymore
          setHasNewAnnouncement(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [router, status, session, urlLocale, pathname])

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
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      description: locale === 'es' ? 'Vista general y estadísticas' : 'Overview & stats' 
    },
    { 
      name: locale === 'es' ? 'Mi Liga' : 'My League', 
      href: `/${locale}/player/league`, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      description: locale === 'es' ? 'Clasificación de liga' : 'League standings' 
    },
    { 
      name: locale === 'es' ? 'Partidos' : 'Matches', 
      href: `/${locale}/player/matches`, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 A10 10 0 0 1 12 22 M12 2 A10 10 0 0 0 12 22"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
      ),
      description: locale === 'es' ? 'Historial de partidos' : 'Match history' 
    },
    { 
      name: locale === 'es' ? 'Mensajes' : 'Messages', 
      href: `/${locale}/player/messages`, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      description: locale === 'es' ? 'Anuncios importantes' : 'Important announcements',
      badge: hasNewAnnouncement ? 'new' : null
    },
    { 
      name: locale === 'es' ? 'Perfil' : 'Profile', 
      href: `/${locale}/player/profile`, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: locale === 'es' ? 'Configuración de cuenta' : 'Account settings' 
    },
    { 
      name: locale === 'es' ? 'Reglas' : 'Rules', 
      href: `/${locale}/player/rules`, 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
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
          <p className="mt-4 text-gray-600">{urlLocale === 'es' ? 'Cargando...' : 'Loading...'}</p>
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
                  <div className="w-12 h-12 bg-white/40 rounded-xl flex items-center justify-center group-hover:bg-white/40 group-hover:scale-105 transition-all duration-200 p-2">
                    <Image 
                      src="/logo-big.png" 
                      alt="Tenis del Parque" 
                      width={40} 
                      height={40}
                      className="object-contain"
                    />
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
                <div className="flex-shrink-0 mr-4">{item.icon}</div>
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
        {/* Mobile-only Top bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div>
                <h1 className="text-lg font-bold text-gray-900">
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
                <p className="text-xs text-gray-500">
                  {pathname.includes('messages') ? 
                    (locale === 'es' ? 'Anuncios importantes' : 'Important announcements') :
                   pathname.includes('matches') ? 
                    (locale === 'es' ? 'Historial de partidos' : 'Match history') :
                   pathname.includes('profile') ? 
                    (locale === 'es' ? 'Configuración' : 'Settings') :
                   pathname.includes('league') ? 
                    (locale === 'es' ? 'Clasificación' : 'Standings') :
                   pathname.includes('rules') ? 
                    (locale === 'es' ? 'Reglas de la liga' : 'League rules') :
                    (locale === 'es' ? 'Vista general' : 'Overview')}
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
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}
