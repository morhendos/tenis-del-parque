'use client'

import { useState, useEffect } from 'react'

// ============================================================
// PERSONALIZED TAB COMPONENT
// ============================================================
function PersonalizedTab({ leagues, selectedLeagueId, setSelectedLeagueId, channelEmail, setChannelEmail, channelPush, setChannelPush, pSubject, setPSubject, pIntro, setPIntro, pOutro, setPOutro, pDeadline, setPDeadline, sending, setSending, sendResult, setSendResult, sendError, setSendError, fetchHistory }) {
  
  const [testPlayerId, setTestPlayerId] = useState('')
  const [players, setPlayers] = useState([])
  const [sendingStartTime, setSendingStartTime] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (selectedLeagueId) {
      fetch('/api/admin/players?league=' + selectedLeagueId + '&status=confirmed,active')
        .then(r => r.ok ? r.json() : { players: [] })
        .then(d => setPlayers(d.players || []))
        .catch(() => {})
    }
  }, [selectedLeagueId])

  // Elapsed time counter while sending
  useEffect(() => {
    if (!sending) {
      setSendingStartTime(null)
      setElapsedSeconds(0)
      return
    }
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [sending])

  const handleSendPersonalized = async () => {
    setSending(true); setSendResult(null); setSendError(null)
    setSendingStartTime(Date.now()); setElapsedSeconds(0)
    try {
      const res = await fetch('/api/admin/messages/send-personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: selectedLeagueId,
          testPlayerId: testPlayerId || undefined,
          subject: pSubject,
          intro: pIntro,
          outro: pOutro,
          deadlineDate: pDeadline,
          channels: { email: channelEmail, push: channelPush }
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setSendResult(data)
      fetchHistory()
    } catch (err) { setSendError(err.message) }
    finally { setSending(false) }
  }

  // Estimate total time: ~0.8s per player for email (600ms delay + send time)
  const estimatedPlayers = testPlayerId ? 1 : players.length
  const estimatedSeconds = channelEmail ? Math.max(3, Math.ceil(estimatedPlayers * 0.8)) : 3

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 text-sm mb-1">Personalized Match List</h3>
        <p className="text-blue-700 text-xs">Each player receives a unique message listing their specific pending matches and opponents. Only players with unplayed matches will be contacted.</p>
      </div>
      
      {/* Sending overlay */}
      {sending && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="animate-spin w-12 h-12 text-parque-purple" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 text-base">Sending personalized messages...</h3>
              <p className="text-purple-700 text-sm mt-1">
                Delivering to {testPlayerId ? '1 player (test)' : estimatedPlayers + ' players'} via {[channelEmail && 'email', channelPush && 'push'].filter(Boolean).join(' + ')}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-parque-purple rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: Math.min(95, (elapsedSeconds / estimatedSeconds) * 100) + '%' }}
                  />
                </div>
                <span className="text-xs text-purple-600 font-medium tabular-nums w-10 text-right">{elapsedSeconds}s</span>
              </div>
              <p className="text-xs text-purple-500 mt-1">{"Please do not close this page. Estimated ~" + estimatedSeconds + "s total."}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">League</h3>
            <select value={selectedLeagueId} onChange={(e) => setSelectedLeagueId(e.target.value)}
              disabled={sending}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent disabled:opacity-50">
              <option value="">Select league...</option>
              {leagues.map(l => <option key={l._id} value={l._id}>{l.name} ({l.status})</option>)}
            </select>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">New Deadline</h3>
            <input type="date" value={pDeadline} onChange={(e) => setPDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              disabled={sending}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent disabled:opacity-50" />
            <p className="text-xs text-gray-400 mt-1">Shown in each email</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Channels</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer">
                <span className="text-sm text-gray-700">Email</span>
                <input type="checkbox" checked={channelEmail} onChange={(e) => setChannelEmail(e.target.checked)} disabled={sending} className="h-4 w-4 text-parque-purple rounded" />
              </label>
              <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer">
                <span className="text-sm text-gray-700">Push</span>
                <input type="checkbox" checked={channelPush} onChange={(e) => setChannelPush(e.target.checked)} disabled={sending} className="h-4 w-4 text-parque-purple rounded" />
              </label>
            </div>
          </div>
          
          {/* Test on single player */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Test Mode</h3>
            <select value={testPlayerId} onChange={(e) => setTestPlayerId(e.target.value)}
              disabled={sending}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent disabled:opacity-50">
              <option value="">Send to ALL players</option>
              {players.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            {testPlayerId && (
              <p className="text-xs text-amber-600 mt-2 font-medium">Test mode: only this player will receive the message</p>
            )}
          </div>
        </div>
        
        {/* Right */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Subject (bilingual)</h3>
            <div className="space-y-2">
              <div><label className="text-xs text-gray-500 mb-1 block">ES</label>
                <input type="text" value={pSubject.es} onChange={(e) => setPSubject(s => ({...s, es: e.target.value}))} disabled={sending} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">EN</label>
                <input type="text" value={pSubject.en} onChange={(e) => setPSubject(s => ({...s, en: e.target.value}))} disabled={sending} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50" /></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Intro Text</h3>
            <p className="text-xs text-gray-400 mb-3">Shown before the match list</p>
            <div className="space-y-2">
              <div><label className="text-xs text-gray-500 mb-1 block">ES</label>
                <textarea value={pIntro.es} onChange={(e) => setPIntro(s => ({...s, es: e.target.value}))} rows={4} disabled={sending} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y disabled:opacity-50" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">EN</label>
                <textarea value={pIntro.en} onChange={(e) => setPIntro(s => ({...s, en: e.target.value}))} rows={4} disabled={sending} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y disabled:opacity-50" /></div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-purple-700 mb-2">MATCH LIST INSERTED HERE (auto-generated per player)</p>
            <div className="bg-white rounded-lg p-3 text-sm text-gray-600">
              <table className="w-full"><tbody>
                <tr className="border-b"><td className="py-1 font-semibold text-purple-600">Ronda 5</td><td className="py-1">vs <strong>Player Name</strong></td></tr>
                <tr><td className="py-1 font-semibold text-purple-600">Ronda 7</td><td className="py-1">vs <strong>Another Player</strong></td></tr>
              </tbody></table>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Outro Text</h3>
            <p className="text-xs text-gray-400 mb-3">Shown after the match list</p>
            <div className="space-y-2">
              <div><label className="text-xs text-gray-500 mb-1 block">ES</label>
                <textarea value={pOutro.es} onChange={(e) => setPOutro(s => ({...s, es: e.target.value}))} rows={3} disabled={sending} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y disabled:opacity-50" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">EN</label>
                <textarea value={pOutro.en} onChange={(e) => setPOutro(s => ({...s, en: e.target.value}))} rows={3} disabled={sending} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y disabled:opacity-50" /></div>
            </div>
          </div>
          
          {sendError && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{sendError}</div>}
          
          {sendResult ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="font-semibold text-green-800">Personalized Messages Sent!</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                <div className="bg-white rounded-lg p-3 text-center"><div className="text-xl font-bold text-gray-900">{sendResult.stats?.targetedPlayers || 0}</div><div className="text-xs text-gray-500">Players</div></div>
                <div className="bg-white rounded-lg p-3 text-center"><div className="text-xl font-bold text-blue-600">{sendResult.stats?.emailsSent || 0}</div><div className="text-xs text-gray-500">Emails sent</div></div>
                <div className="bg-white rounded-lg p-3 text-center"><div className={'text-xl font-bold ' + (sendResult.stats?.emailsFailed > 0 ? 'text-red-600' : 'text-gray-300')}>{sendResult.stats?.emailsFailed || 0}</div><div className="text-xs text-gray-500">Emails failed</div></div>
                <div className="bg-white rounded-lg p-3 text-center"><div className="text-xl font-bold text-purple-600">{sendResult.stats?.pushSent || 0}</div><div className="text-xs text-gray-500">Push sent</div></div>
              </div>
              {sendResult.stats?.emailsFailed > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-700">
                  {sendResult.stats.emailsFailed} email(s) failed to send. Check delivery details below for error info.
                </div>
              )}
              {sendResult.details?.length > 0 && (
                <details className="text-xs text-gray-600">
                  <summary className="cursor-pointer text-green-700 font-medium">Show delivery details ({sendResult.details.length} players)</summary>
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {sendResult.details.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 py-0.5">
                        <span className="font-medium w-28 truncate">{d.playerName}</span>
                        <span className="text-gray-400">{d.pendingMatches} matches</span>
                        {d.emailSent ? <span className="text-green-600">&#10003; email</span> : <span className="text-red-400" title={d.emailError || ''}>&#10007; email</span>}
                        {d.pushSent ? <span className="text-purple-600">&#10003; push</span> : <span className="text-gray-300">&#10007; push</span>}
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <button onClick={() => { setSendResult(null); setSendError(null) }}
                className="mt-4 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Send Another</button>
            </div>
          ) : !sending && (
            <div className="flex items-center justify-between">
              {channelEmail && estimatedPlayers > 1 && !testPlayerId && (
                <p className="text-xs text-gray-400">
                  Estimated delivery time: ~{Math.ceil(estimatedPlayers * 0.8)}s for {estimatedPlayers} players
                </p>
              )}
              <div className="flex-1" />
              <button onClick={handleSendPersonalized}
                disabled={sending || !selectedLeagueId || (!channelEmail && !channelPush)}
                className="px-6 py-2.5 bg-parque-purple text-white rounded-lg font-medium text-sm hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2">
                {testPlayerId ? 'Send Test to 1 Player' : 'Send to All Players'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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
      subject: 'Recordatorio: \u00a1Juega tu partido!',
      body: '\u00a1Hola! Te recordamos que tienes un partido pendiente de jugar. Por favor, contacta a tu rival y acordad fecha y lugar lo antes posible.\n\nRecuerda que puedes ver los detalles de tu partido en tu Dashboard.\n\n\u00a1Nos vemos en la pista!'
    },
    en: {
      subject: 'Reminder: Play your match!',
      body: 'Hi! Just a reminder that you have an outstanding match to play. Please contact your opponent and arrange a date and venue as soon as possible.\n\nYou can see your match details in your Dashboard.\n\nSee you on the court!'
    }
  },
  season_update: {
    label: 'Season Update',
    es: {
      subject: 'Actualizaci\u00f3n de la temporada',
      body: '\u00a1Hola! Quedan pocas rondas para el final de la temporada regular. Aseg\u00farate de jugar todos tus partidos pendientes.\n\nLos mejores clasificados pasar\u00e1n a los playoffs. \u00a1No te lo pierdas!'
    },
    en: {
      subject: 'Season Update',
      body: 'Hi! There are only a few rounds left before the end of the regular season. Make sure to play all your pending matches.\n\nThe top-ranked players will advance to the playoffs. Don\'t miss out!'
    }
  },
  playoff_announcement: {
    label: 'Playoffs',
    es: {
      subject: '\u00a1Los Playoffs se acercan!',
      body: '\u00a1Atenci\u00f3n! La fase de playoffs est\u00e1 a punto de comenzar. Los jugadores clasificados recibir\u00e1n m\u00e1s informaci\u00f3n pronto.\n\n\u00a1Preparaos para la fase final!'
    },
    en: {
      subject: 'Playoffs are coming!',
      body: 'Attention! The playoff stage is about to begin. Qualified players will receive more information soon.\n\nGet ready for the final stage!'
    }
  },
  welcome_round: {
    label: 'New Round',
    es: {
      subject: '\u00a1Nueva ronda disponible!',
      body: '\u00a1Hola! Ya est\u00e1n disponibles los emparejamientos de la nueva ronda. Entra en tu Dashboard para ver contra qui\u00e9n te toca jugar.\n\nContacta a tu rival por WhatsApp y acordad cu\u00e1ndo jugar. \u00a1Buena suerte!'
    },
    en: {
      subject: 'New round available!',
      body: 'Hi! The new round pairings are now available. Check your Dashboard to see who your opponent is.\n\nContact your opponent via WhatsApp and agree on when to play. Good luck!'
    }
  },
  last_chance: {
    label: 'Last Chance',
    es: {
      subject: '\u00daltima oportunidad para jugar tu partido',
      body: '\u00a1Atenci\u00f3n! Tu partido sigue sin jugarse y la fecha l\u00edmite se acerca. Si no se juega a tiempo, ambos jugadores perder\u00e1n los puntos de esta ronda.\n\nPor favor, contacta a tu rival hoy mismo y acordad una fecha. \u00a1Cada punto cuenta!'
    },
    en: {
      subject: 'Last chance to play your match',
      body: 'Attention! Your match still hasn\'t been played and the deadline is approaching. If the match is not completed in time, both players will lose their points for this round.\n\nPlease contact your opponent today and agree on a date. Every point counts!'
    }
  },
  playoff_pairings: {
    label: 'Playoff Pairings',
    isSpecial: true,
    es: { subject: '', body: '' },
    en: { subject: '', body: '' }
  },
  season_wrapup: {
    label: 'Season Wrap-up',
    es: {
      subject: 'Gracias por una gran temporada',
      body: 'Hola,\n\nLa temporada regular ha llegado a su fin y queremos darte las gracias por ser parte de esta liga. Tu participaci\u00f3n ha sido clave para hacer de esta temporada algo especial.\n\nLos playoffs ya est\u00e1n en marcha con los 8 mejores clasificados. Puedes seguir los resultados desde tu dashboard.\n\nEsperamos verte de nuevo en la pr\u00f3xima temporada. Sigue practicando y vuelve a\u00fan m\u00e1s fuerte.\n\nUn saludo,\nEquipo Tenis del Parque'
    },
    en: {
      subject: 'Thanks for a great season',
      body: 'Hi,\n\nThe regular season has come to an end and we want to thank you for being part of this league. Your participation has been key to making this season something special.\n\nThe playoffs are now underway with the top 8 players. You can follow the results from your dashboard.\n\nWe hope to see you again next season. Keep practising and come back even stronger.\n\nBest regards,\nTenis del Parque Team'
    }
  }
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AdminMessagesPage() {
  const [leagues, setLeagues] = useState([])
  const [players, setPlayers] = useState([])
  
  const [audienceType, setAudienceType] = useState('league')
  const [selectedLeagueId, setSelectedLeagueId] = useState('')
  const [selectedRound, setSelectedRound] = useState('')
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [channelEmail, setChannelEmail] = useState(true)
  const [channelPush, setChannelPush] = useState(true)
  const [template, setTemplate] = useState('custom')
  const [language, setLanguage] = useState('auto')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [sendError, setSendError] = useState(null)
  
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [activeTab, setActiveTab] = useState('standard')
  
  // Personalized mode state
  const [pIntro, setPIntro] = useState({
    es: '\u00a1Hola! La temporada regular de la Silver League est\u00e1 llegando a su fin y queremos que todos teng\u00e1is la oportunidad de jugar vuestros partidos pendientes.\n\nHemos extendido los plazos de todas las rondas hasta el domingo 12 de abril. Despu\u00e9s de esa fecha, los partidos no jugados quedar\u00e1n sin puntos para ambos jugadores.\n\nAqu\u00ed tienes tus partidos pendientes:',
    en: 'Hi! The Silver League regular season is coming to an end and we want everyone to have the chance to play their pending matches.\n\nWe\u2019ve extended the deadlines for all rounds to Sunday, April 12. After that date, unplayed matches will result in zero points for both players.\n\nHere are your pending matches:'
  })
  const [pOutro, setPOutro] = useState({
    es: 'Contacta a tus rivales por WhatsApp cuanto antes y acordad fecha y lugar. \u00a1Cada partido cuenta para la clasificaci\u00f3n de los playoffs!\n\nSi tienes cualquier problema para contactar a tu rival o necesitas ayuda, escr\u00edbenos.\n\n\u00a1Nos vemos en la pista!',
    en: 'Contact your opponents via WhatsApp as soon as possible and agree on a date and venue. Every match counts for the playoff standings!\n\nIf you have any trouble reaching your opponent or need help, just let us know.\n\nSee you on the court!'
  })
  const [pSubject, setPSubject] = useState({
    es: '\ud83c\udfbe \u00daltimas 2 semanas \u2014 \u00a1Juega tus partidos pendientes antes del 12 de abril!',
    en: '\ud83c\udfbe Last 2 weeks \u2014 Play your pending matches before April 12!'
  })
  const [pDeadline, setPDeadline] = useState('')
  
  const [availableRounds, setAvailableRounds] = useState([])

  useEffect(() => { fetchLeagues(); fetchHistory() }, [])
  
  useEffect(() => {
    if (selectedLeagueId && audienceType === 'individual') fetchPlayers(selectedLeagueId)
  }, [selectedLeagueId, audienceType])
  
  useEffect(() => {
    if (selectedLeagueId && audienceType === 'round_unplayed') fetchRounds(selectedLeagueId)
  }, [selectedLeagueId, audienceType])

  useEffect(() => {
    if (template !== 'custom') {
      const t = templates[template]
      const lang = language === 'auto' ? 'es' : language
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
      const res = await fetch('/api/admin/players?league=' + leagueId + '&status=confirmed,active')
      if (res.ok) { const data = await res.json(); setPlayers(data.players || []) }
    } catch (err) { console.error('Failed to fetch players:', err) }
  }

  const fetchRounds = async (leagueId) => {
    try {
      const res = await fetch('/api/admin/matches?league=' + leagueId)
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

  const [playoffSending, setPlayoffSending] = useState(false)
  const [playoffResult, setPlayoffResult] = useState(null)

  const handleSend = async () => {
    setSending(true); setSendResult(null); setSendError(null)
    try {
      const messagePayload = { subject, body, template }
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
    } catch (err) { setSendError(err.message) }
    finally { setSending(false) }
  }

  const buildAudience = () => {
    const audience = { type: audienceType }
    if (audienceType === 'league' || audienceType === 'league_non_playoff' || audienceType === 'round_unplayed') audience.leagueId = selectedLeagueId
    if (audienceType === 'round_unplayed') audience.round = parseInt(selectedRound)
    if (audienceType === 'individual') { audience.playerId = selectedPlayerId; audience.leagueId = selectedLeagueId }
    return audience
  }

  const handleReset = () => {
    setTemplate('custom'); setSubject(''); setBody('')
    setSendResult(null); setSendError(null)
  }

  const handlePlayoffPairings = async () => {
    if (!selectedLeagueId) { setSendError('Select a league first'); return }
    const confirmMsg = 'Send personalized playoff pairing emails + push notifications to all qualified players in this league?'
    if (!confirm(confirmMsg)) return
    setPlayoffSending(true); setSendError(null); setPlayoffResult(null)
    try {
      const res = await fetch(`/api/admin/leagues/${selectedLeagueId}/playoffs/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendEmails', group: 'A' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setPlayoffResult(data)
      fetchHistory()
    } catch (err) { setSendError(err.message) }
    finally { setPlayoffSending(false) }
  }

  const canSend = template === 'playoff_pairings'
    ? !!selectedLeagueId
    : body.trim() && (channelEmail || channelPush) && 
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
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'standard', label: 'Standard' },
            { id: 'personalized', label: 'Personalized' },
            { id: 'history', label: 'History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSendResult(null); setSendError(null) }}
              className={'px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' + (
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {tab.id === 'history' && history.length > 0 && (
                <span className="ml-1 bg-gray-300 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'history' ? (
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
                      {' \u00b7 '}{msg.sentByName}
                    </p>
                  </div>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                    {msg.audience?.type === 'all' && 'All Players'}
                    {msg.audience?.type === 'league' && (msg.audience?.leagueName || 'League')}
                    {msg.audience?.type === 'league_non_playoff' && ((msg.audience?.leagueName || 'League') + ' (non-playoff)')}
                    {msg.audience?.type === 'round_unplayed' && 'Round ' + msg.audience?.round + ' unplayed'}
                    {msg.audience?.type === 'individual' && (msg.audience?.playerName || 'Player')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{msg.message?.body}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{msg.stats?.targetedPlayers || 0} players</span>
                  {msg.channels?.email && <span>{msg.stats?.emailsSent || 0} emails{msg.stats?.emailsFailed > 0 && ' (' + msg.stats.emailsFailed + ' failed)'}</span>}
                  {msg.channels?.push && <span>{msg.stats?.pushSent || 0} push</span>}
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'personalized' ? (
        /* PERSONALIZED MATCHES MESSAGE */
        <PersonalizedTab
          leagues={leagues}
          selectedLeagueId={selectedLeagueId}
          setSelectedLeagueId={setSelectedLeagueId}
          channelEmail={channelEmail}
          setChannelEmail={setChannelEmail}
          channelPush={channelPush}
          setChannelPush={setChannelPush}
          pSubject={pSubject}
          setPSubject={setPSubject}
          pIntro={pIntro}
          setPIntro={setPIntro}
          pOutro={pOutro}
          setPOutro={setPOutro}
          pDeadline={pDeadline}
          setPDeadline={setPDeadline}
          sending={sending}
          setSending={setSending}
          sendResult={sendResult}
          setSendResult={setSendResult}
          sendError={sendError}
          setSendError={setSendError}
          fetchHistory={fetchHistory}
        />
      ) : (
        /* COMPOSE STANDARD MESSAGE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-5">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Audience</h3>
              <div className="space-y-3">
                <select value={audienceType} onChange={(e) => setAudienceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent">
                  <option value="all">All Players (all leagues)</option>
                  <option value="league">Entire League</option>
                  <option value="league_non_playoff">League - Non-playoff players only</option>
                  <option value="round_unplayed">Round — Unplayed Only</option>
                  <option value="individual">Individual Player</option>
                </select>
                {(audienceType === 'league' || audienceType === 'league_non_playoff' || audienceType === 'round_unplayed' || audienceType === 'individual') && (
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
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Language</h3>
              <div className="flex gap-2">
                {[
                  { value: 'auto', label: 'Auto', desc: 'Per player' },
                  { value: 'es', label: 'ES', desc: 'Espa\u00f1ol' },
                  { value: 'en', label: 'EN', desc: 'English' }
                ].map(opt => (
                  <button key={opt.value} onClick={() => setLanguage(opt.value)}
                    className={'flex-1 px-3 py-2.5 rounded-lg text-center transition-colors ' + (
                      language === opt.value ? 'bg-parque-purple text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    )}>
                    <div className="text-sm font-semibold">{opt.label}</div>
                    <div className={'text-[10px] ' + (language === opt.value ? 'text-purple-200' : 'text-gray-400')}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Channels</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <span className="text-sm text-gray-700">Email</span>
                  <input type="checkbox" checked={channelEmail} onChange={(e) => setChannelEmail(e.target.checked)} className="h-4 w-4 text-parque-purple rounded" />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <span className="text-sm text-gray-700">Push Notification</span>
                  <input type="checkbox" checked={channelPush} onChange={(e) => setChannelPush(e.target.checked)} className="h-4 w-4 text-parque-purple rounded" />
                </label>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Quick Templates</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(templates).map(([key, t]) => (
                  <button key={key} onClick={() => setTemplate(key)}
                    className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (
                      template === key ? 'bg-parque-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}>{t.label}</button>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm">Compose</h3>
              {template === 'playoff_pairings' ? (
                /* Special Playoff Pairings UI */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">\ud83c\udfc6</span>
                      <h4 className="font-semibold text-amber-900">Personalized Playoff Pairings</h4>
                    </div>
                    <p className="text-sm text-amber-800 mb-3">
                      Each qualified player will receive a personalized email + push notification with:
                    </p>
                    <ul className="text-sm text-amber-700 space-y-1 ml-4 list-disc">
                      <li>Their seed number and qualification position</li>
                      <li>Their quarterfinal opponent name and seed</li>
                      <li>WhatsApp link to contact their opponent</li>
                      <li>Link to view the full bracket</li>
                    </ul>
                  </div>
                  {!selectedLeagueId && (
                    <p className="text-sm text-red-600">\u2190 Select a league with initialized playoffs first</p>
                  )}
                  {sendError && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{sendError}</div>}
                  {playoffResult ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                      <h3 className="font-semibold text-green-800 mb-3">\u2705 Playoff Pairings Sent!</h3>
                      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                        <div className="bg-white rounded-lg p-3 text-center"><div className="text-xl font-bold">{playoffResult.results?.length || 0}</div><div className="text-xs text-gray-500">Emails</div></div>
                        <div className="bg-white rounded-lg p-3 text-center"><div className="text-xl font-bold text-purple-600">{playoffResult.pushSent || 0}</div><div className="text-xs text-gray-500">Push</div></div>
                        <div className="bg-white rounded-lg p-3 text-center"><div className={"text-xl font-bold " + (playoffResult.errors?.length > 0 ? 'text-red-600' : 'text-gray-300')}>{playoffResult.errors?.length || 0}</div><div className="text-xs text-gray-500">Errors</div></div>
                      </div>
                      {playoffResult.results?.length > 0 && (
                        <details className="text-xs text-gray-600">
                          <summary className="cursor-pointer text-green-700 font-medium">Show delivery details</summary>
                          <div className="mt-2 space-y-1">
                            {playoffResult.results.map((r, i) => (
                              <div key={i} className="flex items-center gap-2 py-0.5">
                                <span className="font-medium">{r.player}</span>
                                <span className="text-green-600">\u2713 {r.email}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                      <button onClick={() => { setPlayoffResult(null); setSendError(null); setTemplate('custom') }}
                        className="mt-4 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Done</button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button onClick={handlePlayoffPairings}
                        disabled={playoffSending || !selectedLeagueId}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 flex items-center gap-2">
                        {playoffSending ? 'Sending...' : '\ud83c\udfc6 Send Playoff Pairings'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Standard Compose UI */
                <>
              {channelEmail && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                  <input type="text" value={subject} onChange={(e) => { setSubject(e.target.value); setTemplate('custom') }}
                    placeholder="Email subject line..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
                <textarea value={body} onChange={(e) => { setBody(e.target.value); if (template !== 'custom') setTemplate('custom') }}
                  placeholder="Write your message here..." rows={8}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent resize-y" />
              </div>
              </>
              )}
            </div>
            
            {template !== 'playoff_pairings' && sendError && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{sendError}</div>}
            
            {template !== 'playoff_pairings' && (sendResult ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <h3 className="font-semibold text-green-800 mb-3">Message Sent!</h3>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div className="bg-white rounded-lg p-3 text-center"><div className="text-xl font-bold">{sendResult.stats?.targetedPlayers || 0}</div><div className="text-xs text-gray-500">Players</div></div>
                  <div className="bg-white rounded-lg p-3 text-center"><div className="text-xl font-bold text-blue-600">{sendResult.stats?.emailsSent || 0}</div><div className="text-xs text-gray-500">Emails</div></div>
                  <div className="bg-white rounded-lg p-3 text-center"><div className="text-xl font-bold text-purple-600">{sendResult.stats?.pushSent || 0}</div><div className="text-xs text-gray-500">Push</div></div>
                </div>
                <button onClick={handleReset} className="mt-3 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Send Another</button>
              </div>
            ) : (
              <div className="flex items-center justify-end">
                <button onClick={handleSend} disabled={sending || !canSend}
                  className="px-6 py-2.5 bg-parque-purple text-white rounded-lg font-medium text-sm hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2">
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
