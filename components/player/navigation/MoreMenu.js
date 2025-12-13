'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MoreMenu({ isOpen, onClose, locale, user, playerData, onLogout }) {
  const pathname = usePathname()
  const sheetRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)

  const menuItems = [
    {
      name: locale === 'es' ? 'Mi Perfil' : 'My Profile',
      href: `/${locale}/player/profile`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: locale === 'es' ? 'Configuración de cuenta' : 'Account settings',
    },
    {
      name: 'OpenRank',
      href: `/${locale}/player/openrank`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      description: locale === 'es' ? 'Ranking global ELO' : 'Global ELO ranking',
    },
    {
      name: locale === 'es' ? 'Trofeos' : 'Trophies',
      href: `/${locale}/player/achievements`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      description: locale === 'es' ? 'Logros e insignias' : 'Achievements & badges',
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
    },
    {
      name: locale === 'es' ? 'Reglas' : 'Rules',
      href: `/${locale}/player/rules`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: locale === 'es' ? 'Reglas de la liga' : 'League rules',
    },
  ]

  const isActive = (href) => pathname === href

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300) // Match transition duration
      document.body.style.overflow = 'unset'
      return () => clearTimeout(timer)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Touch handlers for swipe to close
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY
    currentY.current = e.touches[0].clientY
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current
    // Only allow dragging down (positive diff)
    if (diff > 0) {
      setDragY(diff)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    // If dragged more than 100px or with velocity, close the menu
    if (dragY > 100) {
      onClose()
    }
    setDragY(0)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          maxHeight: '85vh',
          transform: isAnimating 
            ? `translateY(${dragY}px)` 
            : 'translateY(100%)',
          transition: isDragging ? 'none' : 'transform 300ms ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* User Info Header */}
        <div className="px-5 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-parque-purple to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.email?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {playerData?.player?.name || user?.name || user?.email?.split('@')[0] || (locale === 'es' ? 'Jugador' : 'Player')}
              </p>
              <p className="text-sm text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-3 py-3 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {menuItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center px-4 py-3.5 rounded-xl mb-1 transition-colors ${
                  active
                    ? 'bg-purple-50 text-parque-purple'
                    : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <div className={`flex-shrink-0 ${active ? 'text-parque-purple' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                <div className="ml-4 flex-1">
                  <p className={`font-medium ${active ? 'text-parque-purple' : 'text-gray-900'}`}>
                    {item.name}
                  </p>
                  <p className={`text-sm ${active ? 'text-purple-600' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
                <svg className={`w-5 h-5 ${active ? 'text-parque-purple' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>

        {/* Logout Button */}
        <div className="px-3 pb-6 pt-2 border-t border-gray-100 safe-area-bottom">
          <button
            onClick={() => {
              onClose()
              onLogout()
            }}
            className="flex items-center w-full px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="ml-4 font-medium">
              {locale === 'es' ? 'Cerrar sesión' : 'Sign out'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
