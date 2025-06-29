'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TennisBallIcon } from '../ui/TennisIcons'

export default function Navigation({ currentPage = 'home', language, onLanguageChange }) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHomeSectionsOpen, setIsHomeSectionsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus when route changes or clicking outside
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsLangMenuOpen(false)
    setIsHomeSectionsOpen(false)
  }, [currentPage])

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
      rules: 'Reglamento',
      elo: 'Sistemas ELO y Suizo',
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
      rules: 'Rules',
      elo: 'ELO & Swiss Systems',
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

  const t = navContent[language]

  const handleLanguageChange = (lang) => {
    onLanguageChange(lang)
    setIsLangMenuOpen(false)
    setIsMobileMenuOpen(false)
    setIsHomeSectionsOpen(false)
  }

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsLangMenuOpen(false)
    setIsHomeSectionsOpen(false)
  }

  const handleSectionClick = (sectionId, closeMobileMenu = false) => {
    if (currentPage !== 'home') {
      // If not on home page, navigate to home page with section
      window.location.href = `/#${sectionId}`
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

  const NavLink = ({ href, children, onClick }) => (
    <Link 
      href={href} 
      onClick={onClick}
      className={`relative transition-colors font-medium group block py-2 md:py-0 ${
        currentPage === href.slice(1) || (href === '/' && currentPage === 'home')
          ? 'text-parque-purple' 
          : 'text-gray-700 hover:text-parque-purple'
      }`}
    >
      {children}
      {(currentPage === href.slice(1) || (href === '/' && currentPage === 'home')) && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple hidden md:block"></div>
      )}
      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left hidden md:block"></div>
    </Link>
  )

  const SectionLink = ({ sectionId, children, mobile = false }) => (
    <button
      onClick={() => handleSectionClick(sectionId, mobile)}
      className="text-left w-full py-2 px-3 text-gray-600 hover:text-parque-purple hover:bg-parque-purple/5 rounded-lg transition-all duration-200 text-sm"
    >
      {children}
    </button>
  )

  return (
    <>
      <nav className={`fixed top-0 w-full backdrop-blur-md z-[100] transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-lg' : 'bg-white/70'
      }`}>
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-2 transform hover:scale-105 transition-transform">
                <Image
                  src="/logo-horizontal-big.png"
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
                <NavLink href="/rules">{t.rules}</NavLink>
                <NavLink href="/elo">{t.elo}</NavLink>
              </div>
              
              {/* Desktop Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-xl hover:border-parque-purple hover:shadow-md transition-all duration-300 group"
                >
                  <span className="text-gray-700 font-medium">
                    {language === 'es' ? 'ES' : 'EN'}
                  </span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 py-2 animate-fadeIn">
                    <button
                      onClick={() => handleLanguageChange('es')}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-all duration-200 group ${
                        language === 'es' ? 'bg-gradient-to-r from-parque-purple/10 to-transparent' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🇪🇸</span>
                        <span className={`font-medium ${language === 'es' ? 'text-parque-purple' : 'text-gray-700'}`}>
                          Español
                        </span>
                      </div>
                      {language === 'es' && (
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-parque-purple text-white animate-scaleIn">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-all duration-200 group ${
                        language === 'en' ? 'bg-gradient-to-r from-parque-purple/10 to-transparent' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🇬🇧</span>
                        <span className={`font-medium ${language === 'en' ? 'text-parque-purple' : 'text-gray-700'}`}>
                          English
                        </span>
                      </div>
                      {language === 'en' && (
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-parque-purple text-white animate-scaleIn">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button & Language Selector */}
            <div className="flex items-center space-x-3 lg:hidden">
              {/* Mobile Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm border border-gray-200 px-3 py-2 rounded-lg hover:border-parque-purple transition-all duration-300"
                >
                  <span className="text-gray-700 font-medium text-sm">
                    {language === 'es' ? 'ES' : 'EN'}
                  </span>
                  <svg className={`w-3 h-3 text-gray-500 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 py-2 animate-fadeIn">
                    <button
                      onClick={() => handleLanguageChange('es')}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-all duration-200 ${
                        language === 'es' ? 'bg-gradient-to-r from-parque-purple/10 to-transparent' : ''
                      }`}
                    >
                      <span className="text-lg">🇪🇸</span>
                      <span className={`font-medium text-sm ${language === 'es' ? 'text-parque-purple' : 'text-gray-700'}`}>
                        Español
                      </span>
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-all duration-200 ${
                        language === 'en' ? 'bg-gradient-to-r from-parque-purple/10 to-transparent' : ''
                      }`}
                    >
                      <span className="text-lg">🇬🇧</span>
                      <span className={`font-medium text-sm ${language === 'en' ? 'text-parque-purple' : 'text-gray-700'}`}>
                        English
                      </span>
                    </button>
                  </div>
                )}
              </div>

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
                href="/rules" 
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
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close language menu (desktop) */}
      {isLangMenuOpen && (
        <div 
          className="fixed inset-0 z-[85]" 
          onClick={() => setIsLangMenuOpen(false)}
        />
      )}
    </>
  )
}
