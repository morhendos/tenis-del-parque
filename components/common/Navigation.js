'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import { TennisBallIcon } from '../ui/TennisIcons'

export default function Navigation({ currentPage = 'home', language, onLanguageChange, showLanguageSwitcher = true }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [hoveredButton, setHoveredButton] = useState(null)
  const params = useParams()
  const pathname = usePathname()
  const locale = params?.locale || language || 'es'

  // Hydration guard - ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const navContent = {
    es: {
      home: 'Inicio',
      leagues: 'Ligas',
      rules: 'Reglamento',
      elo: 'ELO Puntos',
      swiss: 'Sistema Suizo',
      login: 'Iniciar Sesión',
      about: 'Acerca de',
      contact: 'Contacto'
    },
    en: {
      home: 'Home',
      leagues: 'Leagues',
      rules: 'Rules',
      elo: 'ELO Points',
      swiss: 'Swiss System',
      login: 'Login',
      about: 'About',
      contact: 'Contact'
    }
  }

  // Add fallback to ensure t is always defined
  const validLocale = navContent[locale] ? locale : 'es'
  const t = navContent[validLocale]

  const handleMobileMenuToggle = () => {
    if (!isClient) return // Prevent interaction before hydration
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const NavLink = ({ href, children, onClick, buttonKey }) => {
    // Convert href to locale-based href - only after hydration
    const localizedHref = isClient && href.startsWith('/') ? `/${validLocale}${href}` : href
    const isActive = isClient && (pathname === localizedHref || (href === '/' && pathname === `/${validLocale}`))
    const isHovered = hoveredButton === buttonKey
    
    return (
      <Link 
        href={localizedHref} 
        onClick={onClick}
        onMouseEnter={() => setHoveredButton(buttonKey)}
        onMouseLeave={() => setHoveredButton(null)}
        className={`relative transition-colors font-medium group block py-2 md:py-0 ${
          isActive
            ? 'text-parque-purple' 
            : 'text-gray-700'
        }`}
        style={{
          color: isHovered && !isActive ? '#563380' : undefined
        }}
      >
        {children}
        {isActive && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple hidden md:block"></div>
        )}
        <div 
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple transition-transform origin-left hidden md:block"
          style={{
            transform: isHovered ? 'scaleX(1)' : 'scaleX(0)'
          }}
        ></div>
      </Link>
    )
  }

  // Don't render interactive elements until hydrated
  if (!isClient) {
    return (
      <nav className="fixed top-0 w-full backdrop-blur-md z-[100] bg-white/95">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="group flex items-center space-x-2">
                <Image
                  src="/logo-horizontal-small.png"
                  alt="Tenis del Parque"
                  height={48}
                  width={200}
                  className="h-12 w-auto"
                  priority
                  quality={100}
                />
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-8">
              <div className="flex space-x-6 text-gray-700">
                <span>{t.home}</span>
                <span>{t.leagues}</span>
                <span>{t.rules}</span>
                <span>{t.swiss}</span>
                <span>{t.elo}</span>
              </div>
              
              <div className="ml-4">
                <span className="bg-parque-purple text-white px-4 py-2 rounded-lg font-medium text-sm">
                  {t.login}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 lg:hidden">
              <div className="flex flex-col justify-center items-center w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg">
                <span className="block w-5 h-0.5 bg-gray-600 -translate-y-1"></span>
                <span className="block w-5 h-0.5 bg-gray-600"></span>
                <span className="block w-5 h-0.5 bg-gray-600 translate-y-1"></span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className={`fixed top-0 w-full backdrop-blur-md z-[100] transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-lg' : 'bg-white/70'
      }`}>
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                href={`/${validLocale}`} 
                className="group flex items-center space-x-2 transition-transform"
                onMouseEnter={() => setHoveredButton('logo')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  transform: hoveredButton === 'logo' ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <Image
                  src="/logo-horizontal-small.png"
                  alt="Tenis del Parque"
                  height={48}
                  width={200}
                  className="h-12 w-auto"
                  priority
                  quality={100}
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className="flex space-x-6">
                <NavLink href="/" buttonKey="home">{t.home}</NavLink>
                <NavLink href={`/${validLocale === 'es' ? 'ligas' : 'leagues'}`} buttonKey="leagues">{t.leagues}</NavLink>
                <NavLink href={`/${validLocale === 'es' ? 'reglas' : 'rules'}`} buttonKey="rules">{t.rules}</NavLink>
                <NavLink href="/swiss" buttonKey="swiss">{t.swiss}</NavLink>
                <NavLink href="/elo" buttonKey="elo">{t.elo}</NavLink>
              </div>
              
              {/* Login Button */}
              <div className="ml-4">
                <a
                  href={`/${validLocale}/login`}
                  onMouseEnter={() => setHoveredButton('login')}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="bg-parque-purple text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                  style={{
                    backgroundColor: hoveredButton === 'login' ? '#452a66' : '#563380'
                  }}
                >
                  {t.login}
                </a>
              </div>
              
              {/* Desktop Language Selector */}
              {showLanguageSwitcher && (
                <LanguageSwitcher className="ml-2" />
              )}
            </div>

            {/* Mobile Menu Button & Language Selector */}
            <div className="flex items-center space-x-3 lg:hidden">
              {/* Mobile Language Selector */}
              {showLanguageSwitcher && (
                <LanguageSwitcher className="" />
              )}

              {/* Hamburger Menu Button */}
              <button
                onClick={handleMobileMenuToggle}
                onMouseEnter={() => setHoveredButton('hamburger')}
                onMouseLeave={() => setHoveredButton(null)}
                className="flex flex-col justify-center items-center w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg transition-all duration-300 group"
                style={{
                  borderColor: hoveredButton === 'hamburger' ? '#563380' : '#d1d5db'
                }}
                aria-label="Toggle mobile menu"
              >
                <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Tennis court line decoration at bottom of nav when scrolled */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[90] lg:hidden transition-all duration-300 ${
        isMobileMenuOpen 
          ? 'opacity-100 pointer-events-auto' 
          : 'opacity-0 pointer-events-none'
      }`}>
        {/* Background overlay */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Mobile menu panel */}
        <div className={`absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xl transition-all duration-300 max-h-[calc(100vh-4rem)] overflow-y-auto ${
          isMobileMenuOpen 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0'
        }`}>
          <div className="container mx-auto px-2 md:px-4 py-6">
            <div className="flex flex-col space-y-4">
              {/* Home Page Link */}
              <div>
                <NavLink 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  buttonKey="mobile-home"
                >
                  <div className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 ${
                    currentPage === 'home' 
                      ? 'bg-gradient-to-r from-parque-purple/10 to-transparent border-l-4 border-parque-purple' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <span className="text-lg font-medium">{t.home}</span>
                    {currentPage === 'home' && (
                      <div className="w-2 h-2 bg-parque-purple rounded-full"></div>
                    )}
                  </div>
                </NavLink>
              </div>
              
              <NavLink 
                href={`/${validLocale === 'es' ? 'ligas' : 'leagues'}`} 
                onClick={() => setIsMobileMenuOpen(false)}
                buttonKey="mobile-leagues"
              >
                <div className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 ${
                  currentPage === 'leagues' 
                    ? 'bg-gradient-to-r from-parque-purple/10 to-transparent border-l-4 border-parque-purple'
                    : 'hover:bg-gray-50'
                }`}>
                  <span className="text-lg font-medium">{t.leagues}</span>
                  {currentPage === 'leagues' && (
                    <div className="w-2 h-2 bg-parque-purple rounded-full"></div>
                  )}
                </div>
              </NavLink>
              
              <NavLink 
                href={`/${validLocale === 'es' ? 'reglas' : 'rules'}`} 
                onClick={() => setIsMobileMenuOpen(false)}
                buttonKey="mobile-rules"
              >
                <div className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 ${
                  currentPage === 'rules' 
                    ? 'bg-gradient-to-r from-parque-purple/10 to-transparent border-l-4 border-parque-purple' 
                    : 'hover:bg-gray-50'
                }`}>
                  <span className="text-lg font-medium">{t.rules}</span>
                  {currentPage === 'rules' && (
                    <div className="w-2 h-2 bg-parque-purple rounded-full"></div>
                  )}
                </div>
              </NavLink>
              
              <NavLink 
                href="/swiss" 
                onClick={() => setIsMobileMenuOpen(false)}
                buttonKey="mobile-swiss"
              >
                <div className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 ${
                  currentPage === 'swiss' 
                    ? 'bg-gradient-to-r from-parque-purple/10 to-transparent border-l-4 border-parque-purple' 
                    : 'hover:bg-gray-50'
                }`}>
                  <span className="text-lg font-medium">{t.swiss}</span>
                  {currentPage === 'swiss' && (
                    <div className="w-2 h-2 bg-parque-purple rounded-full"></div>
                  )}
                </div>
              </NavLink>
              
              <NavLink 
                href="/elo" 
                onClick={() => setIsMobileMenuOpen(false)}
                buttonKey="mobile-elo"
              >
                <div className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 ${
                  currentPage === 'elo' 
                    ? 'bg-gradient-to-r from-parque-purple/10 to-transparent border-l-4 border-parque-purple' 
                    : 'hover:bg-gray-50'
                }`}>
                  <span className="text-lg font-medium">{t.elo}</span>
                  {currentPage === 'elo' && (
                    <div className="w-2 h-2 bg-parque-purple rounded-full"></div>
                  )}
                </div>
              </NavLink>
              
              {/* Mobile Login Button */}
              <div className="pt-4 border-t border-gray-200">
                <a
                  href={`/${validLocale}/login`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full bg-parque-purple text-white text-center py-3 px-4 rounded-xl hover:bg-parque-purple/90 transition-colors font-medium"
                >
                  {t.login}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
