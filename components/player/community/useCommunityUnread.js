'use client'

import { useState, useEffect } from 'react'
import { isUnread } from './communityUtils'

const cache = new Map()
const TTL = 60000

async function fetchLatest(leagueId) {
  const hit = cache.get(leagueId)
  if (hit && Date.now() - hit.at < TTL) return hit.data
  const res = await fetch(`/api/player/community?league=${leagueId}&limit=2`)
  if (!res.ok) throw new Error()
  const data = await res.json()
  cache.set(leagueId, { at: Date.now(), data })
  return data
}

export function useCommunityLatest(leagueId) {
  const [data, setData] = useState(null)
  const [unread, setUnread] = useState(false)

  useEffect(() => {
    if (!leagueId) return
    let cancelled = false
    fetchLatest(leagueId)
      .then(d => {
        if (cancelled) return
        setData(d)
        setUnread(isUnread(leagueId, d.latestAt))
      })
      .catch(() => {})
    const onSeen = (e) => {
      if (String(e.detail?.leagueId) === String(leagueId)) setUnread(false)
    }
    window.addEventListener('tdp-community-seen', onSeen)
    return () => {
      cancelled = true
      window.removeEventListener('tdp-community-seen', onSeen)
    }
  }, [leagueId])

  return { data, unread }
}
