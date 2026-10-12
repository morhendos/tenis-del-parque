'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Swords, Trophy, BarChart3, History, Pencil } from 'lucide-react'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'
import PlayerAvatar from '@/components/player/PlayerAvatar'
import PlayerLink from '@/components/player/PlayerLink'
import TennisProfileCard from '@/components/player/TennisProfileCard'
import EloInfoLink from '@/components/player/EloInfoLink'
import { countryName } from '@/lib/utils/countries'
import { formatPlayerNameForPublic } from '@/lib/utils/playerNameUtils'
import { getMaskedName, isDemoModeActive } from '@/lib/utils/demoMode'

const content = {
  es: {
    back: 'Volver',
    notFound: 'Jugador no encontrado',
    loading: 'Cargando perfil...',
    levels: { beginner: 'Bronce', intermediate: 'Plata', advanced: 'Oro' },
    elo: 'ELO',
    openRank: 'OpenRank',
    toQualify: (n) => `${n} para entrar`,
    winRate: 'Victorias',
    editProfile: 'Editar mi perfil',
    h2hTitle: 'Cara a cara',
    you: 'Tú',
    league: 'Liga actual',
    lastLeague: 'Última liga',
    position: 'Posición',
    of: 'de',
    points: 'Puntos',
    played: 'Jugados',
    wl: 'G-P',
    sets: 'Sets',
    games: 'Juegos',
    allTime: 'Total histórico',
    matches: 'Partidos',
    wins: 'Victorias',
    leagues: 'Ligas',
    bestElo: 'Mejor ELO',
    recent: 'Últimos resultados',
    noResults: 'Todavía no hay partidos jugados.',
    round: 'Ronda',
    playoff: 'Playoff',
    won: 'V',
    lost: 'D',
    ret: 'ret.'
  },
  en: {
    back: 'Back',
    notFound: 'Player not found',
    loading: 'Loading profile...',
    levels: { beginner: 'Bronze', intermediate: 'Silver', advanced: 'Gold' },
    elo: 'ELO',
    openRank: 'OpenRank',
    toQualify: (n) => `${n} to qualify`,
    winRate: 'Win rate',
    editProfile: 'Edit my profile',
    h2hTitle: 'Head to head',
    you: 'You',
    league: 'Current league',
    lastLeague: 'Last league',
    position: 'Position',
    of: 'of',
    points: 'Points',
    played: 'Played',
    wl: 'W-L',
    sets: 'Sets',
    games: 'Games',
    allTime: 'All-time',
    matches: 'Matches',
    wins: 'Wins',
    leagues: 'Leagues',
    bestElo: 'Best ELO',
    recent: 'Recent results',
    noResults: 'No matches played yet.',
    round: 'Round',
    playoff: 'Playoff',
    won: 'W',
    lost: 'L',
    ret: 'ret.'
  }
}

function Card({ icon: Icon, title, right, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 text-parque-purple flex-shrink-0" />
          <h2 className="font-semibold text-gray-900 text-sm truncate">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-gray-50 py-2.5 px-2 text-center">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-base font-bold text-gray-900 tabular-nums">{value}</div>
      {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
    </div>
  )
}

const pair = (a, b) => (
  <span>
    <span className="text-parque-purple">{a}</span>
    <span className="text-gray-300">-</span>
    <span className="text-gray-500">{b}</span>
  </span>
)

export default function PlayerPublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale || 'es'
  const t = content[locale] || content.es
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setIsDemo(isDemoModeActive())
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await fetch(`/api/player/players/${params.id}`)
        if (res.status === 401) {
          router.push('/login')
          return
        }
        if (!res.ok) throw new Error()
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id, router])

  const displayName = (name, full = false) => {
    const n = isDemo ? getMaskedName(name) : name
    return full ? n : formatPlayerNameForPublic(n)
  }

  const formatScore = (m) => {
    if (m.walkover) return 'W/O'
    const s = m.sets.map(x => `${x.mine}-${x.theirs}`).join(' ')
    return m.retired ? `${s} ${t.ret}` : s
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short' }) : ''

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push(`/${locale}/player/league`)
  }

  if (loading) return <TennisPreloaderInline text={t.loading} locale={locale} />

  if (notFound || !data) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={goBack} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-parque-purple">
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">{t.notFound}</div>
      </div>
    )
  }

  const { player, isMe, openRank, league, allTime, recentResults, headToHead } = data
  const winRate = allTime.matchesPlayed > 0 ? Math.round((allTime.matchesWon / allTime.matchesPlayed) * 100) : null
  const country = player.country ? countryName(player.country, locale) : ''
  const showH2H = headToHead && headToHead.matches.length > 0

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-6">
      <button onClick={goBack} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-parque-purple">
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      <div className="relative overflow-hidden bg-gradient-to-br from-parque-purple via-purple-600 to-indigo-600 rounded-2xl text-white p-5">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full" />
        <div className="relative flex items-center gap-4">
          <PlayerAvatar
            name={displayName(player.name, true)}
            avatar={isDemo ? null : player.avatar}
            country={player.country}
            size="lg"
            onDark
          />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight break-words">{displayName(player.name, isMe)}</h1>
            {country && <div className="mt-1 text-sm text-purple-100">{country}</div>}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {player.level && (
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">{t.levels[player.level] || player.level}</span>
              )}
              {isMe && (
                <Link href={`/${locale}/player/profile`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-parque-purple text-xs font-semibold">
                  <Pencil className="w-3 h-3" /> {t.editProfile}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-3 gap-2">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
            <div className="text-xs text-purple-100">{t.elo}</div>
            <div className="text-xl font-bold tabular-nums">{player.eloRating}</div>
          </div>
          <Link href={`/${locale}/player/openrank`} className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
            <div className="text-xs text-purple-100">{t.openRank}</div>
            {openRank.position ? (
              <div className="text-xl font-bold tabular-nums">#{openRank.position}</div>
            ) : (
              <div className="text-xs font-semibold mt-1.5">{t.toQualify(openRank.matchesToQualify)}</div>
            )}
          </Link>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
            <div className="text-xs text-purple-100">{t.winRate}</div>
            <div className="text-xl font-bold tabular-nums">{winRate === null ? '-' : `${winRate}%`}</div>
          </div>
        </div>
        <div className="relative mt-3 text-center">
          <EloInfoLink locale={locale} className="!text-purple-100" />
        </div>
      </div>

      {showH2H && (
        <Card icon={Swords} title={t.h2hTitle}>
          <div className="px-4 pt-4 pb-2 flex items-center justify-center gap-4">
            <div className="text-center w-20">
              <div className="text-xs text-gray-500">{t.you}</div>
              <div className="text-3xl font-bold text-parque-purple tabular-nums">{headToHead.myWins}</div>
            </div>
            <div className="text-gray-300 text-2xl">-</div>
            <div className="text-center w-20">
              <div className="text-xs text-gray-500 truncate">{displayName(player.name)}</div>
              <div className="text-3xl font-bold text-gray-900 tabular-nums">{headToHead.theirWins}</div>
            </div>
          </div>
          <div className="px-4 pb-3 divide-y divide-gray-50">
            {headToHead.matches.map(m => (
              <div key={m._id} className="flex items-center justify-between py-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${m.won ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {m.won ? t.won : t.lost}
                  </span>
                  <span className="text-gray-500 truncate">{m.league?.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-gray-900">{formatScore(m)}</span>
                  <span className="text-xs text-gray-400">{formatDate(m.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {league && (
        <Card icon={Trophy} title={league.status === 'active' ? t.league : t.lastLeague} right={<span className="text-xs text-gray-500 truncate">{league.name}</span>}>
          <div className="p-3 grid grid-cols-3 gap-2">
            <Stat label={t.position} value={league.position ? `#${league.position}` : '-'} sub={league.totalPlayers ? `${t.of} ${league.totalPlayers}` : null} />
            <Stat label={t.points} value={league.stats.totalPoints} />
            <Stat label={t.played} value={league.stats.matchesPlayed} />
            <Stat label={t.wl} value={pair(league.stats.matchesWon, league.stats.matchesLost)} />
            <Stat label={t.sets} value={pair(league.stats.setsWon, league.stats.setsLost)} />
            <Stat label={t.games} value={pair(league.stats.gamesWon, league.stats.gamesLost)} />
          </div>
        </Card>
      )}

      <Card icon={BarChart3} title={t.allTime}>
        <div className="p-3 grid grid-cols-3 gap-2">
          <Stat label={t.matches} value={allTime.matchesPlayed} />
          <Stat label={t.wins} value={allTime.matchesWon} />
          <Stat label={t.leagues} value={allTime.leagues} />
          <Stat label={t.sets} value={pair(allTime.setsWon, allTime.setsLost)} />
          <Stat label={t.games} value={pair(allTime.gamesWon, allTime.gamesLost)} />
          <Stat label={t.bestElo} value={player.highestElo} />
        </div>
      </Card>

      <div className="[&>div]:rounded-2xl">
        <TennisProfileCard tennisProfile={player.tennisProfile} language={locale} readOnly />
      </div>

      <Card icon={History} title={t.recent}>
        {recentResults.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-400">{t.noResults}</p>
        ) : (
          <div className="px-4 py-1 divide-y divide-gray-50">
            {recentResults.map(m => (
              <div key={m._id} className="flex items-center gap-3 py-2.5">
                <div className={`w-1 h-9 rounded-full flex-shrink-0 ${m.won ? 'bg-green-500' : 'bg-red-400'}`} />
                <PlayerAvatar name={m.opponent?.name} avatar={isDemo ? null : m.opponent?.avatar} country={m.opponent?.country} size="sm" />
                <div className="flex-1 min-w-0">
                  <PlayerLink playerId={m.opponent?._id} className="block text-sm font-medium text-gray-900 truncate">
                    {m.opponent ? displayName(m.opponent.name) : '-'}
                  </PlayerLink>
                  <div className="text-xs text-gray-500 truncate">
                    {m.matchType === 'playoff' ? t.playoff : `${t.round} ${m.round}`} · {formatDate(m.date)}
                  </div>
                </div>
                <span className="font-mono text-sm text-gray-900 flex-shrink-0">{formatScore(m)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
