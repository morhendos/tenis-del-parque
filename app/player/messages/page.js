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
  const [player, setPlayer] = useState(null)
  const [firstRoundMatch, setFirstRoundMatch] = useState(null)
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
      
      // Get player profile data
      const profileResponse = await fetch('/api/player/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setPlayer(profileData.player)
        
        // Check for first round matches - FIXED ENDPOINT
        const matchesResponse = await fetch('/api/player/matches')
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json()
          const firstRound = matchesData.matches?.find(match => match.round === 1)
          setFirstRoundMatch(firstRound)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // Prepare dynamic first round match announcement
  const getFirstRoundMatchMessage = () => {
    if (!firstRoundMatch || !player) return null
    
    const opponent = firstRoundMatch.players.player1._id === player._id 
      ? firstRoundMatch.players.player2 
      : firstRoundMatch.players.player1
    
    return {
      id: announcementContent.firstRoundMatch.id,
      type: 'announcement',
      date: new Date(firstRoundMatch.createdAt || announcementContent.firstRoundMatch.date), // Use match creation date if available
      title: announcementContent.firstRoundMatch[language].title,
      subtitle: announcementContent.firstRoundMatch[language].subtitle,
      icon: '🎾',
      bgColor: 'from-parque-purple/10 to-green-100',
      isNew: !session?.user?.seenAnnouncements?.includes(announcementContent.firstRoundMatch.id),
      content: {
        ...announcementContent.firstRoundMatch,
        es: {
          ...announcementContent.firstRoundMatch.es,
          content: announcementContent.firstRoundMatch.es.getContent(
            player.name,
            opponent.name,
            opponent.whatsapp,
            { level: player.level }
          )
        },
        en: {
          ...announcementContent.firstRoundMatch.en,
          content: announcementContent.firstRoundMatch.en.getContent(
            player.name,
            opponent.name,
            opponent.whatsapp,
            { level: player.level }
          )
        }
      }
    }
  }

  // Build messages array with proper dates
  const buildMessages = () => {
    const messagesList = []
    
    // Welcome message - use account creation date
    if (session?.user?.createdAt) {
      messagesList.push({
        id: 'welcome',
        type: 'welcome',
        date: new Date(session.user.createdAt),
        title: language === 'es' ? 'Mensaje de Bienvenida' : 'Welcome Message',
        subtitle: language === 'es' ? 'Tu primera vez en la plataforma' : 'Your first time on the platform',
        icon: '👋',
        bgColor: 'from-parque-purple/10 to-green-100'
      })
    }
    
    // First round delay announcement
    messagesList.push({
      id: announcementContent.firstRoundDelay.id,
      type: 'announcement',
      date: new Date(announcementContent.firstRoundDelay.date),
      title: announcementContent.firstRoundDelay[language].title,
      subtitle: announcementContent.firstRoundDelay[language].subtitle,
      icon: '📢',
      bgColor: 'from-yellow-100 to-orange-100',
      isNew: !session?.user?.seenAnnouncements?.includes(announcementContent.firstRoundDelay.id),
      content: announcementContent.firstRoundDelay
    })
    
    // Add first round match message if available
    const firstRoundMatchMessage = getFirstRoundMatchMessage()
    if (firstRoundMatchMessage) {
      messagesList.push(firstRoundMatchMessage)
    }
    
    // Sort messages by date (newest first)
    return messagesList.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const messages = buildMessages()

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
    const now = new Date()
    const diffTime = Math.abs(now - messageDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // For recent messages, show relative time
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return language === 'es' 
          ? `Hace ${diffMinutes} minutos`
          : `${diffMinutes} minutes ago`
      }
      return language === 'es' 
        ? `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
        : `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    } else if (diffDays === 1) {
      return language === 'es' ? 'Ayer' : 'Yesterday'
    } else if (diffDays < 7) {
      return language === 'es' 
        ? `Hace ${diffDays} días`
        : `${diffDays} days ago`
    }
    
    // For older messages, show date
    const options = { 
      day: 'numeric', 
      month: 'short',
      year: diffDays > 365 ? 'numeric' : undefined
    }
    return messageDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', options)
  }

  const formatDateMobile = (date) => {
    const messageDate = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now - messageDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      const hours = messageDate.getHours()
      const minutes = messageDate.getMinutes()
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' })
    }
    
    return messageDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
      day: 'numeric', 
      month: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple"></div>
      </div>
    )
  }

  const playerName = session?.player?.name || player?.name || 'Player'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header - More compact on mobile */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {language === 'es' ? 'Mensajes' : 'Messages'}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">
          {language === 'es' 
            ? 'Todos tus mensajes y anuncios' 
            : 'All your messages and announcements'}
        </p>
      </div>

      {/* Messages List - Optimized for mobile */}
      <div className="space-y-3 sm:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            onClick={() => handleMessageClick(message)}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200 ${
              message.isNew ? 'ring-2 ring-parque-purple ring-opacity-50' : ''
            }`}
          >
            <div className="flex items-start space-x-3 sm:space-x-4">
              {/* Icon - Using original simple style */}
              <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${message.bgColor} flex items-center justify-center text-lg sm:text-2xl`}>
                {message.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-1">
                      {message.title}
                    </h3>
                    <p className="mt-0.5 text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {message.subtitle}
                    </p>
                    {/* Mobile date - shown below on small screens */}
                    <div className="sm:hidden mt-1.5 flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatDateMobile(message.date)}
                      </span>
                      {message.isNew && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-parque-purple text-white">
                          {language === 'es' ? 'Nuevo' : 'New'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Desktop date and new badge */}
                  <div className="hidden sm:flex flex-col items-end space-y-1">
                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(message.date)}
                    </span>
                    {message.isNew && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-parque-purple text-white">
                        {language === 'es' ? 'Nuevo' : 'New'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow - Smaller on mobile */}
              <div className="flex-shrink-0 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="text-5xl sm:text-6xl mb-4">📭</div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {language === 'es' ? 'No tienes mensajes' : 'No messages'}
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
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
