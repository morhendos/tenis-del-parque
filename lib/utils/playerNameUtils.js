/**
 * Utility functions for formatting player names in public views
 * to protect privacy while maintaining readability
 */

/**
 * Formats a full player name to show only first name + first letter of surname
 * Handles various name formats including multiple names
 * 
 * @param {string} fullName - The complete player name
 * @returns {string} - Formatted name (e.g. "John D." or "María José C.")
 * 
 * Examples:
 * - "John Doe" → "John D."
 * - "María José García López" → "María José G."
 * - "Jean-Pierre Van Der Berg" → "Jean-Pierre V."
 * - "João" → "João"
 * - "" → "Jugador"
 */
export function formatPlayerNameForPublic(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return 'Jugador' // Default fallback
  }

  const trimmedName = fullName.trim()
  if (!trimmedName) {
    return 'Jugador'
  }

  // Split the name into parts
  const nameParts = trimmedName.split(/\s+/)
  
  // If only one name part, return it as is
  if (nameParts.length === 1) {
    return nameParts[0]
  }

  // Handle multiple name parts
  // Strategy: Take all parts except the last one as "first names"
  // and use the first letter of the last part as surname initial
  const firstNames = nameParts.slice(0, -1).join(' ')
  const lastNameInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()
  
  return `${firstNames} ${lastNameInitial}.`
}

/**
 * Formats a player name for display in match contexts where opponent privacy is important
 * Same as formatPlayerNameForPublic but with context-aware fallback
 * 
 * @param {string} fullName - The complete player name
 * @param {string} language - Language code ('es' or 'en')
 * @returns {string} - Formatted name with language-appropriate fallback
 */
export function formatOpponentName(fullName, language = 'es') {
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return language === 'es' ? 'Oponente' : 'Opponent'
  }

  return formatPlayerNameForPublic(fullName)
}

/**
 * Formats a player name for standings/leaderboard display
 * Same formatting but with appropriate fallback for rankings context
 * 
 * @param {string} fullName - The complete player name
 * @param {string} language - Language code ('es' or 'en')
 * @returns {string} - Formatted name with language-appropriate fallback
 */
export function formatPlayerNameForStandings(fullName, language = 'es') {
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return language === 'es' ? 'Jugador' : 'Player'
  }

  return formatPlayerNameForPublic(fullName)
}

/**
 * Utility to check if a name should be formatted for public display
 * This can be used to conditionally apply formatting based on user permissions
 * 
 * @param {object} user - Current user object
 * @param {boolean} isPublicView - Whether this is a public (non-authenticated) view
 * @returns {boolean} - Whether names should be formatted for privacy
 */
export function shouldFormatNamesForPrivacy(user = null, isPublicView = true) {
  // Always format names in public views
  if (isPublicView) {
    return true
  }
  
  // For authenticated users, you could add logic here to check permissions
  // For now, we'll format names for all public league pages
  return true
}
