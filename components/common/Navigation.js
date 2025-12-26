'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useParams, usePathname, useRouter } from 'next/navigation'
import LanguageSwitcher, { LanguageSwitcherToggle } from './LanguageSwitcher'
import TennisPreloader from '../ui/TennisPreloader'

export default function Navigation({ currentPage = 'home', language, onLanguageChange, showLanguageSwitcher = true }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [hoveredButton, setHoveredButton] = useState(null)
  const [tappedItem, setTappedItem] = useState(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [navVisible, setNavVisible] = useState(true) // For auto-hide on scroll
  const lastScrollY = useRef(0)
  const params = useParams()
  const pathname = usePathname()
  const locale = params?.locale || language || 'es'
  const router = useRouter()

  // Hydration guard
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle scroll - auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Always show when near top
      if (currentScrollY < 50) {
        setNavVisible(true)
        setScrolled(false)
      } else {
        setScrolled(true)
        // Hide on scroll down, show on scroll up (only on mobile)
        if (window.innerWidth < 1024) {
          if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            setNavVisible(false) // Scrolling down
          } else {
            setNavVisible(true) // Scrolling up
          }
        }
      }
      
      lastScrollY.current = currentScrollY
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Always show nav when menu is open or when programmatic scroll triggers it
  useEffect(() => {
    if (isMobileMenuOpen) {
      setNavVisible(true)
    }
  }, [isMobileMenuOpen])

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setTappedItem(null)
    setIsNavigating(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const navContent = {
    es: {
      home: 'Inicio',
      leagues: 'Ligas',
      clubs: 'Clubes',
      rules: 'Reglamento',
      elo: 'ELO Puntos',
      swiss: 'Sistema Suizo',
      openrank: 'OpenRank',
      login: 'Iniciar Sesión',
      language: 'Idioma',
      about: 'Acerca de',
      contact: 'Contacto'
    },
    en: {
      home: 'Home',
      leagues: 'Leagues',
      clubs: 'Clubs',
      rules: 'Rules',
      elo: 'ELO Points',
      swiss: 'Swiss System',
      openrank: 'OpenRank',
      login: 'Login',
      language: 'Language',
      about: 'About',
      contact: 'Contact'
    }
  }

  const validLocale = navContent[locale] ? locale : 'es'
  const t = navContent[validLocale]

  const handleMobileMenuToggle = () => {
    if (!isClient) return
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const NavLink = ({ href, children, onClick, buttonKey }) => {
    const localizedHref = isClient && href.startsWith('/') ? `/${validLocale}${href}` : href
    const isActive = isClient && (pathname === localizedHref || (href === '/' && pathname === `/${validLocale}`) || pathname.startsWith(localizedHref + '/'))
    const isHovered = hoveredButton === buttonKey
    
    const handleClick = (e) => {
      if (onClick) onClick(e)
      if (!e.defaultPrevented) {
        window.location.href = localizedHref
      }
    }
    
    return (
      <a
        href={localizedHref}
        onClick={handleClick}
        onMouseEnter={() => setHoveredButton(buttonKey)}
        onMouseLeave={() => setHoveredButton(null)}
        className={`relative transition-colors font-medium group block py-2 md:py-0 ${
          isActive ? 'text-parque-purple' : 'text-gray-700'
        }`}
        style={{
          color: isHovered && !isActive ? '#563380' : undefined,
          cursor: 'pointer',
          userSelect: 'none',
          textDecoration: 'none'
        }}
      >
        {children}
        {isActive && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple hidden md:block"></div>
        )}
        <div 
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple transition-transform origin-left hidden md:block"
          style={{ transform: isHovered ? 'scaleX(1)' : 'scaleX(0)' }}
        ></div>
      </a>
    )
  }

  // Mobile menu item with tap feedback
  const MobileMenuItem = ({ href, label, pageKey }) => {
    const isActive = currentPage === pageKey
    const isTapped = tappedItem === pageKey
    const localizedHref = href.startsWith('/') ? `/${validLocale}${href}` : href
    
    const isCurrentPage = pathname === localizedHref || 
                          (href === '/' && pathname === `/${validLocale}`) ||
                          pathname.startsWith(localizedHref + '/')
    
    const handleTap = (e) => {
      e.preventDefault()
      
      if (isCurrentPage) {
        setIsMobileMenuOpen(false)
        return
      }
      
      setTappedItem(pageKey)
      
      setTimeout(() => {
        setIsMobileMenuOpen(false)
        setIsNavigating(true)
        router.push(localizedHref)
      }, 150)
    }
    
    const showAsActive = isTapped || isActive
    
    return (
      <a
        href={localizedHref}
        onClick={handleTap}
        className={`block transition-all duration-150 ${isTapped ? 'scale-[0.98]' : ''}`}
      >
        <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-150 ${
          showAsActive 
            ? 'bg-gradient-to-r from-parque-purple/15 to-parque-purple/5 border-l-4 border-parque-purple' 
            : 'hover:bg-gray-50 border-l-4 border-transparent'
        }`}>
          <span className={`text-base font-medium transition-colors duration-150 ${
            showAsActive ? 'text-parque-purple' : 'text-gray-700'
          }`}>
            {label}
          </span>
          {showAsActive && (
            <img 
              src="/tennis-ball.webp" 
              alt="" 
              className={`w-5 h-5 object-contain transition-transform duration-150 ${isTapped ? 'scale-110' : ''}`}
            />
          )}
        </div>
      </a>
    )
  }

  const handleLoginTap = (e) => {
    e.preventDefault()
    setTappedItem('login')
    
    setTimeout(() => {
      setIsMobileMenuOpen(false)
      setIsNavigating(true)
      router.push(`/${validLocale}/login`)
    }, 150)
  }

  // SSR placeholder - more compact on mobile
  if (!isClient) {
    return (
      <nav className="fixed top-0 w-full backdrop-blur-md z-[100] bg-white/95">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <div className="flex items-center">
              <Image
                src="/horizontal-logo-007.webp"
                alt="Tenis del Parque"
                height={32}
                width={133}
                className="h-8 lg:h-9 w-auto"
                priority
                quality={100}
              />
            </div>
            
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex space-x-6 text-gray-700">
                <span>{t.home}</span>
                <span>{t.leagues}</span>
                <span>{t.clubs}</span>
                <span>{t.rules}</span>
                <span>{t.swiss}</span>
                <span>{t.elo}</span>
                <span>{t.openrank}</span>
              </div>
              
              <div className="ml-8">
                <span className="bg-parque-purple text-white px-4 py-2 rounded-lg font-medium text-sm">
                  {t.login}
                </span>
              </div>
              
              {showLanguageSwitcher && (
                <LanguageSwitcher className="ml-2" locale={validLocale} />
              )}
            </div>

            {/* Mobile - just hamburger, no language switcher */}
            <div className="flex items-center lg:hidden">
              <div className="p-2">
                <span className="block w-5 h-0.5 bg-gray-700 mb-1"></span>
                <span className="block w-5 h-0.5 bg-gray-700 mb-1"></span>
                <span className="block w-5 h-0.5 bg-gray-700"></span>
              </div>
            </div>
          </div>
        </div>
        {/* Subtle purple accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-parque-purple/30 to-transparent"></div>
      </nav>
    )
  }

  return (
    <>
      <nav className={`fixed top-0 w-full backdrop-blur-md z-[100] transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-md' : 'bg-white/90 lg:bg-white/70'
      } ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-3 md:px-4">
          {/* Compact height on mobile (h-14 = 56px), normal on desktop (h-16 = 64px) */}
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <a 
              href={`/${validLocale}`} 
              className="flex items-center transition-transform"
              onMouseEnter={() => setHoveredButton('logo')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{ transform: hoveredButton === 'logo' ? 'scale(1.05)' : 'scale(1)' }}
            >
              <Image
                src="/horizontal-logo-007.webp"
                alt="Tenis del Parque"
                height={32}
                width={133}
                className="h-8 lg:h-9 w-auto"
                priority
                quality={100}
              />
            </a>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <NavLink href="/" buttonKey="home">{t.home}</NavLink>
              <NavLink href={`/${validLocale === 'es' ? 'ligas' : 'leagues'}`} buttonKey="leagues">{t.leagues}</NavLink>
              <NavLink href={`/${validLocale === 'es' ? 'clubes' : 'clubs'}`} buttonKey="clubs">{t.clubs}</NavLink>
              <NavLink href={`/${validLocale === 'es' ? 'reglas' : 'rules'}`} buttonKey="rules">{t.rules}</NavLink>
              <NavLink href="/swiss" buttonKey="swiss">{t.swiss}</NavLink>
              <NavLink href="/elo" buttonKey="elo">{t.elo}</NavLink>
              <NavLink href="/openrank" buttonKey="openrank">{t.openrank}</NavLink>
              
              <div className="ml-8">
                <a
                  href={`/${validLocale}/login`}
                  onMouseEnter={() => setHoveredButton('login')}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="bg-parque-purple text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                  style={{ backgroundColor: hoveredButton === 'login' ? '#452a66' : '#563380' }}
                >
                  {t.login}
                </a>
              </div>
              
              {showLanguageSwitcher && (
                <LanguageSwitcher className="ml-2" locale={validLocale} />
              )}
            </div>

            {/* Mobile - Clean hamburger only (no box) */}
            <button
              onClick={handleMobileMenuToggle}
              className="lg:hidden p-2 -mr-2 active:scale-95 transition-transform"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`block w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-[9px]' : ''
                }`}></span>
                <span className={`block w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 scale-0' : ''
                }`}></span>
                <span className={`block w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''
                }`}></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Subtle purple accent line at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-parque-purple/40 to-transparent transition-opacity duration-300 ${
          scrolled ? 'opacity-100' : 'opacity-50'
        }`}></div>
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
        <div className={`absolute top-14 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xl transition-all duration-300 max-h-[calc(100vh-3.5rem)] overflow-y-auto ${
          isMobileMenuOpen 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0'
        }`}>
          <div className="container mx-auto px-3 py-3">
            <div className="flex flex-col space-y-1">
              <MobileMenuItem href="/" label={t.home} pageKey="home" />
              <MobileMenuItem href={`/${validLocale === 'es' ? 'ligas' : 'leagues'}`} label={t.leagues} pageKey="leagues" />
              <MobileMenuItem href={`/${validLocale === 'es' ? 'clubes' : 'clubs'}`} label={t.clubs} pageKey="clubs" />
              <MobileMenuItem href={`/${validLocale === 'es' ? 'reglas' : 'rules'}`} label={t.rules} pageKey="rules" />
              <MobileMenuItem href="/swiss" label={t.swiss} pageKey="swiss" />
              <MobileMenuItem href="/elo" label={t.elo} pageKey="elo" />
              <MobileMenuItem href="/openrank" label={t.openrank} pageKey="openrank" />
              
              {/* Login Button */}
              <div className="pt-3 mt-2 border-t border-gray-200">
                <a
                  href={`/${validLocale}/login`}
                  onClick={handleLoginTap}
                  className={`block w-full text-center py-3 px-4 rounded-xl transition-all duration-150 font-medium ${
                    tappedItem === 'login'
                      ? 'bg-parque-purple/80 text-white scale-[0.98]'
                      : 'bg-parque-purple text-white hover:bg-parque-purple/90'
                  }`}
                >
                  {t.login}
                </a>
              </div>
              
              {/* Language Switcher - segmented toggle for mobile */}
              {showLanguageSwitcher && (
                <div className="pt-3 mt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center px-3 py-2">
                    <LanguageSwitcherToggle locale={validLocale} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen loading overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center">
          <TennisPreloader 
            size="lg" 
            locale={validLocale}
          />
        </div>
      )}
    </>
  )
}
