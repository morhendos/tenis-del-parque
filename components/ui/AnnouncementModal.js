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
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full lg:max-w-2xl">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {t.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t.subtitle}
                  </p>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div 
              ref={contentRef}
              className="mt-2 max-h-[60vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-parque-purple/5 to-green-50 rounded-lg p-6">
                <div 
                  className="text-gray-700 announcement-content"
                  dangerouslySetInnerHTML={{ __html: t.content }}
                />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-parque-purple text-base font-medium text-white hover:bg-parque-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-parque-purple sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              {t.buttonText}
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .announcement-content p {
          margin-bottom: 1rem;
        }
        .announcement-content p:last-child {
          margin-bottom: 0;
        }
        .announcement-content strong {
          font-weight: 600;
          color: #4B5563;
        }
      `}</style>
    </div>
  )
}
