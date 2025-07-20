'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import { TennisBallIcon } from '../ui/TennisIcons'

export default function Navigation({ currentPage = 'home', language, onLanguageChange, showLanguageSwitcher = true }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHomeSectionsOpen, setIsHomeSectionsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)
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
    setIsHomeSectionsOpen(false)
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
      contact: 'Contacto',
      sections: {
        features: 'Características',
        howItWorks: 'Cómo funciona',
        levels: 'Niveles',
        platform: 'Plataforma',
        testimonials: 'Testimonios',
        faq: 'Preguntas',
        signup: 'Inscripción'
      }
    },
    en: {
      home: 'Home',
      leagues: 'Leagues',
      rules: 'Rules',
      elo: 'ELO Points',
      swiss: 'Swiss System',
      login: 'Login',
      about: 'About',
      contact: 'Contact',
      sections: {
        features: 'Features',
        howItWorks: 'How it works',
        levels: 'Levels',
        platform: 'Platform',
        testimonials: 'Testimonials',
        faq: 'FAQ',
        signup: 'Sign up'
      }
    }
  }

  // Add fallback to ensure t is always defined
  const validLocale = navContent[locale] ? locale : 'es'
  const t = navContent[validLocale]

  const handleMobileMenuToggle = () => {
    if (!isClient) return // Prevent interaction before hydration
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsHomeSectionsOpen(false)
  }

  const handleSectionClick = (sectionId, closeMobileMenu = false) => {
    if (!isClient) return // Prevent interaction before hydration
    
    if (currentPage !== 'home') {
      // If not on home page, navigate to home page with section
      window.location.href = `/${validLocale}#${sectionId}`
    } else {
      // If on home page, scroll to section
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    
    if (closeMobileMenu) {
      setIsMobileMenuOpen(false)
    }
    setIsHomeSectionsOpen(false)
  }

  const NavLink = ({ href, children, onClick }) => {
    // Convert href to locale-based href - only after hydration
    const localizedHref = isClient && href.startsWith('/') ? `/${validLocale}${href}` : href
    const isActive = isClient && (pathname === localizedHref || (href === '/' && pathname === `/${validLocale}`))
    
    return (
      <Link 
        href={localizedHref} 
        onClick={onClick}
        className={`relative transition-colors font-medium group block py-2 md:py-0 ${
          isActive
            ? 'text-parque-purple' 
            : 'text-gray-700 hover:text-parque-purple'
        }`}
      >
        {children}
        {isActive && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple hidden md:block"></div>
        )}
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left hidden md:block"></div>
      </Link>
    )
  }

  const SectionLink = ({ sectionId, children, mobile = false }) => (
    <button
      onClick={() => handleSectionClick(sectionId, mobile)}
      className="text-left w-full py-2 px-3 text-gray-600 hover:text-parque-purple hover:bg-parque-purple/5 rounded-lg transition-all duration-200 text-sm"
      disabled={!isClient}
    >
      {children}
    </button>
  )

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
              <Link href={`/${validLocale}`} className="group flex items-center space-x-2 transform hover:scale-105 transition-transform">
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
                {/* Home with dropdown for sections */}
                <div className="relative group">
                  <NavLink href="/">{t.home}</NavLink>
                  {/* Home sections dropdown */}
                  {currentPage === 'home' && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <SectionLink sectionId="features">{t.sections.features}</SectionLink>
                      <SectionLink sectionId="how-it-works">{t.sections.howItWorks}</SectionLink>
                      <SectionLink sectionId="levels">{t.sections.levels}</SectionLink>
                      <SectionLink sectionId="platform">{t.sections.platform}</SectionLink>
                      <SectionLink sectionId="testimonials">{t.sections.testimonials}</SectionLink>
                      <SectionLink sectionId="faq">{t.sections.faq}</SectionLink>
                      <SectionLink sectionId="signup">{t.sections.signup}</SectionLink>
                    </div>
                  )}
                </div>
                <NavLink href={`/${validLocale === 'es' ? 'ligas' : 'leagues'}`}>{t.leagues}</NavLink>
                <NavLink href={`/${validLocale === 'es' ? 'reglas' : 'rules'}`}>{t.rules}</NavLink>
                <NavLink href="/swiss">{t.swiss}</NavLink>
                <NavLink href="/elo">{t.elo}</NavLink>
              </div>
              
              {/* Login Button */}
              <div className="ml-4">
                <a
                  href={`/${validLocale}/login`}
                  className="bg-parque-purple text-white px-4 py-2 rounded-lg hover:bg-parque-purple/90 transition-colors font-medium text-sm"
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
                className="flex flex-col justify-center items-center w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:border-parque-purple transition-all duration-300 group"
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
                >
                  <div className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 ${
                    currentPage === 'home' 
                      ? 'bg-gradient-to-r from-parque-purple/10 to-transparent border-l-4 border-parque-purple' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <span className="text-lg font-medium">{t.home}</span>
                    <div className="flex items-center gap-2">
                      {currentPage === 'home' && (
                        <div className="w-2 h-2 bg-parque-purple rounded-full"></div>
                      )}
                      {currentPage === 'home' && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsHomeSectionsOpen(!isHomeSectionsOpen)
                          }}
                          className="flex items-center justify-center w-6 h-6 hover:bg-parque-purple/10 rounded-md transition-colors"
                        >
                          <svg className={`w-4 h-4 text-parque-purple transition-transform ${isHomeSectionsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </NavLink>
                
                {/* Home Page Sections - Mobile */}
                {currentPage === 'home' && (
                  <div className={`transition-all duration-300 overflow-hidden ml-4 ${
                    isHomeSectionsOpen ? 'max-h-screen opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="bg-gray-50/50 rounded-xl p-3 space-y-1">
                      <SectionLink sectionId="features" mobile>{t.sections.features}</SectionLink>
                      <SectionLink sectionId="how-it-works" mobile>{t.sections.howItWorks}</SectionLink>
                      <SectionLink sectionId="levels" mobile>{t.sections.levels}</SectionLink>
                      <SectionLink sectionId="platform" mobile>{t.sections.platform}</SectionLink>
                      <SectionLink sectionId="testimonials" mobile>{t.sections.testimonials}</SectionLink>
                      <SectionLink sectionId="faq" mobile>{t.sections.faq}</SectionLink>
                      <SectionLink sectionId="signup" mobile>{t.sections.signup}</SectionLink>
                    </div>
                  </div>
                )}
              </div>
              
              <NavLink 
                href={`/${validLocale === 'es' ? 'ligas' : 'leagues'}`} 
                onClick={() => setIsMobileMenuOpen(false)}
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
