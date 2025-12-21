import React from 'react'

/**
 * ============================================================================
 * 🎾 STANDARDIZED TENNIS PRELOADER - THE ONLY LOADING COMPONENT TO USE!
 * ============================================================================
 * 
 * This is a Server Component - no "use client" needed!
 * Animations are defined in tailwind.config.js
 */

const SIZES = {
  sm: { width: 24, height: 24 },
  md: { width: 40, height: 40 }, 
  lg: { width: 56, height: 56 },
  xl: { width: 80, height: 80 }
}

const TEXT_SIZES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg', 
  xl: 'text-xl'
}

// Tennis Ball SVG Component
function TennisBall({ size = 'md' }) {
  const { width, height } = SIZES[size]
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 56 56" 
      className="tennis-ball-svg"
    >
      <defs>
        {/* Tennis ball gradient */}
        <radialGradient id="ballGradient" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#E4FF1A" />
          <stop offset="60%" stopColor="#C6E600" />
          <stop offset="100%" stopColor="#9EBF00" />
        </radialGradient>
        
        {/* Subtle shadow gradient */}
        <radialGradient id="shadowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Tennis ball */}
      <circle 
        cx="28" 
        cy="28" 
        r="26" 
        fill="url(#ballGradient)"
        stroke="#9EBF00"
        strokeWidth="1"
      />
      
      {/* Tennis ball seam - left curve */}
      <path 
        d="M8 18 Q18 28 8 38"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      
      {/* Tennis ball seam - right curve */}
      <path 
        d="M48 18 Q38 28 48 38"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      
      {/* Highlight */}
      <ellipse 
        cx="20" 
        cy="18" 
        rx="8" 
        ry="5"
        fill="#fff"
        opacity="0.4"
      />
    </svg>
  )
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
    ? 'min-h-screen bg-gradient-to-b from-purple-50 via-white to-white flex items-center justify-center'
    : 'flex items-center justify-center'

  return (
    <div className={`${containerClasses} ${className}`} role="status" aria-label={displayText}>
      <div className="text-center">
        {/* Bouncing Tennis Ball */}
        <div className="relative mx-auto mb-4 flex flex-col items-center">
          <div className="animate-tennis-bounce">
            <TennisBall size={size} />
          </div>
          
          {/* Shadow that scales with bounce */}
          <div 
            className="-mt-1 bg-purple-900/50 rounded-full blur-sm animate-tennis-shadow"
            style={{ 
              width: SIZES[size].width * 0.6,
              height: 5,
            }}
          />
        </div>

        {/* Loading Text */}
        <div className={`text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-purple-600 ${TEXT_SIZES[size]} font-medium`}>
          {displayText}
        </div>

        {/* Animated dots */}
        <div className="flex justify-center mt-3 space-x-1.5">
          <div className="w-2 h-2 bg-gradient-to-r from-parque-purple to-purple-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-parque-purple rounded-full animate-bounce"></div>
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
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 250px)' }}>
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
