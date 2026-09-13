// Shared helpers for picking which league/registration to show by default.
// Used by usePlayerDashboard and useLeagueData so both pages agree.

// Compute the "effective" status of a league, correcting stale DB data:
// - playoffs currently running -> 'playoffs' (highest priority)
// - playoffs finished -> 'completed' even if status still says 'active'
// - season end date in the past -> 'completed' even if status still says 'active'
// - unknown/legacy statuses (e.g. 'inactive') -> treated as 'archived' (lowest priority)
export function getEffectiveLeagueStatus(league) {
  if (!league) return 'archived'

  const status = league.status || 'completed'
  const phase = league.playoffConfig?.currentPhase
  const endDate = league.seasonConfig?.endDate

  const isInPlayoffs = phase && phase !== 'regular_season' && phase !== 'completed'
  if (isInPlayoffs) return 'playoffs'

  if (phase === 'completed') return 'completed'

  if (status === 'active' && endDate && new Date(endDate) < new Date()) {
    return 'completed'
  }

  const known = ['active', 'registration_open', 'coming_soon', 'completed', 'archived']
  if (!known.includes(status)) return 'archived'

  return status
}

// Priority order for default selection. Lower index = shown first.
const PRIORITY_ORDER = ['playoffs', 'active', 'registration_open', 'coming_soon', 'completed', 'archived']

export function findBestDefaultRegistration(registrations) {
  if (!registrations || registrations.length === 0) return null

  const sorted = [...registrations].sort((a, b) => {
    const priorityA = PRIORITY_ORDER.indexOf(getEffectiveLeagueStatus(a.league))
    const priorityB = PRIORITY_ORDER.indexOf(getEffectiveLeagueStatus(b.league))

    if (priorityA !== priorityB) return priorityA - priorityB

    // Same priority: prefer the season that started (or was registered) most recently
    const dateA = new Date(a.league?.seasonConfig?.startDate || a.registeredAt || 0)
    const dateB = new Date(b.league?.seasonConfig?.startDate || b.registeredAt || 0)
    return dateB - dateA
  })

  return sorted[0]
}
