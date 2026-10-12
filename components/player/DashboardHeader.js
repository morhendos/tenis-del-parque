'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Camera } from 'lucide-react'
import { getMaskedName, isDemoModeActive } from '@/lib/utils/demoMode'
import MobileHeaderSlot from './MobileHeaderSlot'
import PlayerAvatar from './PlayerAvatar'
import EloInfoLink from './EloInfoLink'

const OPENRANK_MATCHES_REQUIRED = 8

const content = {
  es: {
    levels: { beginner: 'Bronce', intermediate: 'Plata', advanced: 'Oro' },
    elo: 'ELO',
    matches: 'Partidos',
    league: 'Liga',
    of: 'de',
    openRank: 'OpenRank',
    toQualify: 'para entrar',
    addPhoto: 'Añadir foto'
  },
  en: {
    levels: { beginner: 'Bronze', intermediate: 'Silver', advanced: 'Gold' },
    elo: 'ELO',
    matches: 'Matches',
    league: 'League',
    of: 'of',
    openRank: 'OpenRank',
    toQualify: 'to qualify',
    addPhoto: 'Add photo'
  }
}

export default function DashboardHeader({ player, language, leagueInfo = null, standings = null }) {
  const params = useParams()
  const locale = params?.locale || 'es'
  const t = content[language] || content.es
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [compact, setCompact] = useState(false)
  const [openRankPosition, setOpenRankPosition] = useState(null)

  useEffect(() => {
    setIsDemoMode(isDemoModeActive())
  }, [])

  useEffect(() => {
    const el = document.getElementById('player-scroll')
    if (!el) return
    const onScroll = () => {
      const extraContent = el.scrollHeight - el.clientHeight
      setCompact(prev => (prev ? el.scrollTop > 8 : el.scrollTop > 60 && extraContent > 160))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const matchesPlayed = player?.stats?.matchesPlayed || 0
  const rows = standings?.unifiedStandings || []
  const myIndex = rows.findIndex(s => String(s.player._id) === String(player?._id))
  const showLeaguePosition = leagueInfo?.status === 'active' && myIndex >= 0
  const qualified = matchesPlayed >= OPENRANK_MATCHES_REQUIRED

  useEffect(() => {
    if (showLeaguePosition || !qualified || !player?._id) return
    let cancelled = false
    fetch('/api/openrank')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled || !d) return
        const me = (d.rankings || []).find(r => String(r._id) === String(player._id))
        if (me) setOpenRankPosition(me.position)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [showLeaguePosition, qualified, player?._id])

  const displayName = isDemoMode ? getMaskedName(player.name) : player.name
  const registration = (player?.registrations || []).find(r => String(r.league?._id || r.league) === String(leagueInfo?._id))
  const level = registration?.level ? t.levels[registration.level] : null
  const subtitle = [leagueInfo?.location, level].filter(Boolean).join(' · ')
  const hasPhoto = !!player?.avatar && !isDemoMode

  const tile = 'bg-white/20 backdrop-blur-sm rounded-xl px-2 py-2.5 text-center border border-white/20'

  return (
    <MobileHeaderSlot>
    {(inSlot) => (
    <div className={`${inSlot ? 'relative' : 'sticky top-0 z-30 sm:relative -mx-2 -mt-2 sm:mx-0 sm:mt-0'} overflow-hidden bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600 text-white px-4 ${compact ? 'pt-3 pb-3' : 'pt-6 pb-4'} sm:p-6 shadow-xl sm:rounded-2xl transition-[padding] duration-300`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-16 -right-16 w-64 h-64 sm:-top-24 sm:-right-24 sm:w-96 sm:h-96 bg-white rounded-full"></div>
        <div className="absolute -bottom-16 -left-16 w-44 h-44 sm:-bottom-24 sm:-left-24 sm:w-64 sm:h-64 bg-white rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/${locale}/player/profile`} className="relative flex-shrink-0" aria-label={hasPhoto ? displayName : t.addPhoto}>
            <PlayerAvatar
              name={displayName}
              avatar={hasPhoto ? player.avatar : null}
              country={player?.country}
              size={compact ? 'md' : 'hero'}
              onDark
              className="transition-all duration-300"
            />
            {!hasPhoto && !compact && (
              <span className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-white text-parque-purple shadow flex items-center justify-center">
                <Camera className="w-3.5 h-3.5" />
              </span>
            )}
          </Link>
          <div className="min-w-0">
            <h1 className={`${compact ? 'text-lg' : 'text-xl'} sm:text-2xl font-bold leading-tight truncate`}>{displayName}</h1>
            {subtitle && (
              <p className={`text-purple-100 text-sm truncate ${compact ? 'hidden sm:block' : ''}`}>{subtitle}</p>
            )}
          </div>
        </div>

        <div className={`${compact ? 'hidden sm:grid' : 'grid'} grid-cols-3 gap-2 sm:w-80 flex-shrink-0`}>
          <div className={tile}>
            <div className="text-[11px] text-purple-100 inline-flex items-center gap-1">{t.elo} <EloInfoLink locale={locale} variant="icon" /></div>
            <div className="text-xl font-bold tabular-nums leading-tight">{player?.eloRating || 1200}</div>
          </div>

          <Link href={`/${locale}/player/matches`} className={`${tile} hover:bg-white/30 transition-colors`}>
            <div className="text-[11px] text-purple-100">{t.matches}</div>
            <div className="text-xl font-bold tabular-nums leading-tight">{matchesPlayed}</div>
          </Link>

          {showLeaguePosition ? (
            <Link href={`/${locale}/player/league`} className={`${tile} hover:bg-white/30 transition-colors`}>
              <div className="text-[11px] text-purple-100">{t.league}</div>
              <div className="text-xl font-bold tabular-nums leading-tight">
                #{myIndex + 1}<span className="text-xs font-medium text-purple-100"> {t.of} {rows.length}</span>
              </div>
            </Link>
          ) : (
            <Link href={`/${locale}/player/openrank`} className={`${tile} hover:bg-white/30 transition-colors`}>
              <div className="text-[11px] text-purple-100">{t.openRank}</div>
              {qualified ? (
                <div className="text-xl font-bold tabular-nums leading-tight">{openRankPosition ? `#${openRankPosition}` : '-'}</div>
              ) : (
                <div className="leading-tight">
                  <span className="text-xl font-bold tabular-nums">{OPENRANK_MATCHES_REQUIRED - matchesPlayed}</span>
                  <span className="text-[10px] text-purple-100"> {t.toQualify}</span>
                </div>
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
    )}
    </MobileHeaderSlot>
  )
}
