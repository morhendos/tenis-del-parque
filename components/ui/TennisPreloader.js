import React from 'react'
import Image from 'next/image'

/**
 * ============================================================================
 * 🎾 STANDARDIZED TENNIS PRELOADER - THE ONLY LOADING COMPONENT TO USE!
 * ============================================================================
 * 
 * This is a Server Component - no "use client" needed!
 * Animations are defined in tailwind.config.js
 * 
 * Uses an image instead of emoji for consistent cross-platform appearance
 */

const SIZES = {
  sm: { ball: 28, shadow: 14 },
  md: { ball: 40, shadow: 24 }, 
  lg: { ball: 52, shadow: 34 },
  xl: { ball: 64, shadow: 48 }
}

const TEXT_SIZES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg', 
  xl: 'text-xl'
}

export default function TennisPreloader({ 
  size = 'md',
  fullScreen = false,
  text,
  locale = 'en',
  className = ''
}) {
  const defaultText = locale === 'es' ? 'Cargando...' : 'Loading...'
  const displayText = text || defaultText

  const containerClasses = fullScreen 
    ? 'min-h-screen bg-gradient-to-b from-purple-50 via-white to-white flex items-center justify-center pb-20'
    : 'flex items-center justify-center'

  return (
    <div className={`${containerClasses} ${className}`} role="status" aria-label={displayText}>
      <div className="text-center">
        {/* Bouncing Tennis Ball Image */}
        <div className="relative mx-auto mb-4 flex flex-col items-center">
          <div className="animate-tennis-bounce">
            <Image 
              src="/tennis-ball.webp" 
              alt="Tennis ball" 
              width={SIZES[size].ball} 
              height={SIZES[size].ball}
              priority
            />
          </div>
          
          {/* Shadow that scales with bounce */}
          <div 
            className="-mt-1 bg-purple-900/50 rounded-full blur-sm animate-tennis-shadow"
            style={{ 
              width: SIZES[size].shadow,
              height: 5,
            }}
          />
        </div>

        {/* Loading Text */}
        <div className={`text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-purple-600 ${TEXT_SIZES[size]} font-medium`}>
          {displayText}
        </div>
      </div>
    </div>
  )
}

// Convenience components for common use cases
export function TennisPreloaderFullScreen({ text, locale = 'en' }) {
  return (
    <TennisPreloader 
      size="lg" 
      fullScreen={true}
      text={text}
      locale={locale}
    />
  )
}

export function TennisPreloaderInline({ size = 'md', text, locale = 'en', className = '' }) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <TennisPreloader 
        size={size}
        fullScreen={false}
        text={text}
        locale={locale}
        className={className}
      />
    </div>
  )
}

export function TennisPreloaderSmall({ text, locale = 'en' }) {
  return (
    <TennisPreloader 
      size="sm"
      fullScreen={false}
      text={text}
      locale={locale}
      className="py-4"
    />
  )
}
