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
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-b from-white to-purple-50 rounded-t-3xl transition-transform duration-300 ease-out overflow-hidden ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          maxHeight: '85vh',
          transform: isAnimating 
            ? `translateY(${dragY}px)` 
            : 'translateY(100%)',
          transition: isDragging ? 'none' : 'transform 300ms ease-out',
          boxShadow: '0 -10px 40px -5px rgba(124, 58, 237, 0.3)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-purple-300 rounded-full" />
        </div>

        {/* User Info Header - Purple themed */}
        <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-parque-purple via-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-lg">
                {user?.email?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">
                {playerData?.player?.name || user?.name || user?.email?.split('@')[0] || (locale === 'es' ? 'Jugador' : 'Player')}
              </p>
              <p className="text-sm text-purple-200 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-3 pb-3 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 200px)' }}>
          {menuItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center px-4 py-3.5 rounded-xl mb-1.5 transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-parque-purple to-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-gray-700 hover:bg-purple-100 active:bg-purple-200'
                }`}
              >
                <div className={`flex-shrink-0 ${active ? 'text-white' : 'text-purple-500'}`}>
                  {item.icon}
                </div>
                <div className="ml-4 flex-1">
                  <p className={`font-medium ${active ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </p>
                  <p className={`text-sm ${active ? 'text-purple-200' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
                <svg className={`w-5 h-5 ${active ? 'text-purple-200' : 'text-purple-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>

        {/* Logout Button */}
        <div className="px-3 pb-6 pt-2 border-t border-purple-100 safe-area-bottom">
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
