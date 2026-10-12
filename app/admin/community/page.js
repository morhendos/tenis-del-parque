'use client'

import { useState, useEffect } from 'react'
import CommunityFeed from '@/components/player/community/CommunityFeed'

const TEMPLATE_ES = '¡Bienvenidos a la nueva temporada! 🎾 Recordad contactar con vuestro rival y agendar el partido antes de la fecha límite. ¡Mucha suerte a todos!'
const TEMPLATE_EN = 'Welcome to the new season! 🎾 Remember to contact your rival and schedule your match before the deadline. Good luck everyone!'

export default function AdminCommunityPage() {
  const [leagues, setLeagues] = useState([])
  const [leagueId, setLeagueId] = useState('')
  const [textEs, setTextEs] = useState('')
  const [textEn, setTextEn] = useState('')
  const [pinned, setPinned] = useState(true)
  const [push, setPush] = useState(true)
  const [posting, setPosting] = useState(false)
  const [message, setMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetch('/api/admin/leagues')
      .then(r => r.json())
      .then(d => {
        const list = (d.leagues || []).filter(l => ['active', 'registration_open', 'coming_soon'].includes(l.status))
        setLeagues(list)
        if (list.length && !leagueId) setLeagueId(String(list[0]._id))
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (!leagueId || (!textEs.trim() && !textEn.trim())) return
    setPosting(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league: leagueId, text: textEs, textEn, pinned, push })
      })
      if (!res.ok) throw new Error()
      setTextEs('')
      setTextEn('')
      setMessage(push ? 'Posted and push sent.' : 'Posted.')
      setRefreshKey(k => k + 1)
    } catch {
      setMessage('Failed to post.')
    } finally {
      setPosting(false)
    }
  }

  const input = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <p className="text-sm text-gray-500">Post to a league board as Tenis del Parque, pin posts and moderate.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">League</label>
          <select value={leagueId} onChange={e => setLeagueId(e.target.value)} className={input}>
            {leagues.map(l => <option key={l._id} value={l._id}>{l.name} ({l.status})</option>)}
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-gray-500">Spanish text</label>
            <button type="button" onClick={() => { setTextEs(TEMPLATE_ES); setTextEn(TEMPLATE_EN) }} className="text-xs text-parque-purple hover:underline">
              Use season welcome template
            </button>
          </div>
          <textarea value={textEs} onChange={e => setTextEs(e.target.value)} rows={3} maxLength={1000} className={input} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">English text</label>
          <textarea value={textEn} onChange={e => setTextEn(e.target.value)} rows={3} maxLength={1000} className={input} />
          <p className="mt-1 text-xs text-gray-400">Each player sees their own language. If one is empty, the other is shown to everyone.</p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} /> Pin to top
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={push} onChange={e => setPush(e.target.checked)} /> Send push to league players
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={submit} disabled={posting || !leagueId || (!textEs.trim() && !textEn.trim())} className="px-5 py-2 rounded-lg bg-parque-purple text-white text-sm font-semibold disabled:opacity-40">
            {posting ? 'Posting...' : 'Post'}
          </button>
          {message && <span className="text-sm text-gray-600">{message}</span>}
        </div>
      </div>

      {leagueId && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Board</h2>
          <CommunityFeed leagueId={leagueId} language="en" adminMode refreshKey={refreshKey} />
        </div>
      )}
    </div>
  )
}
