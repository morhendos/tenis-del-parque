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
    levelLeague: { beginner: 'Liga Bronce', intermediate: 'Liga Plata', advanced: 'Liga Oro' },
    round: (r, n) => (n ? `Ronda ${r} de ${n}` : `Ronda ${r}`),
    playoffs: 'Playoffs',
    startsOn: (d) => `La temporada empieza el ${d}`,
    memberSince: (y) => `Jugador desde ${y}`,
    elo: 'ELO',
    matches: 'Partidos',
    wins: 'Victorias',
    league: 'Liga',
    of: 'de',
    openRank: 'OpenRank',
    toQualify: 'para entrar',
    addPhoto: 'Añadir foto'
  },
  en: {
    levelLeague: { beginner: 'Bronze League', intermediate: 'Silver League', advanced: 'Gold League' },
    round: (r, n) => (n ? `Round ${r} of ${n}` : `Round ${r}`),
    playoffs: 'Playoffs',
    startsOn: (d) => `Season starts ${d}`,
    memberSince: (y) => `Player since ${y}`,
    elo: 'ELO',
    matches: 'Matches',
    wins: 'Wins',
    league: 'League',
    of: 'of',
    openRank: 'OpenRank',
    toQualify: 'to qualify',
    addPhoto: 'Add photo'
  }
}

export default function DashboardHeader({ player, language, leagueInfo = null, standings = null, upcomingMatches = [], recentMatches = [] }) {
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
  const matchesWon = player?.stats?.matchesWon || 0
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
  const subtitle = (() => {
    const leagueLabel = leagueInfo?.level ? t.levelLeague[leagueInfo.level] : leagueInfo?.name
    const startDate = leagueInfo?.startDate ? new Date(leagueInfo.startDate) : null
    if (leagueInfo?.status === 'active' && startDate && startDate <= new Date()) {
      const phase = leagueInfo.playoffPhase
      if (phase && phase !== 'regular_season' && phase !== 'completed') return [leagueLabel, t.playoffs].filter(Boolean).join(' · ')
      const rounds = [...(upcomingMatches || []), ...(recentMatches || [])]
        .filter(m => String(m.leagueId) === String(leagueInfo._id) && m.matchType !== 'playoff')
        .map(m => m.round || 0)
      const round = rounds.length ? Math.max(...rounds) : null
      return [leagueLabel, round ? t.round(round, leagueInfo.totalRounds) : null].filter(Boolean).join(' · ')
    }
    if (startDate && startDate > new Date()) {
      return t.startsOn(startDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' }))
    }
    return player?.createdAt ? t.memberSince(new Date(player.createdAt).getFullYear()) : ''
  })()
  const hasPhoto = !!player?.avatar && !isDemoMode

  const tile = 'bg-white/20 backdrop-blur-sm rounded-xl px-1 py-2 text-center border border-white/20 min-w-0'
  const value = 'text-lg sm:text-xl font-bold tabular-nums leading-tight'

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

        <div className={`${compact ? 'hidden sm:grid' : 'grid'} grid-cols-4 gap-1.5 sm:gap-2 sm:w-[26rem] flex-shrink-0`}>
          <div className={tile}>
            <div className="text-[11px] text-purple-100 inline-flex items-center gap-1">{t.elo} <EloInfoLink locale={locale} variant="icon" /></div>
            <div className={value}>{player?.eloRating || 1200}</div>
          </div>

          <Link href={`/${locale}/player/matches`} className={`${tile} hover:bg-white/30 transition-colors`}>
            <div className="text-[11px] text-purple-100 truncate">{t.matches}</div>
            <div className={value}>{matchesPlayed}</div>
          </Link>

          <Link href={`/${locale}/player/matches`} className={`${tile} hover:bg-white/30 transition-colors`}>
            <div className="text-[11px] text-purple-100 truncate">{t.wins}</div>
            <div className={value}>{matchesWon}</div>
          </Link>

          {showLeaguePosition ? (
            <Link href={`/${locale}/player/league`} className={`${tile} hover:bg-white/30 transition-colors`}>
              <div className="text-[11px] text-purple-100 truncate">{t.league}</div>
              <div className={value}>
                #{myIndex + 1}<span className="text-[11px] font-medium text-purple-100">/{rows.length}</span>
              </div>
            </Link>
          ) : (
            <Link href={`/${locale}/player/openrank`} className={`${tile} hover:bg-white/30 transition-colors`}>
              <div className="text-[11px] text-purple-100 truncate">{t.openRank}</div>
              {qualified ? (
                <div className={value}>{openRankPosition ? `#${openRankPosition}` : '-'}</div>
              ) : (
                <div className="leading-tight">
                  <div className={value}>{OPENRANK_MATCHES_REQUIRED - matchesPlayed}</div>
                  <div className="text-[9px] text-purple-100 -mt-0.5">{t.toQualify}</div>
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
