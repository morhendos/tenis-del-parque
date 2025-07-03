'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [showLeagueSwitcher, setShowLeagueSwitcher] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Leagues', href: '/admin/leagues', icon: '🏆' },
    { name: 'Users', href: '/admin/users', icon: '🔐' },
  ]

  // Load selected league from sessionStorage
  useEffect(() => {
    const storedLeague = sessionStorage.getItem('selectedLeague')
    if (storedLeague) {
      setSelectedLeague(JSON.parse(storedLeague))
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
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-parque-purple">
            <Link href="/admin/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-white">Tennis Admin</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-parque-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@tenisdelparque.com</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center h-16 px-6 bg-white shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex-1 flex flex-col ml-4 lg:ml-0">
            {/* Breadcrumbs */}
            {getBreadcrumbs().length > 0 && (
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
            
            {/* League Context & Switcher */}
            {(pathname.includes('/admin/players') || pathname.includes('/admin/matches')) && selectedLeague && (
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-6 max-w-7xl">
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
