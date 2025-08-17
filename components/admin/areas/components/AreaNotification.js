'use client'

import { useEffect } from 'react'
import { NOTIFICATION_DURATION } from '../constants/mapConfig'

/**
 * Notification component for displaying temporary messages
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Type of notification (success, error, warning, info)
 * @param {Function} props.onClose - Callback when notification closes
 */
export default function AreaNotification({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, NOTIFICATION_DURATION)
    
    return () => clearTimeout(timer)
  }, [onClose])
  
  const styles = {
    success: 'bg-green-50 border-green-500 text-green-900',
    error: 'bg-red-50 border-red-500 text-red-900',
    warning: 'bg-amber-50 border-amber-500 text-amber-900',
    info: 'bg-blue-50 border-blue-500 text-blue-900'
  }
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 border-l-4 rounded-lg shadow-lg ${styles[type]} animate-slide-in`}>
      <div className="flex items-start">
        <span className="text-xl mr-3">{icons[type]}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Add CSS for slide-in animation */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
