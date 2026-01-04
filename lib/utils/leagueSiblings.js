/**
 * Utility to fetch sibling leagues (same city, same season, different skill levels)
 */

/**
 * Fetch leagues for a given city and season
 * @param {string} citySlug - City slug (e.g., 'malaga', 'sotogrande')
 * @param {string} seasonType - Season type (e.g., 'winter', 'summer')
 * @param {number} seasonYear - Season year (e.g., 2026)
 * @returns {Promise<Array>} Array of leagues with their slugs and skill levels
 */
export async function getSiblingLeagues(citySlug, seasonType, seasonYear) {
  try {
    const response = await fetch(`/api/leagues/siblings?city=${citySlug}&season=${seasonType}&year=${seasonYear}`)
    if (!response.ok) return []
    const data = await response.json()
    return data.leagues || []
  } catch (error) {
    console.error('Error fetching sibling leagues:', error)
    return []
  }
}

/**
 * Extract season info from a league object or slug
 * @param {Object} league - League object
 * @returns {{ seasonType: string, seasonYear: number } | null}
 */
export function extractSeasonInfo(league) {
  // Try from season config first
  if (league.season?.type && league.season?.year) {
    return {
      seasonType: league.season.type,
      seasonYear: league.season.year
    }
  }
  
  // Fall back to parsing slug
  const seasonMatch = league.slug?.match(/-(winter|summer|spring|fall|autumn)-(\d{4})$/i)
  if (seasonMatch) {
    return {
      seasonType: seasonMatch[1].toLowerCase(),
      seasonYear: parseInt(seasonMatch[2], 10)
    }
  }
  
  return null
}

/**
 * Map skill level to display info
 */
export const skillLevelInfo = {
  advanced: { slug: 'gold', labelEn: 'Gold', labelEs: 'Oro' },
  intermediate: { slug: 'silver', labelEn: 'Silver', labelEs: 'Plata' },
  beginner: { slug: 'bronze', labelEn: 'Bronze', labelEs: 'Bronce' }
}

/**
 * Get skill level from league name or skillLevel field
 */
export function getSkillLevel(league) {
  if (league.skillLevel && league.skillLevel !== 'all') {
    return league.skillLevel
  }
  
  const name = (league.name || league.slug || '').toLowerCase()
  if (name.includes('gold') || name.includes('oro') || name.includes('advanced')) return 'advanced'
  if (name.includes('bronze') || name.includes('bronce') || name.includes('beginner')) return 'beginner'
  return 'intermediate'
}
