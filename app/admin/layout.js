'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { ToastContainer } from '@/components/ui/Toast'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState(null)
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
      name: 'Players', 
      href: '/admin/players', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      name: 'Matches', 
      href: '/admin/matches', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Messages', 
      href: '/admin/messages', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Community',
      href: '/admin/community',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    { 
      name: 'Attribution', 
      href: '/admin/attribution', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Clubs', 
      href: '/admin/clubs', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      name: 'Cities', 
      href: '/admin/cities', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      name: 'Areas', 
      href: '/admin/areas/map', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
    { 
      name: 'Business Plan', 
      href: '/admin/business-plan', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Documentation', 
      href: '/admin/docs', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
  ]

  const navSections = [
    { label: 'League', items: ['Dashboard', 'Leagues', 'Players', 'Matches'] },
    { label: 'Engagement', items: ['Messages', 'Community', 'Attribution'] },
    { label: 'Places', items: ['Clubs', 'Cities', 'Areas'] },
    { label: 'System', items: ['Users', 'Business Plan', 'Documentation'] }
  ].map(s => ({ ...s, items: s.items.map(n => navigation.find(i => i.name === n)).filter(Boolean) }))

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
    // Handle areas pages (both map and editor paths lead to same component now)
    if (pathname === '/admin/areas/map' || pathname === '/admin/areas/editor') {
      return [{ name: 'Areas Management', href: null }]
    }
    
    // Handle docs pages
    if (pathname.match(/\/admin\/docs\/[^/]+$/)) {
      return [
        { name: 'Documentation', href: '/admin/docs' },
        { name: 'Document', href: null }
      ]
    }
    
    if (pathname === '/admin/docs') {
      return [{ name: 'Documentation', href: null }]
    }
    
    if (pathname === '/admin/business-plan') {
      return [{ name: 'Business Plan', href: null }]
    }
    
    // Handle clubs pages
    if (pathname === '/admin/clubs') {
      return [{ name: 'Clubs', href: null }]
    }
    
    // Handle cities pages
    if (pathname === '/admin/cities') {
      return [{ name: 'Cities', href: null }]
    }
    
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
    if (pathname.includes('/admin/business-plan')) return 'Business Plan'
    if (pathname.includes('/admin/areas/')) return 'Areas Management'
    if (pathname.includes('/admin/users')) return 'User Management'
    if (pathname.includes('/admin/docs')) return 'Documentation'
    if (pathname.includes('/admin/clubs')) return 'Club Management'
    if (pathname.includes('/admin/cities')) return 'Cities Management'
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl lg:shadow-none transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-parque-purple via-purple-600 to-indigo-600">
            <Link href="/admin/dashboard" className="group flex items-center space-x-2.5">
              <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center p-1.5 group-hover:bg-white/40 transition-colors">
                <Image src="/logo-big.png" alt="Tenis del Parque" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <p className="text-base font-bold text-white leading-tight">Tenis del Parque</p>
                <p className="text-xs text-purple-200">Admin</p>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.label} className="mb-4 last:mb-0">
                <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">{section.label}</p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-parque-purple to-purple-600 text-white shadow-md shadow-purple-900/10'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-parque-purple'
                      }`}
                    >
                      <span className={`mr-3 flex-shrink-0 ${isActive(item.href) ? 'text-white' : 'text-gray-400'}`}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-9 h-9 rounded-full bg-purple-50 text-parque-purple flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-sm">
                  {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session?.user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email || 'admin@tenisdp.es'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center min-h-[4rem] px-4 sm:px-6 py-3 bg-white/90 backdrop-blur border-b border-gray-100">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex-1 flex flex-col ml-4 lg:ml-0">
            {/* Breadcrumbs - only render on client to avoid hydration issues */}
            {isClient && getBreadcrumbs().length > 0 && (
              <nav className="flex items-center flex-wrap text-xs text-gray-500 mb-0.5">
                {getBreadcrumbs().map((breadcrumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <span className="mx-1.5 text-gray-300">/</span>}
                    {breadcrumb.href ? (
                      <Link href={breadcrumb.href} className="hover:text-parque-purple">
                        {breadcrumb.name}
                      </Link>
                    ) : (
                      <span className="text-gray-700 font-medium">{breadcrumb.name}</span>
                    )}
                  </div>
                ))}
              </nav>
            )}
            
            {/* Page Title */}
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              {getPageTitle()}
            </h1>
          </div>
          
          {/* League Context & Switcher - only render on client */}
          {isClient && (pathname.includes('/admin/players') || pathname.includes('/admin/matches')) && selectedLeague && (
            <Link
              href="/admin/leagues"
              title="Switch league"
              className="hidden sm:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-purple-50 text-parque-purple text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-parque-purple" />
              <span className="truncate max-w-[220px]">{selectedLeague.name}</span>
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </Link>
          )}
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}