import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../lib/hooks/useLanguage'
import { welcomeContent } from '../../lib/content/welcomeContent'
import Image from 'next/image'

export default function WelcomeModal({ isOpen, onClose, playerName }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  const contentRef = useRef(null)
  
  const t = welcomeContent[language]
  
  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  
  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      setIsVisible(false)
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  // Auto-scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [currentStep])
  
  if (!isOpen || !mounted) return null

  const steps = [
    'welcome',
    'encouragement',
    'rules',
    'nextSteps'
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    const step = steps[currentStep]
    
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            {/* Logo and Title */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-parque-purple/10 to-green-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Image 
                  src="/logo-big.png" 
                  alt="Tenis del Parque" 
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t.title}
              </h2>
              <p className="text-gray-500 mt-1">
                {t.subtitle}
              </p>
            </div>
            
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <h3 className="text-xl font-semibold text-emerald-700 mb-3">
                {t.playerGreeting.replace('{playerName}', playerName)}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t.introduction}
              </p>
            </div>
          </div>
        )
        
      case 'rules':
        // Elegant SVG icons for each rule
        const ruleIcons = [
          // Schedule/Clock
          <svg key="clock" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>,
          // Trophy/Scoring
          <svg key="trophy" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>,
          // Chat/Coordinate
          <svg key="chat" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>,
          // Heart/Fair Play
          <svg key="heart" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>,
          // Chart/OpenRank
          <svg key="chart" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ]
        
        const ruleColors = [
          'from-blue-500 to-indigo-500',
          'from-amber-500 to-orange-500', 
          'from-emerald-500 to-teal-500',
          'from-pink-500 to-rose-500',
          'from-purple-500 to-violet-500'
        ]
        
        return (
          <div className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-parque-purple/10 rounded-xl mb-3">
                <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {language === 'es' ? 'Reglas Importantes' : 'Important Rules'}
              </h3>
            </div>
            
            <div className="space-y-3">
              {t.rules.items.map((rule, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${ruleColors[index]} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
                      {ruleIcons[index]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {rule.title}
                      </h4>
                      <p className="text-gray-500 text-sm mt-0.5">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
        
      case 'encouragement':
        return (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-2">
              <span className="text-3xl">🏆</span>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <h3 className="text-xl font-bold text-amber-800 mb-3">
                {t.encouragement.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t.encouragement.message}
              </p>
            </div>
            
            <div className="flex justify-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-lg">🎾</span>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '0.1s'}}>
                <span className="text-lg">🏆</span>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '0.2s'}}>
                <span className="text-lg">🎉</span>
              </div>
            </div>
          </div>
        )
        
      case 'nextSteps':
        return (
          <div className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {t.nextSteps.title}
              </h3>
            </div>
            
            <div className="space-y-2">
              {t.nextSteps.items.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-parque-purple to-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm">
                    {step}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 text-center">
              <p className="text-lg font-semibold text-emerald-700 mb-1">
                {language === 'es' ? '¡Buena suerte!' : 'Good luck!'} 🍀
              </p>
              <p className="text-gray-600 text-sm">
                {language === 'es' 
                  ? '¡Nos vemos en las canchas!' 
                  : 'See you on the courts!'}
              </p>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Progress Header */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-400">
              {currentStep + 1} / {steps.length}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-parque-purple to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div 
          ref={contentRef}
          className="px-6 pb-4 min-h-[320px] max-h-[55vh] overflow-y-auto"
        >
          {renderStep()}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <div className="flex items-center justify-between">
            {currentStep > 0 ? (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {language === 'es' ? '← Anterior' : '← Back'}
              </button>
            ) : (
              <div /> // Empty div for spacing
            )}
            
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-gradient-to-r from-parque-purple to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-parque-purple/90 hover:to-purple-600/90 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 transform hover:scale-105"
            >
              {currentStep === steps.length - 1 
                ? (language === 'es' ? '¡A jugar!' : "Let's play!") 
                : (language === 'es' ? 'Siguiente →' : 'Next →')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Use portal to render at document body level
  return createPortal(modalContent, document.body)
}
