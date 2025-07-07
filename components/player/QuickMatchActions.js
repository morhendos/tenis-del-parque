import { useState } from 'react'
import { useLanguage } from '../../lib/hooks/useLanguage'

export default function QuickMatchActions({ onSchedule, onResult, hasUpcomingMatches }) {
  const { language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleSchedule = () => {
    setIsOpen(false)
    onSchedule()
  }

  const handleResult = () => {
    setIsOpen(false)
    onResult()
  }

  return (
    <>
      <style jsx>{`
        @keyframes fab-enter {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes action-enter {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fab-button {
          animation: fab-enter 0.3s ease-out;
        }
        
        .action-button {
          animation: action-enter 0.3s ease-out backwards;
        }
        
        .action-button:nth-child(1) {
          animation-delay: 0.1s;
        }
        
        .action-button:nth-child(2) {
          animation-delay: 0.2s;
        }
      `}</style>
      
      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Action Buttons */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {hasUpcomingMatches && (
              <button
                onClick={handleSchedule}
                className="action-button flex items-center space-x-3 bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-105 active:scale-95"
              >
                <span className="text-sm font-medium whitespace-nowrap">
                  {language === 'es' ? 'Programar Partido' : 'Schedule Match'}
                </span>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </button>
            )}
            
            <button
              onClick={handleResult}
              className="action-button flex items-center space-x-3 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition-all transform hover:scale-105 active:scale-95"
            >
              <span className="text-sm font-medium whitespace-nowrap">
                {language === 'es' ? 'Reportar Resultado' : 'Report Result'}
              </span>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </button>
          </div>
        )}
        
        {/* Main FAB Button */}
        <button
          onClick={toggleMenu}
          className={`fab-button w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${
            isOpen 
              ? 'bg-gray-700 rotate-45' 
              : 'bg-gradient-to-r from-parque-purple to-purple-700'
          }`}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      {/* Desktop Quick Actions Bar */}
      <div className="hidden sm:block fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4 py-4">
            {hasUpcomingMatches && (
              <button
                onClick={handleSchedule}
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 active:scale-95 font-medium shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {language === 'es' ? 'Programar Partido' : 'Schedule Match'}
              </button>
            )}
            
            <button
              onClick={handleResult}
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all transform hover:scale-105 active:scale-95 font-medium shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {language === 'es' ? 'Reportar Resultado' : 'Report Result'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
