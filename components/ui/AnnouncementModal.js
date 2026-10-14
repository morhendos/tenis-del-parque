import { useRef, useEffect } from 'react'
import { useLanguage } from '../../lib/hooks/useLanguage'
import Image from 'next/image'

export default function AnnouncementModal({ isOpen, onClose, announcement }) {
  const { language } = useLanguage()
  const contentRef = useRef(null)
  
  // Auto-scroll to top when modal opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [isOpen])
  
  if (!isOpen || !announcement) return null

  const t = announcement[language]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-2 px-2 pb-4 text-center sm:pt-4 sm:px-4 sm:pb-20 sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        {/* Modal */}
        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-sm mx-auto sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-5 pt-5 pb-2 sm:px-6 sm:pt-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-parque-purple">
                    {t.subtitle}
                  </p>
                  <h3 className="mt-1 text-xl font-bold leading-tight text-gray-900">
                    {t.title}
                  </h3>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="tap-target ml-2 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div 
              ref={contentRef}
              className="max-h-[65vh] sm:max-h-[60vh] overflow-y-auto -mx-1 px-1 pb-3"
            >
              <div 
                className="text-gray-700 announcement-content text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: t.content }}
              />
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-white border-t border-gray-100 px-5 py-4 sm:px-6">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-xl px-4 py-3 bg-parque-purple text-sm sm:text-base font-semibold text-white hover:bg-parque-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-parque-purple transition-colors"
            >
              {t.buttonText}
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .announcement-content > p {
          margin-bottom: 0.75rem;
        }
        .announcement-content > p:last-child {
          margin-bottom: 0;
        }
        .announcement-content strong {
          font-weight: 600;
          color: #4B5563;
        }
        @media (max-width: 640px) {
          .announcement-content > p {
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}
