'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import WelcomeModal from '@/components/ui/WelcomeModal'
import AnnouncementModal from '@/components/ui/AnnouncementModal'
import { welcomeContent } from '@/lib/content/welcomeContent'
import { announcementContent } from '@/lib/content/announcementContent'

export default function MessagesPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const locale = params.locale || 'es'
  
  const [loading, setLoading] = useState(true)
  const [player, setPlayer] = useState(null)
  const [firstRoundMatch, setFirstRoundMatch] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [seenAnnouncements, setSeenAnnouncements] = useState([])

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
      return
    }
    
    if (session?.user) {
      fetchPlayerData()
    }
  }, [session, status, locale, router])

  const fetchPlayerData = async () => {
    try {
      // Get player profile data
      const profileResponse = await fetch('/api/player/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setPlayer(profileData.player)
        
        // Get user preferences including seenAnnouncements
        const preferencesResponse = await fetch('/api/player/preferences')
        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json()
          setSeenAnnouncements(preferencesData.seenAnnouncements || [])
        }
        
        // Check for first round matches
        const matchesResponse = await fetch('/api/player/matches')
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json()
          const firstRound = matchesData.matches?.find(match => match.round === 1)
          setFirstRoundMatch(firstRound)
        }
      }
    } catch (error) {
      console.error('Error fetching player data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate messages based on current data
  const getMessages = () => {
    const messages = []
    
    // Welcome message
    messages.push({
      id: 'welcome',
      type: 'welcome',
      date: session?.user?.createdAt ? new Date(session.user.createdAt) : new Date(),
      title: locale === 'es' ? 'Mensaje de Bienvenida' : 'Welcome Message',
      subtitle: locale === 'es' ? 'Tu primera vez en la plataforma' : 'Your first time on the platform',
      icon: '👋',
      bgColor: 'from-parque-purple/10 to-green-100',
      isNew: false // Welcome message is never "new"
    })
    
    // First round delay announcement
    messages.push({
      id: announcementContent.firstRoundDelay.id,
      type: 'announcement',
      date: announcementContent.firstRoundDelay.date,
      title: announcementContent.firstRoundDelay[locale].title,
      subtitle: announcementContent.firstRoundDelay[locale].subtitle,
      icon: '📢',
      bgColor: 'from-yellow-100 to-orange-100',
      isNew: !seenAnnouncements.includes(announcementContent.firstRoundDelay.id),
      content: announcementContent.firstRoundDelay
    })

    // Add first round match message if available
    if (firstRoundMatch && player) {
      const opponent = firstRoundMatch.players.player1._id === player._id 
        ? firstRoundMatch.players.player2 
        : firstRoundMatch.players.player1
      
      messages.push({
        id: announcementContent.firstRoundMatch.id,
        type: 'announcement',
        date: announcementContent.firstRoundMatch.date,
        title: announcementContent.firstRoundMatch[locale].title,
        subtitle: announcementContent.firstRoundMatch[locale].subtitle,
        icon: '🎾',
        bgColor: 'from-parque-purple/10 to-green-100',
        isNew: !seenAnnouncements.includes(announcementContent.firstRoundMatch.id),
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
      })
    }

    // Sort messages by date (newest first)
    messages.sort((a, b) => new Date(b.date) - new Date(a.date))
    return messages
  }

  const handleMessageClick = (message) => {
    setSelectedMessage(message)
    setModalType(message.type)
  }

  const handleCloseModal = async () => {
    // Mark announcement as seen if it's an announcement
    if (modalType === 'announcement' && selectedMessage?.id && selectedMessage?.isNew) {
      try {
        const response = await fetch('/api/player/messages/mark-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds: [selectedMessage.id] })
        })

        if (response.ok) {
          const data = await response.json()
          // Update local state with the server's seen announcements
          setSeenAnnouncements(data.seenAnnouncements || [...seenAnnouncements, selectedMessage.id])
          
          // Force router refresh to update the layout badge
          router.refresh()
        }
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
      month: locale === 'es' ? 'long' : 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return messageDate.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options)
  }

  if (loading || status === 'loading') {
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

  const playerName = player?.name || session?.user?.name || 'Player'
  const messages = getMessages()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'es' ? 'Mensajes' : 'Messages'}
        </h1>
        <p className="mt-2 text-gray-600">
          {locale === 'es' 
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
                          {locale === 'es' ? 'Nuevo' : 'New'}
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
            {locale === 'es' ? 'No tienes mensajes' : 'No messages'}
          </h3>
          <p className="text-gray-500">
            {locale === 'es' 
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
