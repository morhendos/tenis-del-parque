'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function MessagesPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/player/messages')
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const data = await response.json()
      setMessages(data)
      
      // Mark messages as seen
      const unreadIds = data.filter(m => !m.seen).map(m => m._id)
      if (unreadIds.length > 0) {
        await markMessagesAsSeen(unreadIds)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsSeen = async (messageIds) => {
    try {
      await fetch('/api/player/messages/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds })
      })
    } catch (error) {
      console.error('Error marking messages as seen:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return locale === 'es' 
        ? `Hace ${Math.floor(diffInHours)} horas`
        : `${Math.floor(diffInHours)} hours ago`
    } else if (diffInHours < 48) {
      return locale === 'es' ? 'Ayer' : 'Yesterday'
    } else {
      return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const getMessageIcon = (type) => {
    switch (type) {
      case 'match_scheduled':
        return (
          <div className="bg-blue-100 rounded-full p-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )
      case 'match_reminder':
        return (
          <div className="bg-yellow-100 rounded-full p-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'result_confirmed':
        return (
          <div className="bg-green-100 rounded-full p-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="bg-gray-100 rounded-full p-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-parque-purple rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">
            {locale === 'es' ? 'Cargando mensajes...' : 'Loading messages...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {locale === 'es' ? 'Error al cargar mensajes' : 'Error loading messages'}
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {locale === 'es' ? 'Mensajes' : 'Messages'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {locale === 'es' 
            ? 'Notificaciones y actualizaciones importantes'
            : 'Important notifications and updates'}
        </p>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {locale === 'es' ? 'No hay mensajes' : 'No messages'}
          </h3>
          <p className="text-gray-600">
            {locale === 'es' 
              ? 'Los mensajes importantes aparecerán aquí'
              : 'Important messages will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {messages.map((message) => (
            <div key={message._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                {getMessageIcon(message.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {message.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {message.content}
                  </p>
                  {message.actionUrl && (
                    <a
                      href={message.actionUrl}
                      className="mt-2 inline-flex items-center text-sm font-medium text-parque-purple hover:text-parque-purple/80"
                    >
                      {message.actionText || (locale === 'es' ? 'Ver más' : 'View more')}
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
                {!message.seen && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}