/**
 * Compute the effective league status based on actual dates.
 * 
 * The DB `status` field is manually managed and can get stale.
 * This function checks real dates to determine the true status:
 * 
 * - registration_open → only if registrationEnd hasn't passed (and registrationStart has arrived)
 * - If registration ended but season hasn't started yet → coming_soon
 * - If season is ongoing → active
 * - If season has ended → completed
 * 
 * For non-registration_open statuses, we also check if an 'active' league 
 * has actually ended, upgrading it to 'completed'.
 * 
 * @param {Object} league - Plain league object (from .lean())
 * @param {Date} [now] - Optional current date (for testing)
 * @returns {string} The effective status
 */
export function getEffectiveLeagueStatus(league, now = new Date()) {
  const dbStatus = league.status
  const config = league.seasonConfig || {}
  
  const regStart = config.registrationStart ? new Date(config.registrationStart) : null
  const regEnd = config.registrationEnd ? new Date(config.registrationEnd) : null
  const seasonStart = config.startDate ? new Date(config.startDate) : null
  const seasonEnd = config.endDate ? new Date(config.endDate) : null
  
  if (dbStatus === 'registration_open') {
    // Check if registration hasn't started yet
    if (regStart && now < regStart) {
      return 'coming_soon'
    }
    
    // Check if registration period has ended
    if (regEnd && now > regEnd) {
      // Registration closed - determine what phase we're in
      if (seasonEnd && now > seasonEnd) {
        return 'completed'
      }
      // Season is ongoing or about to start
      return 'active'
    }
    
    // Registration is genuinely open
    return 'registration_open'
  }
  
  if (dbStatus === 'active') {
    // Check if the season has actually ended
    if (seasonEnd && now > seasonEnd) {
      return 'completed'
    }
    return 'active'
  }
  
  // For other statuses (coming_soon, completed, archived, inactive), trust the DB
  return dbStatus
}

/**
 * Apply effective status to an array of plain league objects.
 * Returns new array with corrected statuses.
 * 
 * @param {Object[]} leagues - Array of plain league objects
 * @param {Date} [now] - Optional current date (for testing)
 * @returns {Object[]} New array with corrected statuses
 */
export function applyEffectiveStatuses(leagues, now = new Date()) {
  return leagues.map(league => ({
    ...league,
    status: getEffectiveLeagueStatus(league, now)
  }))
}
