'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import WelcomeModal from '@/components/ui/WelcomeModal'
import AnnouncementModal from '@/components/ui/AnnouncementModal'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'
import { welcomeContent } from '@/lib/content/welcomeContent'
import { announcementContent } from '@/lib/content/announcementContent'

export default function MessagesPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const locale = params.locale || 'es'
  
  const [loading, setLoading] = useState(true)
  const [player, setPlayer] = useState(null)
  const [firstRoundMatches, setFirstRoundMatches] = useState([])
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
        
        // Check for first round matches (one per league)
        const matchesResponse = await fetch('/api/player/matches')
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json()
          // Get ALL round 1 matches (could be in multiple leagues)
          const firstRounds = matchesData.matches?.filter(match => match.round === 1) || []
          setFirstRoundMatches(firstRounds)
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
    
    // Welcome message - use player's first registration date or a fixed early date
    const welcomeDate = player?.metadata?.firstRegistrationDate 
      ? new Date(player.metadata.firstRegistrationDate)
      : player?.createdAt 
        ? new Date(player.createdAt)
        : new Date('2025-01-01') // Fallback to a past date
    
    messages.push({
      id: 'welcome',
      type: 'welcome',
      date: welcomeDate,
      title: locale === 'es' ? 'Mensaje de Bienvenida' : 'Welcome Message',
      subtitle: locale === 'es' ? 'Tu primera vez en la plataforma' : 'Your first time on the platform',
      iconType: 'welcome',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      isNew: false // Welcome message is never "new"
    })

    // Add first round match messages - one per league
    if (firstRoundMatches.length > 0 && player) {
      firstRoundMatches.forEach(match => {
        const opponent = match.players.player1._id === player._id 
          ? match.players.player2 
          : match.players.player1
        
        // Get the league info from the match
        const leagueId = match.league?._id || match.league
        const leagueSlug = match.league?.slug || 
          player.registrations?.find(r => r.league?._id === leagueId || r.league === leagueId)?.league?.slug ||
          'unknown'
        const matchLeagueName = match.league?.name || 
          player.registrations?.find(r => r.league?._id === leagueId || r.league === leagueId)?.league?.name ||
          'League'
        
        // Create unique ID per league so players in multiple leagues see separate messages
        const uniqueId = `${announcementContent.firstRoundMatch.id}-${leagueSlug}`
        
        // Use match creation date or current date for the announcement date
        const announcementDate = match.createdAt ? new Date(match.createdAt) : new Date()
        
        messages.push({
          id: uniqueId,
          type: 'announcement',
          date: announcementDate,
          title: announcementContent.firstRoundMatch[locale].title,
          subtitle: matchLeagueName,
          iconType: 'match',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          isNew: !seenAnnouncements.includes(uniqueId),
          content: {
            ...announcementContent.firstRoundMatch,
            id: uniqueId, // Override the ID for marking as seen
            es: {
              ...announcementContent.firstRoundMatch.es,
              content: announcementContent.firstRoundMatch.es.getContent(
                player.name,
                opponent.name,
                opponent.whatsapp,
                { level: player.level, leagueName: matchLeagueName }
              )
            },
            en: {
              ...announcementContent.firstRoundMatch.en,
              content: announcementContent.firstRoundMatch.en.getContent(
                player.name,
                opponent.name,
                opponent.whatsapp,
                { level: player.level, leagueName: matchLeagueName }
              )
            }
          }
        })
      })
    }

    // Add league-specific announcements
    if (player?.registrations) {
      const playerLeagueSlugs = player.registrations
        .map(reg => reg.league?.slug)
        .filter(Boolean)
      
      // Find announcements that target any of the player's leagues
      Object.values(announcementContent).forEach(announcement => {
        if (!announcement.targetLeagues || announcement.targetLeagues.length === 0) return
        
        const isInTargetedLeague = announcement.targetLeagues.some(
          targetSlug => playerLeagueSlugs.includes(targetSlug)
        )
        
        if (isInTargetedLeague) {
          messages.push({
            id: announcement.id,
            type: 'announcement',
            date: announcement.date,
            title: announcement[locale].title,
            subtitle: announcement[locale].subtitle,
            iconType: 'announcement',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            isNew: !seenAnnouncements.includes(announcement.id),
            content: announcement
          })
        }
      })
    }

    // Sort messages by date (newest first)
    messages.sort((a, b) => new Date(b.date) - new Date(a.date))
    return messages
  }

  // SVG Icons for messages
  const MessageIcon = ({ type, className }) => {
    switch (type) {
      case 'welcome':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        )
      case 'match':
        return (
          <span className="text-base font-bold">1</span>
        )
      case 'announcement':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
          </svg>
        )
      default:
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        )
    }
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
    const now = new Date()
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24))
    
    // If today
    if (diffDays === 0) {
      return locale === 'es' ? 'Hoy' : 'Today'
    }
    
    // If yesterday
    if (diffDays === 1) {
      return locale === 'es' ? 'Ayer' : 'Yesterday'
    }
    
    // If within this week
    if (diffDays < 7) {
      return locale === 'es' ? `Hace ${diffDays} días` : `${diffDays} days ago`
    }
    
    // Otherwise show full date
    const options = { 
      day: 'numeric', 
      month: 'short',
      year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }
    return messageDate.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options)
  }

  if (loading || status === 'loading') {
    return (
      <TennisPreloaderInline 
        text={locale === 'es' ? 'Cargando mensajes...' : 'Loading messages...'}
        locale={locale}
      />
    )
  }

  const playerName = player?.name || session?.user?.name || 'Player'
  const messages = getMessages()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {locale === 'es' ? 'Mensajes' : 'Messages'}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500">
          {locale === 'es' 
            ? 'Anuncios importantes y actualizaciones' 
            : 'Important announcements and updates'}
        </p>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            onClick={() => handleMessageClick(message)}
            className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] ${
              message.isNew 
                ? 'border-parque-purple/50 shadow-sm shadow-purple-100' 
                : 'border-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${message.iconBg} flex items-center justify-center`}>
                <MessageIcon type={message.iconType} className={`w-5 h-5 ${message.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                      <span className="truncate">{message.title}</span>
                      {message.isNew && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-parque-purple text-white flex-shrink-0">
                          {locale === 'es' ? 'Nuevo' : 'New'}
                        </span>
                      )}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">
                      {message.subtitle}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                {/* Date - below the content */}
                <p className="mt-2 text-xs text-gray-400">
                  {formatDate(message.date)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {locale === 'es' ? 'No tienes mensajes' : 'No messages'}
          </h3>
          <p className="text-sm text-gray-500">
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
