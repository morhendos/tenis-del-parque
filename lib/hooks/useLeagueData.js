import { useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { findBestDefaultRegistration } from '@/lib/utils/leagueSelection'

const SEASON_DB_NAMES = {
  'Summer 2025': 'summer-2025',
  'Winter 2025': 'winter-2025',
  'Spring 2025': 'spring-2025',
  'Autumn 2025': 'autumn-2025',
  'Fall 2025': 'autumn-2025',
  'Summer 2026': 'summer-2026',
  'Winter 2026': 'winter-2026',
  'Spring 2026': 'spring-2026',
  'Autumn 2026': 'autumn-2026',
  'Fall 2026': 'autumn-2026',
  'Verano 2025': 'summer-2025',
  'Invierno 2025': 'winter-2025',
  'Primavera 2025': 'spring-2025',
  'Otoño 2025': 'autumn-2025',
  'Verano 2026': 'summer-2026',
  'Invierno 2026': 'winter-2026',
  'Primavera 2026': 'spring-2026',
  'Otoño 2026': 'autumn-2026'
}

const seasonToDbName = (seasonName) => SEASON_DB_NAMES[seasonName] || seasonName

function selectLeague(profilePlayer, leagueIdParam) {
  if (!profilePlayer) return { league: null, registration: null }

  const registrations = profilePlayer.registrations || []
  let registration = null

  if (leagueIdParam) {
    registration = registrations.find(reg => reg.league?._id === leagueIdParam) || null
  }

  if (!registration?.league && registrations.length > 0) {
    registration = findBestDefaultRegistration(registrations) || null
  }

  if (registration?.league) return { league: registration.league, registration }

  if (profilePlayer.league) {
    return {
      league: profilePlayer.league,
      registration: {
        league: profilePlayer.league,
        level: profilePlayer.level,
        status: profilePlayer.status,
        stats: profilePlayer.stats
      }
    }
  }

  return { league: null, registration: null }
}

export function useLeagueData() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leagueIdParam = searchParams.get('leagueId')

  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
    mutate: mutateProfile
  } = useSWR('/api/player/profile')

  useEffect(() => {
    if (profileError?.status === 401) router.push('/login')
  }, [profileError, router])

  const profilePlayer = profileData?.player || null

  const { league: currentLeague, registration } = useMemo(
    () => selectLeague(profilePlayer, leagueIdParam),
    [profilePlayer, leagueIdParam]
  )

  const leagueId = currentLeague ? (currentLeague._id || currentLeague) : null
  const dbSeasonName = seasonToDbName(registration?.season || 'Verano 2025')

  const standingsKey = leagueId ? `/api/leagues/${leagueId}/standings?season=${dbSeasonName}` : null
  const matchesKey = leagueId ? `/api/leagues/${leagueId}/matches?season=${dbSeasonName}&limit=200` : null

  const {
    data: standingsData,
    isLoading: standingsLoading,
    mutate: mutateStandings
  } = useSWR(standingsKey)

  const { data: matchesData, mutate: mutateMatches } = useSWR(matchesKey)

  const schedule = useMemo(() => matchesData?.matches || [], [matchesData])
  const matches = useMemo(() => schedule.filter(match => match.status === 'completed'), [schedule])

  const player = useMemo(() => {
    if (!profilePlayer) return null
    if (!currentLeague) return profilePlayer
    return {
      ...profilePlayer,
      league: currentLeague,
      level: registration?.level,
      status: registration?.status,
      stats: registration?.stats,
      registrations: profilePlayer.registrations
    }
  }, [profilePlayer, currentLeague, registration])

  const allRegistrations = useMemo(() => profilePlayer?.registrations || [], [profilePlayer])

  const refetch = useCallback(
    () => Promise.all([mutateProfile(), mutateStandings(), mutateMatches()]),
    [mutateProfile, mutateStandings, mutateMatches]
  )

  const loading = profileLoading || (!!standingsKey && standingsLoading)
  const error = profileError && profileError.status !== 401
    ? (profileError.message || 'Failed to load league data')
    : ''

  return {
    standings: standingsData ?? null,
    matches,
    schedule,
    loading,
    error,
    player,
    currentLeague,
    allRegistrations,
    refetch
  }
}
