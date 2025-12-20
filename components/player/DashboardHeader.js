'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getMaskedName, isDemoModeActive } from '@/lib/utils/demoMode'

export default function DashboardHeader({ player, language }) {
  const params = useParams()
  const locale = params?.locale || 'es'
  const [isDemoMode, setIsDemoMode] = useState(false)
  
  useEffect(() => {
    setIsDemoMode(isDemoModeActive())
  }, [])
  
  // Count leagues if player has registrations
  const leagueCount = player?.registrations?.length || 0
  const isMultiLeague = leagueCount > 1
  
  // Get display name (masked if demo mode)
  const displayName = isDemoMode ? getMaskedName(player.name) : player.name
  const firstName = displayName.split(' ')[0]
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600 text-white p-4 sm:p-8 shadow-xl -mx-2 -mt-4 sm:mx-0 sm:mt-0 sm:rounded-2xl">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-16 -right-16 w-64 h-64 sm:-top-24 sm:-right-24 sm:w-96 sm:h-96 bg-white rounded-full"></div>
        <div className="absolute -bottom-16 -left-16 w-44 h-44 sm:-bottom-24 sm:-left-24 sm:w-64 sm:h-64 bg-white rounded-full"></div>
      </div>
      
      {/* Decorative tennis ball icon */}
      <svg className="absolute top-3 right-3 w-20 h-20 text-white/10 sm:w-32 sm:h-32 sm:top-6 sm:right-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9C7.33 8.64 9.57 10 12 10s4.67-1.36 6.31-2.9C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" fill="currentColor" opacity="0.3"/>
      </svg>
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="animate-slide-in-left">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            {/* Mobile Logo - inline with greeting */}
            <div className="w-9 h-9 bg-white/30 rounded-lg flex items-center justify-center p-1 sm:hidden">
              <Image 
                src="/logo-big.png" 
                alt="Tenis del Parque" 
                width={26} 
                height={26}
                className="object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold">
              {language === 'es' ? '¡Hola' : 'Hello'}, {firstName}!
            </h1>
          </div>
          <p className="text-purple-100 text-sm sm:text-base">
            {language === 'es' 
              ? 'Tu centro de control personal de tenis'
              : 'Your personal tennis command center'}
          </p>
          {/* Multi-league badge - hidden on mobile */}
          {isMultiLeague && (
            <div className="mt-3 hidden sm:inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              {language === 'es' 
                ? `${leagueCount} Ligas Activas` 
                : `${leagueCount} Active Leagues`}
            </div>
          )}
        </div>
        <div className="flex flex-row gap-2 sm:gap-3 animate-slide-in-right">
          <Link
            href={`/${locale}/player/matches`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium shadow-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2 A10 10 0 0 1 12 22 M12 2 A10 10 0 0 0 12 22"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
            <span className="hidden sm:inline">{language === 'es' ? 'Mis Partidos' : 'My Matches'}</span>
            <span className="sm:hidden">{language === 'es' ? 'Partidos' : 'Matches'}</span>
          </Link>
          <Link
            href={`/${locale}/player/league`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all transform hover:scale-105 active:scale-95 text-sm font-medium shadow-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="hidden sm:inline">
              {isMultiLeague 
                ? (language === 'es' ? 'Mis Ligas' : 'My Leagues')
                : (language === 'es' ? 'Ver Liga' : 'View League')}
            </span>
            <span className="sm:hidden">
              {isMultiLeague 
                ? (language === 'es' ? 'Ligas' : 'Leagues')
                : (language === 'es' ? 'Liga' : 'League')}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
