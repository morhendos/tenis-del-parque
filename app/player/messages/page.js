'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../../lib/hooks/useLanguage'
import WelcomeModal from '../../../components/ui/WelcomeModal'
import AnnouncementModal from '../../../components/ui/AnnouncementModal'
import { welcomeContent } from '../../../lib/content/welcomeContent'
import { announcementContent } from '../../../lib/content/announcementContent'

export default function MessagesPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [modalType, setModalType] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      
      if (!data.authenticated) {
        router.push('/login')
        return
      }
      
      setSession(data)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const messages = [
    {
      id: 'welcome',
      type: 'welcome',
      date: session?.user?.createdAt ? new Date(session.user.createdAt) : new Date(),
      title: language === 'es' ? 'Mensaje de Bienvenida' : 'Welcome Message',
      subtitle: language === 'es' ? 'Tu primera vez en la plataforma' : 'Your first time on the platform',
      icon: '👋',
      bgColor: 'from-parque-purple/10 to-green-100'
    },
    {
      id: announcementContent.firstRoundDelay.id,
      type: 'announcement',
      date: announcementContent.firstRoundDelay.date,
      title: announcementContent.firstRoundDelay[language].title,
      subtitle: announcementContent.firstRoundDelay[language].subtitle,
      icon: '📢',
      bgColor: 'from-yellow-100 to-orange-100',
      isNew: !session?.user?.seenAnnouncements?.includes(announcementContent.firstRoundDelay.id),
      content: announcementContent.firstRoundDelay
    }
  ]

  const handleMessageClick = (message) => {
    setSelectedMessage(message)
    setModalType(message.type)
  }

  const handleCloseModal = async () => {
    // Mark announcement as seen if it's an announcement
    if (modalType === 'announcement' && selectedMessage?.id && selectedMessage?.isNew) {
      try {
        await fetch('/api/player/messages/mark-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: selectedMessage.id })
        })
        
        // Update local state
        setSession(prev => ({
          ...prev,
          user: {
            ...prev.user,
            seenAnnouncements: [...(prev.user.seenAnnouncements || []), selectedMessage.id]
          }
        }))
      } catch (error) {
        console.error('Failed to mark message as seen:', error)
      }
    }
    
    setSelectedMessage(null)
    setModalType(null)
  }

  const formatDate = (date) => {
    const messageDate = new Date(date)
    const options = { 
      day: 'numeric', 
      month: language === 'es' ? 'long' : 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return messageDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', options)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple"></div>
      </div>
    )
  }

  const playerName = session?.player?.name || 'Player'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'es' ? 'Mensajes' : 'Messages'}
        </h1>
        <p className="mt-2 text-gray-600">
          {language === 'es' 
            ? 'Todos tus mensajes y anuncios importantes' 
            : 'All your messages and important announcements'}
        </p>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            onClick={() => handleMessageClick(message)}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200 ${
              message.isNew ? 'ring-2 ring-parque-purple ring-opacity-50' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${message.bgColor} flex items-center justify-center text-2xl`}>
                {message.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                      <span>{message.title}</span>
                      {message.isNew && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-parque-purple text-white">
                          {language === 'es' ? 'Nuevo' : 'New'}
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {message.subtitle}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDate(message.date)}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'es' ? 'No tienes mensajes' : 'No messages'}
          </h3>
          <p className="text-gray-500">
            {language === 'es' 
              ? 'Los mensajes importantes aparecerán aquí' 
              : 'Important messages will appear here'}
          </p>
        </div>
      )}

      {/* Modals */}
      {modalType === 'welcome' && (
        <WelcomeModal
          isOpen={true}
          onClose={handleCloseModal}
          playerName={playerName}
        />
      )}
      
      {modalType === 'announcement' && selectedMessage?.content && (
        <AnnouncementModal
          isOpen={true}
          onClose={handleCloseModal}
          announcement={selectedMessage.content}
        />
      )}
    </div>
  )
}
