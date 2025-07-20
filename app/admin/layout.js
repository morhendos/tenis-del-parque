'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [showLeagueSwitcher, setShowLeagueSwitcher] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6h-8V5z" />
        </svg>
      )
    },
    { 
      name: 'Leagues', 
      href: '/admin/leagues', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
  ]

  // Set client flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auth check - redirect if not admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      // Get locale from cookie or default to 'es'
      const locale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] || 'es'
      
      router.push(`/${locale}/login`)
    }
  }, [status, session, router])

  // Load selected league from sessionStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLeague = sessionStorage.getItem('selectedLeague')
      if (storedLeague) {
        try {
          setSelectedLeague(JSON.parse(storedLeague))
        } catch (e) {
          console.error('Error parsing stored league:', e)
        }
      }
    }
  }, [pathname])

  const isActive = (href) => {
    if (href === '/admin/dashboard' && pathname === '/admin') return true
    return pathname.startsWith(href)
  }

  const getBreadcrumbs = () => {
    // Handle league management pages
    if (pathname.match(/\/admin\/leagues\/[^/]+$/)) {
      return [
        { name: 'Leagues', href: '/admin/leagues' },
        { name: selectedLeague?.name || 'League', href: null }
      ]
    }
    
    if (pathname.includes('/admin/players')) {
      return [
        { name: 'Leagues', href: '/admin/leagues' },
        { name: selectedLeague?.name || 'League', href: selectedLeague?.id ? `/admin/leagues/${selectedLeague.id}` : null },
        { name: 'Players', href: null }
      ]
    }
    
    if (pathname.includes('/admin/matches')) {
      const breadcrumbs = [
        { name: 'Leagues', href: '/admin/leagues' },
        { name: selectedLeague?.name || 'League', href: selectedLeague?.id ? `/admin/leagues/${selectedLeague.id}` : null },
        { name: 'Matches', href: pathname.includes('/admin/matches/') && selectedLeague?.id ? `/admin/matches?league=${selectedLeague.id}` : null }
      ]
      
      // Add specific page names for match sub-pages
      if (pathname.includes('/create')) {
        breadcrumbs.push({ name: 'Create Match', href: null })
      } else if (pathname.includes('/generate-round')) {
        breadcrumbs.push({ name: 'Generate Round', href: null })
      } else if (pathname.match(/\/admin\/matches\/[^/]+$/)) {
        breadcrumbs.push({ name: 'Match Details', href: null })
      }
      
      return breadcrumbs
    }
    
    return []
  }

  const getPageTitle = () => {
    if (pathname.includes('/admin/users')) return 'User Management'
    if (pathname.includes('/admin/leagues') && !pathname.match(/\/admin\/leagues\/[^/]+$/)) return 'League Management'
    if (pathname.match(/\/admin\/leagues\/[^/]+$/)) return selectedLeague?.name || 'League Management'
    if (pathname.includes('/admin/players')) return `Player Management - ${selectedLeague?.name || ''}`
    if (pathname.includes('/admin/matches')) return `Match Management - ${selectedLeague?.name || ''}`
    return 'Dashboard'
  }

  const handleLogout = async () => {
    // Get locale from cookie or default to 'es'
    const locale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] || 'es'
    
    await signOut({ redirect: false })
    router.push(`/${locale}/login`)
  }

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-parque-purple"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not admin
  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-parque-purple to-parque-green">
            <Link href="/admin/dashboard" className="flex items-center group">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">🎾</span>
                </div>
                <span className="text-xl font-bold text-white group-hover:text-gray-100 transition-colors">
                  Tennis Admin
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-parque-purple to-parque-green text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-parque-purple'
                }`}
              >
                <span className="mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-parque-purple to-parque-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email || 'admin@tenisdelparque.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-parque-purple transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center h-16 px-6 bg-white shadow-sm border-b border-gray-200">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex-1 flex flex-col ml-4 lg:ml-0">
            {/* Breadcrumbs - only render on client to avoid hydration issues */}
            {isClient && getBreadcrumbs().length > 0 && (
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                {getBreadcrumbs().map((breadcrumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    {breadcrumb.href ? (
                      <Link href={breadcrumb.href} className="hover:text-parque-purple">
                        {breadcrumb.name}
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
                    )}
                  </div>
                ))}
              </nav>
            )}
            
            {/* Page Title */}
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>
          
          {/* League Context & Switcher - only render on client */}
          {isClient && (pathname.includes('/admin/players') || pathname.includes('/admin/matches')) && selectedLeague && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Current league:</span>
              <button
                onClick={() => setShowLeagueSwitcher(!showLeagueSwitcher)}
                className="flex items-center space-x-2 px-3 py-1 bg-parque-purple text-white text-sm rounded-lg hover:bg-opacity-90"
              >
                <span>{selectedLeague.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </button>
              <Link
                href="/admin/leagues"
                className="px-3 py-1 text-sm text-parque-purple hover:bg-parque-purple hover:text-white border border-parque-purple rounded-lg transition-colors"
              >
                Switch League
              </Link>
            </div>
          )}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}