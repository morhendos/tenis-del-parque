'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TennisBallIcon } from '../ui/TennisIcons'

export default function Navigation({ currentPage = 'home', language, onLanguageChange }) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navContent = {
    es: {
      home: 'Inicio',
      rules: 'Reglamento',
      elo: 'Sistemas ELO y Suizo',
      about: 'Acerca de',
      contact: 'Contacto'
    },
    en: {
      home: 'Home',
      rules: 'Rules',
      elo: 'ELO & Swiss Systems',
      about: 'About',
      contact: 'Contact'
    }
  }

  const t = navContent[language]

  const handleLanguageChange = (lang) => {
    onLanguageChange(lang)
    setIsLangMenuOpen(false)
  }

  return (
    <>
      <nav className={`fixed top-0 w-full backdrop-blur-md z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-lg' : 'bg-white/70'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="group flex items-center space-x-2 transform hover:scale-105 transition-transform">
                <div className="relative h-10 w-40">
                  <Image
                    src="/logo-horizontal-02.png"
                    alt="Tenis del Parque"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link 
                  href="/" 
                  className={`relative transition-colors font-medium group ${
                    currentPage === 'home' 
                      ? 'text-parque-purple' 
                      : 'text-gray-700 hover:text-parque-purple'
                  }`}
                >
                  {t.home}
                  {currentPage === 'home' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple"></div>
                  )}
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>
                
                <Link 
                  href="/rules" 
                  className={`relative transition-colors font-medium group ${
                    currentPage === 'rules' 
                      ? 'text-parque-purple' 
                      : 'text-gray-700 hover:text-parque-purple'
                  }`}
                >
                  {t.rules}
                  {currentPage === 'rules' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple"></div>
                  )}
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>
                
                <Link 
                  href="/elo" 
                  className={`relative transition-colors font-medium group ${
                    currentPage === 'elo' 
                      ? 'text-parque-purple' 
                      : 'text-gray-700 hover:text-parque-purple'
                  }`}
                >
                  {t.elo}
                  {currentPage === 'elo' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple"></div>
                  )}
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-parque-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-2 rounded-xl hover:border-parque-purple hover:shadow-md transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="text-gray-700 font-medium">
                  {language === 'es' ? 'Español' : 'English'}
                </span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 py-1 animate-fadeIn">
                  <button
                    onClick={() => handleLanguageChange('es')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors relative group ${
                      language === 'es' ? 'bg-parque-purple/10' : ''
                    }`}
                  >
                    <span className="text-2xl">🇪🇸</span>
                    <span className={`font-medium ${language === 'es' ? 'text-parque-purple' : 'text-gray-700'}`}>
                      Español
                    </span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors relative group ${
                      language === 'en' ? 'bg-parque-purple/10' : ''
                    }`}
                  >
                    <span className="text-2xl">🇬🇧</span>
                    <span className={`font-medium ${language === 'en' ? 'text-parque-purple' : 'text-gray-700'}`}>
                      English
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tennis court line decoration at bottom of nav when scrolled */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        )}
      </nav>

      {/* Click outside to close language menu */}
      {isLangMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsLangMenuOpen(false)}
        />
      )}
    </>
  )
}