import React from 'react'

/**
 * Standardized Tennis-themed Preloader Component
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - fullScreen: boolean - when true, takes full viewport height
 * - text: string - custom loading text (optional)
 * - locale: 'es' | 'en' - for default loading text localization
 */

const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16', 
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
}

const TEXT_SIZES = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl', 
  xl: 'text-2xl'
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
    ? 'min-h-screen bg-gradient-to-b from-parque-bg via-white to-white flex items-center justify-center'
    : 'flex items-center justify-center'

  return (
    <div className={`${containerClasses} ${className}`} role="status" aria-label={displayText}>
      <div className="text-center">
        {/* Tennis Ball with Enhanced Animation */}
        <div className="relative mx-auto mb-4">
          {/* Tennis Ball */}
          <div className={`${SIZES[size]} tennis-ball mx-auto animate-bounce`}>
            {/* Additional glow effect for premium feel */}
            <div className={`absolute inset-0 ${SIZES[size]} tennis-ball opacity-50 animate-ping`}></div>
          </div>
          
          {/* Subtle shadow */}
          <div className={`${SIZES[size]} bg-black/10 rounded-full blur-sm mx-auto -mt-2 animate-pulse`} 
               style={{height: '8px', transform: 'scaleX(0.8)'}}></div>
        </div>

        {/* Loading Text */}
        <div className={`text-parque-purple/70 ${TEXT_SIZES[size]} font-light animate-pulse`}>
          {displayText}
        </div>

        {/* Optional: Tennis-themed loading dots */}
        <div className="flex justify-center mt-3 space-x-1">
          <div className="w-2 h-2 bg-parque-green/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-parque-green/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-parque-green/60 rounded-full animate-bounce"></div>
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

export function TennisPreloaderInline({ size = 'md', text, locale = 'en' }) {
  return (
    <TennisPreloader 
      size={size}
      fullScreen={false}
      text={text}
      locale={locale}
      className="py-8"
    />
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
