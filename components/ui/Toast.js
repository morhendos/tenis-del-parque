'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

let toastId = 0
const toasts = new Map()
const listeners = new Set()

// Global toast functions
export const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  warning: (message) => showToast(message, 'warning'),
  info: (message) => showToast(message, 'info')
}

function showToast(message, type = 'info') {
  const id = toastId++
  const toast = { id, message, type }
  toasts.set(id, toast)
  
  // Notify all listeners
  listeners.forEach(listener => listener())
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toasts.delete(id)
    listeners.forEach(listener => listener())
  }, 5000)
  
  return id
}

export function ToastContainer() {
  const [, forceUpdate] = useState({})
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    
    // Subscribe to toast updates
    const listener = () => forceUpdate({})
    listeners.add(listener)
    
    return () => {
      listeners.delete(listener)
    }
  }, [])
  
  if (!mounted) return null
  
  const toastArray = Array.from(toasts.values())
  
  if (toastArray.length === 0) return null
  
  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toastArray.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>,
    document.body
  )
}

function Toast({ id, message, type }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
    
    // Start exit animation before removal
    const exitTimer = setTimeout(() => {
      setIsLeaving(true)
    }, 4700)
    
    return () => clearTimeout(exitTimer)
  }, [])
  
  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      toasts.delete(id)
      listeners.forEach(listener => listener())
    }, 300)
  }
  
  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  
  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white'
  }
  
  return (
    <div 
      className={`
        pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg 
        ${styles[type]} 
        transition-all duration-300 transform
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-2 hover:opacity-75 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
