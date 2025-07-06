import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../lib/hooks/useLanguage'
import { welcomeContent } from '../../lib/content/welcomeContent'

export default function WelcomeModal({ isOpen, onClose, playerName }) {
  const [currentStep, setCurrentStep] = useState(0)
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  
  const t = welcomeContent[language]
  
  if (!isOpen) return null

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

  const handleViewRules = () => {
    router.push('/rules')
    onClose()
  }

  const renderStep = () => {
    const step = steps[currentStep]
    
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="mb-6">
              <img 
                src="/logo.png" 
                alt="Liga del Parque" 
                className="h-20 w-auto mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t.title}
              </h2>
              <p className="text-lg text-gray-600">
                {t.subtitle}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-parque-purple/10 to-green-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-parque-purple mb-3">
                {t.playerGreeting.replace('{playerName}', playerName)}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {t.introduction}
              </p>
            </div>
          </div>
        )
        
      case 'rules':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t.rules.title}
              </h3>
            </div>
            
            <div className="space-y-4">
              {t.rules.items.map((rule, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-parque-purple">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl flex-shrink-0 mt-1">
                      {rule.icon}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {rule.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
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
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t.encouragement.title}
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                {t.encouragement.message}
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 text-4xl">
              <span className="animate-bounce">🎾</span>
              <span className="animate-bounce" style={{animationDelay: '0.1s'}}>🏆</span>
              <span className="animate-bounce" style={{animationDelay: '0.2s'}}>🎉</span>
            </div>
          </div>
        )
        
      case 'nextSteps':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t.nextSteps.title}
              </h3>
            </div>
            
            <div className="space-y-3">
              {t.nextSteps.items.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 bg-green-50 rounded-lg p-3">
                  <div className="bg-parque-purple text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">
                    {step}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-parque-purple/10 to-green-100 rounded-lg p-6 text-center">
              <p className="text-lg font-semibold text-parque-purple mb-3">
                {language === 'es' ? '¡Que tengas suerte! 🍀' : 'Good luck! 🍀'}
              </p>
              <p className="text-gray-600">
                {language === 'es' 
                  ? '¡Esperamos verte pronto en las canchas!' 
                  : 'We hope to see you on the courts soon!'}
              </p>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full lg:max-w-2xl">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Language Switcher */}
            <div className="flex justify-end mb-4">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('es')}
                  className={`w-8 h-8 text-xs font-medium rounded-md transition-colors flex items-center justify-center ${
                    language === 'es'
                      ? 'bg-parque-purple text-white'
                      : 'text-gray-600 hover:text-parque-purple'
                  }`}
                >
                  ES
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`w-8 h-8 text-xs font-medium rounded-md transition-colors flex items-center justify-center ${
                    language === 'en'
                      ? 'bg-parque-purple text-white'
                      : 'text-gray-600 hover:text-parque-purple'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">
                  {currentStep + 1} / {steps.length}
                </span>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-parque-purple h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="min-h-[400px]">
              {renderStep()}
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleNext}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-parque-purple text-base font-medium text-white hover:bg-parque-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-parque-purple sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              {currentStep === steps.length - 1 ? t.buttons.startPlaying : 
               currentStep === 0 ? t.buttons.gotIt : 
               (language === 'es' ? 'Siguiente' : 'Next')}
            </button>
            
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-parque-purple sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                {language === 'es' ? 'Anterior' : 'Previous'}
              </button>
            )}
            
            {currentStep === 1 && (
              <button
                onClick={handleViewRules}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-parque-purple shadow-sm px-4 py-2 bg-white text-base font-medium text-parque-purple hover:bg-parque-purple/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-parque-purple sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                {t.buttons.viewRules}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 