'use client'

import { useState, useEffect } from 'react'

// ============================================================
// BILINGUAL MESSAGE TEMPLATES
// ============================================================
const templates = {
  custom: {
    label: 'Custom',
    es: { subject: '', body: '' },
    en: { subject: '', body: '' }
  },
  round_reminder: {
    label: 'Match Reminder',
    es: {
      subject: 'Recordatorio: ¡Juega tu partido!',
      body: '¡Hola! Te recordamos que tienes un partido pendiente de jugar. Por favor, contacta a tu rival y acordad fecha y lugar lo antes posible.\n\nRecuerda que puedes ver los detalles de tu partido en tu Dashboard.\n\n¡Nos vemos en la pista! 🎾'
    },
    en: {
      subject: 'Reminder: Play your match!',
      body: 'Hi! Just a reminder that you have an outstanding match to play. Please contact your opponent and arrange a date and venue as soon as possible.\n\nYou can see your match details in your Dashboard.\n\nSee you on the court! 🎾'
    }
  },
  season_update: {
    label: 'Season Update',
    es: {
      subject: 'Actualización de la temporada',
      body: '¡Hola! Quedan pocas rondas para el final de la temporada regular. Asegúrate de jugar todos tus partidos pendientes.\n\nLos mejores clasificados pasarán a los playoffs. ¡No te lo pierdas!'
    },
    en: {
      subject: 'Season Update',
      body: 'Hi! There are only a few rounds left before the end of the regular season. Make sure to play all your pending matches.\n\nThe top-ranked players will advance to the playoffs. Don\'t miss out!'
    }
  },
  playoff_announcement: {
    label: 'Playoffs',
    es: {
      subject: '¡Los Playoffs se acercan!',
      body: '¡Atención! La fase de playoffs está a punto de comenzar. Los jugadores clasificados recibirán más información pronto.\n\n¡Preparaos para la fase final! 🏆'
    },
    en: {
      subject: 'Playoffs are coming!',
      body: 'Attention! The playoff stage is about to begin. Qualified players will receive more information soon.\n\nGet ready for the final stage! 🏆'
    }
  },
  welcome_round: {
    label: 'New Round',
    es: {
      subject: '¡Nueva ronda disponible!',
      body: '¡Hola! Ya están disponibles los emparejamientos de la nueva ronda. Entra en tu Dashboard para ver contra quién te toca jugar.\n\nContacta a tu rival por WhatsApp y acordad cuándo jugar. ¡Buena suerte! 🎾'
    },
    en: {
      subject: 'New round available!',
      body: 'Hi! The new round pairings are now available. Check your Dashboard to see who your opponent is.\n\nContact your opponent via WhatsApp and agree on when to play. Good luck! 🎾'
    }
  },
  last_chance: {
    label: 'Last Chance',
    es: {
      subject: '⚠️ Última oportunidad para jugar tu partido',
      body: '¡Atención! Tu partido sigue sin jugarse y la fecha límite se acerca. Si no se juega a tiempo, ambos jugadores perderán los puntos de esta ronda.\n\nPor favor, contacta a tu rival hoy mismo y acordad una fecha. ¡Cada punto cuenta!'
    },
    en: {
      subject: '⚠️ Last chance to play your match',
      body: 'Attention! Your match still hasn\'t been played and the deadline is approaching. If the match is not completed in time, both players will lose their points for this round.\n\nPlease contact your opponent today and agree on a date. Every point counts!'
    }
  }
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AdminMessagesPage() {
  // Leagues data
  const [leagues, setLeagues] = useState([])
  const [players, setPlayers] = useState([])
  
  // Form state
  const [audienceType, setAudienceType] = useState('league')
  const [selectedLeagueId, setSelectedLeagueId] = useState('')
  const [selectedRound, setSelectedRound] = useState('')
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [channelEmail, setChannelEmail] = useState(true)
  const [channelPush, setChannelPush] = useState(true)
  const [template, setTemplate] = useState('custom')
  const [language, setLanguage] = useState('auto') // 'auto', 'es', 'en'
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  
  // Send state
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [sendError, setSendError] = useState(null)
  
  // History
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  
  // Rounds for selected league
  const [availableRounds, setAvailableRounds] = useState([])

  useEffect(() => { fetchLeagues(); fetchHistory() }, [])
  
  useEffect(() => {
    if (selectedLeagueId && audienceType === 'individual') fetchPlayers(selectedLeagueId)
  }, [selectedLeagueId, audienceType])
  
  useEffect(() => {
    if (selectedLeagueId && audienceType === 'round_unplayed') fetchRounds(selectedLeagueId)
  }, [selectedLeagueId, audienceType])

  // Apply template in current language
  useEffect(() => {
    if (template !== 'custom') {
      const t = templates[template]
      const lang = language === 'auto' ? 'es' : language // Preview in ES for auto
      setSubject(t[lang].subject)
      setBody(t[lang].body)
    }
  }, [template, language])

  const fetchLeagues = async () => {
    try {
      const res = await fetch('/api/admin/leagues')
      if (res.ok) {
        const data = await res.json()
        setLeagues(data.leagues || [])
        const active = (data.leagues || []).find(l => l.status === 'active')
        if (active) setSelectedLeagueId(active._id)
      }
    } catch (err) { console.error('Failed to fetch leagues:', err) }
  }

  const fetchPlayers = async (leagueId) => {
    try {
      const res = await fetch(`/api/admin/players?league=${leagueId}&status=confirmed,active`)
      if (res.ok) { const data = await res.json(); setPlayers(data.players || []) }
    } catch (err) { console.error('Failed to fetch players:', err) }
  }

  const fetchRounds = async (leagueId) => {
    try {
      const res = await fetch(`/api/admin/matches?league=${leagueId}`)
      if (res.ok) {
        const data = await res.json()
        const rounds = [...new Set((data.matches || []).map(m => m.round))].sort((a, b) => a - b)
        setAvailableRounds(rounds)
        if (rounds.length > 0) setSelectedRound(rounds[rounds.length - 1].toString())
      }
    } catch (err) { console.error('Failed to fetch rounds:', err) }
  }

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true)
      const res = await fetch('/api/admin/messages?limit=20')
      if (res.ok) { const data = await res.json(); setHistory(data.messages || []) }
    } catch (err) { console.error('Failed to fetch history:', err) }
    finally { setLoadingHistory(false) }
  }

  const handleSend = async () => {
    setSending(true)
    setSendResult(null)
    setSendError(null)

    try {
      // Build message with bilingual content for auto mode
      const messagePayload = { subject, body, template }
      
      // If auto language and using a template, include both versions
      if (language === 'auto' && template !== 'custom') {
        messagePayload.bodyEs = templates[template].es.body
        messagePayload.bodyEn = templates[template].en.body
        messagePayload.subjectEs = templates[template].es.subject
        messagePayload.subjectEn = templates[template].en.subject
      }

      const res = await fetch('/api/admin/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience: buildAudience(),
          channels: { email: channelEmail, push: channelPush },
          message: messagePayload,
          language
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setSendResult(data)
      fetchHistory()
    } catch (err) {
      setSendError(err.message)
    } finally {
      setSending(false)
    }
  }

  const buildAudience = () => {
    const audience = { type: audienceType }
    if (audienceType === 'league' || audienceType === 'round_unplayed') audience.leagueId = selectedLeagueId
    if (audienceType === 'round_unplayed') audience.round = parseInt(selectedRound)
    if (audienceType === 'individual') { audience.playerId = selectedPlayerId; audience.leagueId = selectedLeagueId }
    return audience
  }

  const handleReset = () => {
    setTemplate('custom'); setSubject(''); setBody('')
    setSendResult(null); setSendError(null)
  }

  const canSend = body.trim() && (channelEmail || channelPush) && 
    (!channelEmail || subject.trim()) &&
    (audienceType === 'all' || selectedLeagueId) &&
    (audienceType !== 'round_unplayed' || selectedRound) &&
    (audienceType !== 'individual' || selectedPlayerId)

  const selectedLeague = leagues.find(l => l._id === selectedLeagueId)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Message Center</h2>
          <p className="text-gray-600 mt-1">Send emails and push notifications to your players</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {showHistory ? 'Compose' : 'History'}
          {history.length > 0 && (
            <span className="bg-gray-300 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>
          )}
        </button>
      </div>

      {showHistory ? (
        /* MESSAGE HISTORY */
        <div className="space-y-4">
          {loadingHistory ? (
            <div className="text-center py-12 text-gray-500">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500">No messages sent yet</p></div>
          ) : (
            history.map((msg) => (
              <div key={msg._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{msg.message?.subject || 'No subject'}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{msg.message?.template || 'custom'}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {' · '}{msg.sentByName}
                    </p>
                  </div>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                    {msg.audience?.type === 'all' && 'All Players'}
                    {msg.audience?.type === 'league' && (msg.audience?.leagueName || 'League')}
                    {msg.audience?.type === 'round_unplayed' && `Round ${msg.audience?.round} unplayed`}
                    {msg.audience?.type === 'individual' && (msg.audience?.playerName || 'Player')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{msg.message?.body}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{msg.stats?.targetedPlayers || 0} players</span>
                  {msg.channels?.email && <span>{msg.stats?.emailsSent || 0} emails{msg.stats?.emailsFailed > 0 && ` (${msg.stats.emailsFailed} failed)`}</span>}
                  {msg.channels?.push && <span>{msg.stats?.pushSent || 0} push</span>}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* COMPOSE MESSAGE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left column — Audience, Language & Channels */}
          <div className="space-y-5">
            
            {/* Audience */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Audience
              </h3>
              <div className="space-y-3">
                <select value={audienceType} onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent">
                  <option value="all">All Players (all leagues)</option>
                  <option value="league">Entire League</option>
                  <option value="round_unplayed">Round — Unplayed Matches Only</option>
                  <option value="individual">Individual Player</option>
                </select>
                
                {(audienceType === 'league' || audienceType === 'round_unplayed' || audienceType === 'individual') && (
                  <select value={selectedLeagueId} onChange={(e) => setSelectedLeagueId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent">
                    <option value="">Select league...</option>
                    {leagues.map(l => <option key={l._id} value={l._id}>{l.name} ({l.status})</option>)}
                  </select>
                )}
                
                {audienceType === 'round_unplayed' && selectedLeagueId && (
                  <select value={selectedRound} onChange={(e) => setSelectedRound(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent">
                    <option value="">Select round...</option>
                    {availableRounds.map(r => <option key={r} value={r}>Round {r}</option>)}
                  </select>
                )}
                
                {audienceType === 'individual' && selectedLeagueId && (
                  <select value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent">
                    <option value="">Select player...</option>
                    {players.map(p => <option key={p._id} value={p._id}>{p.name} ({p.email})</option>)}
                  </select>
                )}
              </div>
            </div>
            
            {/* Language */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Language
              </h3>
              <div className="flex gap-2">
                {[
                  { value: 'auto', label: 'Auto', desc: 'Per player preference' },
                  { value: 'es', label: 'ES', desc: 'Español' },
                  { value: 'en', label: 'EN', desc: 'English' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setLanguage(opt.value)}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-center transition-colors ${
                      language === opt.value
                        ? 'bg-parque-purple text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm font-semibold">{opt.label}</div>
                    <div className={`text-[10px] ${language === opt.value ? 'text-purple-200' : 'text-gray-400'}`}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              {language === 'auto' && (
                <p className="text-xs text-gray-500 mt-2">
                  Each player receives the message in their preferred language. Templates fill with both ES/EN automatically. Custom messages will be sent as written.
                </p>
              )}
            </div>
            
            {/* Channels */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
                </svg>
                Channels
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </div>
                  <input type="checkbox" checked={channelEmail} onChange={(e) => setChannelEmail(e.target.checked)}
                    className="h-4 w-4 text-parque-purple rounded focus:ring-parque-purple" />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Push Notification</span>
                  </div>
                  <input type="checkbox" checked={channelPush} onChange={(e) => setChannelPush(e.target.checked)}
                    className="h-4 w-4 text-parque-purple rounded focus:ring-parque-purple" />
                </label>
              </div>
              {!channelEmail && !channelPush && (
                <p className="text-xs text-red-500 mt-2">Select at least one channel</p>
              )}
            </div>
          </div>
          
          {/* Right column — Template + Composer */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Template Picker */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Quick Templates</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(templates).map(([key, t]) => (
                  <button key={key} onClick={() => setTemplate(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      template === key ? 'bg-parque-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
              
              {/* Show bilingual preview when auto + template */}
              {language === 'auto' && template !== 'custom' && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-[10px] font-semibold text-blue-600 mb-1">🇪🇸 Spanish version</div>
                    <div className="text-xs text-blue-800 font-medium">{templates[template].es.subject}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="text-[10px] font-semibold text-green-600 mb-1">🇬🇧 English version</div>
                    <div className="text-xs text-green-800 font-medium">{templates[template].en.subject}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Composer */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Compose {language === 'auto' && template !== 'custom' ? '(preview — ES shown, both sent)' : `(${language === 'auto' ? 'ES' : language.toUpperCase()})`}
                </h3>
                {language === 'auto' && template !== 'custom' && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Auto: both languages sent</span>
                )}
              </div>
              
              {channelEmail && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                  <input type="text" value={subject}
                    onChange={(e) => { setSubject(e.target.value); setTemplate('custom') }}
                    placeholder="Email subject line..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent" />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
                <textarea value={body}
                  onChange={(e) => { setBody(e.target.value); if (template !== 'custom') setTemplate('custom') }}
                  placeholder="Write your message here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent resize-y" />
                <p className="text-xs text-gray-400 mt-1">
                  {body.length} characters
                  {channelPush && body.length > 200 && ' · Push will be truncated to 200 chars'}
                </p>
              </div>
            </div>
            
            {/* Error */}
            {sendError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{sendError}</div>
            )}
            
            {/* Result */}
            {sendResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-semibold text-green-800">Message Sent!</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-gray-900">{sendResult.stats?.targetedPlayers || 0}</div>
                    <div className="text-xs text-gray-500">Players</div>
                  </div>
                  {channelEmail && (
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-blue-600">{sendResult.stats?.emailsSent || 0}</div>
                      <div className="text-xs text-gray-500">Emails{sendResult.stats?.emailsFailed > 0 && ` (${sendResult.stats.emailsFailed} failed)`}</div>
                    </div>
                  )}
                  {channelPush && (
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600">{sendResult.stats?.pushSent || 0}</div>
                      <div className="text-xs text-gray-500">Push</div>
                    </div>
                  )}
                </div>
                {sendResult.details?.length > 0 && (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer text-green-700 font-medium">Show delivery details</summary>
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                      {sendResult.details.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 py-0.5">
                          <span className="font-medium w-32 truncate">{d.playerName}</span>
                          {channelEmail && <span className={d.emailSent ? 'text-green-600' : 'text-gray-400'}>{d.emailSent ? '✓ email' : '✗ email'}</span>}
                          {channelPush && <span className={d.pushSent ? 'text-purple-600' : 'text-gray-400'}>{d.pushSent ? '✓ push' : '✗ push'}</span>}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
                <button onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  Send Another Message
                </button>
              </div>
            )}
            
            {/* Send Button */}
            {!sendResult && (
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {audienceType === 'all' && 'Sending to all active players across all leagues'}
                  {audienceType === 'league' && selectedLeague && `Sending to all players in ${selectedLeague.name}`}
                  {audienceType === 'round_unplayed' && selectedRound && `Sending to players with unplayed matches in Round ${selectedRound}`}
                  {audienceType === 'individual' && 'Sending to one player'}
                  {language === 'auto' && template !== 'custom' && ' · bilingual (auto)'}
                </div>
                <button onClick={handleSend} disabled={sending || !canSend}
                  className="px-6 py-2.5 bg-parque-purple text-white rounded-lg font-medium text-sm hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {sending ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Sending...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Send Message</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
