'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function RegistrationCountdown({ registrationEnd, language = 'es', compact = false, darkMode = false, purple = false }) {
  const [timeLeft, setTimeLeft] = useState(null)
  const [isExpired, setIsExpired] = useState(false)

  const t = {
    es: {
      registrationClosesIn: 'Inscripciones cierran en',
      days: 'd',
      hours: 'h',
      minutes: 'm',
      seconds: 's',
      registrationClosed: 'Inscripciones cerradas'
    },
    en: {
      registrationClosesIn: 'Registration closes in',
      days: 'd',
      hours: 'h',
      minutes: 'm',
      seconds: 's',
      registrationClosed: 'Registration closed'
    }
  }

  const content = t[language]

  useEffect(() => {
    if (!registrationEnd) return

    const calculateTimeLeft = () => {
      const difference = new Date(registrationEnd) - new Date()
      
      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft(null)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds })
      setIsExpired(false)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [registrationEnd])

  if (!registrationEnd) return null

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        darkMode 
          ? 'bg-red-500/20 border border-red-400/30' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <Clock className={`w-4 h-4 ${darkMode ? 'text-red-300' : 'text-red-600'}`} />
        <span className={`text-sm font-medium ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
          {content.registrationClosed}
        </span>
      </div>
    )
  }

  if (!timeLeft) return null

  // Determine urgency level for styling
  const totalHours = timeLeft.days * 24 + timeLeft.hours
  
  // Dark mode styles
  if (darkMode) {
    let bgColor = 'bg-white/10'
    let borderColor = 'border-white/20'
    let textColor = 'text-white'
    let labelColor = 'text-white/70'

    if (totalHours <= 24) {
      bgColor = 'bg-red-500/20'
      borderColor = 'border-red-400/30'
      textColor = 'text-red-200'
      labelColor = 'text-red-300/70'
    } else if (totalHours <= 72) {
      bgColor = 'bg-orange-500/20'
      borderColor = 'border-orange-400/30'
      textColor = 'text-orange-200'
      labelColor = 'text-orange-300/70'
    }

    return (
      <div className={`flex items-center gap-2 sm:gap-3 ${bgColor} border ${borderColor} rounded-lg p-2 sm:p-3`}>
        <Clock className={`w-4 h-4 ${textColor} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] sm:text-xs font-semibold ${labelColor} uppercase tracking-wide`}>
            {content.registrationClosesIn}
          </p>
          <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
            {timeLeft.days > 0 && (
              <div className="text-center">
                <span className={`text-sm sm:text-lg font-bold ${textColor} tabular-nums`}>
                  {timeLeft.days}
                </span>
                <span className={`text-[10px] sm:text-xs ${labelColor} ml-0.5`}>
                  {content.days}
                </span>
              </div>
            )}
            
            <div className="text-center">
              <span className={`text-sm sm:text-lg font-bold ${textColor} tabular-nums`}>
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className={`text-[10px] sm:text-xs ${labelColor} ml-0.5`}>
                {content.hours}
              </span>
            </div>
            
            <span className={`${textColor} font-bold text-sm sm:text-base`}>:</span>
            
            <div className="text-center">
              <span className={`text-sm sm:text-lg font-bold ${textColor} tabular-nums`}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className={`text-[10px] sm:text-xs ${labelColor} ml-0.5`}>
                {content.minutes}
              </span>
            </div>
            
            <span className={`${textColor} font-bold text-sm sm:text-base`}>:</span>
            
            <div className="text-center">
              <span className={`text-sm sm:text-lg font-bold ${textColor} tabular-nums`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className={`text-[10px] sm:text-xs ${labelColor} ml-0.5`}>
                {content.seconds}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Purple theme (brand color)
  if (purple) {
    let textColor = 'text-parque-purple'
    let labelColor = 'text-parque-purple/70'
    let iconColor = 'text-parque-purple'

    // Still show urgency
    if (totalHours <= 24) {
      textColor = 'text-red-600'
      labelColor = 'text-red-600/70'
      iconColor = 'text-red-600'
    } else if (totalHours <= 72) {
      textColor = 'text-orange-600'
      labelColor = 'text-orange-600/70'
      iconColor = 'text-orange-600'
    }

    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Clock className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] sm:text-xs font-semibold ${labelColor} uppercase tracking-wide`}>
            {content.registrationClosesIn}
          </p>
          <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
            {timeLeft.days > 0 && (
              <div className="text-center">
                <span className={`text-base sm:text-xl font-bold ${textColor} tabular-nums`}>
                  {timeLeft.days}
                </span>
                <span className={`text-[10px] sm:text-xs ${labelColor} ml-0.5`}>
                  {content.days}
                </span>
              </div>
            )}
            
            <div className="text-center">
              <span className={`text-base sm:text-xl font-bold ${textColor} tabular-nums`}>
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className={`text-[10px] sm:text-xs ${labelColor} ml-0.5`}>
                {content.hours}
              </span>
            </div>
            
            <span className={`${textColor} font-bold text-sm sm:text-base`}>:</span>
            
            <div className="text-center">
              <span className={`text-base sm:text-xl font-bold ${textColor} tabular-nums`}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className={`text-[10px] sm:text-xs ${labelColor} ml-0.5`}>
                {content.minutes}
              </span>
            </div>
            
            <span className={`${textColor} font-bold text-sm sm:text-base`}>:</span>
            
            <div className="text-center">
              <span className={`text-base sm:text-xl font-bold ${textColor} tabular-nums`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className={`text-[10px] sm:text-xs ${labelColor} ml-0.5`}>
                {content.seconds}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Light mode styles (default)
  let bgColor = 'bg-blue-50'
  let borderColor = 'border-blue-200'
  let textColor = 'text-blue-700'
  let iconColor = 'text-blue-600'

  if (totalHours <= 24) {
    bgColor = 'bg-red-50'
    borderColor = 'border-red-200'
    textColor = 'text-red-700'
    iconColor = 'text-red-600'
  } else if (totalHours <= 72) {
    bgColor = 'bg-orange-50'
    borderColor = 'border-orange-200'
    textColor = 'text-orange-700'
    iconColor = 'text-orange-600'
  }

  // Compact version for mobile
  if (compact) {
    return (
      <div className={`flex items-center gap-2 sm:gap-3 ${bgColor} border ${borderColor} rounded-lg p-2 sm:p-3`}>
        <Clock className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] sm:text-xs font-semibold ${textColor} uppercase tracking-wide`}>
            {content.registrationClosesIn}
          </p>
          <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
            {timeLeft.days > 0 && (
              <div className="text-center">
                <span className={`text-sm sm:text-lg font-bold ${textColor} tabular-nums`}>
                  {timeLeft.days}
                </span>
                <span className={`text-[10px] sm:text-xs ${textColor} ml-0.5`}>
                  {content.days}
                </span>
              </div>
            )}
            
            <div className="text-center">
              <span className={`text-sm sm:text-lg font-bold ${textColor} tabular-nums`}>
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className={`text-[10px] sm:text-xs ${textColor} ml-0.5`}>
                {content.hours}
              </span>
            </div>
            
            <span className={`${textColor} font-bold text-sm sm:text-base`}>:</span>
            
            <div className="text-center">
              <span className={`text-sm sm:text-lg font-bold ${textColor} tabular-nums`}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className={`text-[10px] sm:text-xs ${textColor} ml-0.5`}>
                {content.minutes}
              </span>
            </div>
            
            <span className={`${textColor} font-bold text-sm sm:text-base`}>:</span>
            
            <div className="text-center">
              <span className={`text-sm sm:text-lg font-bold ${textColor} tabular-nums`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className={`text-[10px] sm:text-xs ${textColor} ml-0.5`}>
                {content.seconds}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full version
  return (
    <div className={`flex items-start gap-3 ${bgColor} border ${borderColor} rounded-lg p-3`}>
      <div className="mt-0.5">
        <Clock className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className={`text-xs font-semibold ${textColor} mb-1 uppercase tracking-wide`}>
          {content.registrationClosesIn}
        </p>
        <div className="flex items-center gap-2">
          {timeLeft.days > 0 && (
            <div className="text-center">
              <span className={`text-lg font-bold ${textColor} tabular-nums`}>
                {timeLeft.days}
              </span>
              <span className={`text-xs ${textColor} ml-0.5`}>
                {content.days}
              </span>
            </div>
          )}
          
          <div className="text-center">
            <span className={`text-lg font-bold ${textColor} tabular-nums`}>
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className={`text-xs ${textColor} ml-0.5`}>
              {content.hours}
            </span>
          </div>
          
          <span className={`${textColor} font-bold`}>:</span>
          
          <div className="text-center">
            <span className={`text-lg font-bold ${textColor} tabular-nums`}>
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className={`text-xs ${textColor} ml-0.5`}>
              {content.minutes}
            </span>
          </div>
          
          <span className={`${textColor} font-bold`}>:</span>
          
          <div className="text-center">
            <span className={`text-lg font-bold ${textColor} tabular-nums`}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className={`text-xs ${textColor} ml-0.5`}>
              {content.seconds}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
