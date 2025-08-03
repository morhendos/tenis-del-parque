import Season from '@/lib/models/Season'

/**
 * Season utility functions to handle the clean season system
 */

// Legacy season key mapping for backward compatibility during migration
const LEGACY_SEASON_MAPPING = {
  // URL slugs to season info
  'verano2025': { type: 'summer', year: 2025 },
  'summer2025': { type: 'summer', year: 2025 },
  'invierno2025': { type: 'winter', year: 2025 },
  'winter2025': { type: 'winter', year: 2025 },
  'primavera2025': { type: 'spring', year: 2025 },
  'spring2025': { type: 'spring', year: 2025 },
  'otono2025': { type: 'autumn', year: 2025 },
  'autumn2025': { type: 'autumn', year: 2025 },
  'fall2025': { type: 'autumn', year: 2025 },
  
  // Database keys
  'summer-2025': { type: 'summer', year: 2025 },
  'winter-2025': { type: 'winter', year: 2025 },
  'spring-2025': { type: 'spring', year: 2025 },
  'autumn-2025': { type: 'autumn', year: 2025 }
}

/**
 * Find season by legacy key (for migration support)
 */
export async function findSeasonByLegacyKey(legacyKey) {
  const mapping = LEGACY_SEASON_MAPPING[legacyKey?.toLowerCase()]
  if (!mapping) return null
  
  return await Season.findOne({
    type: mapping.type,
    year: mapping.year
  })
}

/**
 * Find season by URL slug and language
 */
export async function findSeasonBySlug(slug, language = 'en') {
  // First try the new system
  let season = await Season.findBySlug(slug, language)
  
  // Fallback to legacy mapping during migration
  if (!season) {
    season = await findSeasonByLegacyKey(slug)
  }
  
  return season
}

/**
 * Get season display name with fallback to legacy system
 */
export function getSeasonDisplayName(seasonOrKey, language = 'en') {
  // If it's a Season object
  if (seasonOrKey && seasonOrKey.getName) {
    return seasonOrKey.getName(language)
  }
  
  // Legacy fallback mapping
  const legacyNames = {
    en: {
      'verano2025': 'Summer 2025',
      'summer2025': 'Summer 2025', 
      'invierno2025': 'Winter 2025',
      'winter2025': 'Winter 2025',
      'primavera2025': 'Spring 2025',
      'spring2025': 'Spring 2025',
      'otono2025': 'Autumn 2025',
      'autumn2025': 'Autumn 2025',
      'fall2025': 'Autumn 2025'
    },
    es: {
      'verano2025': 'Verano 2025',
      'summer2025': 'Verano 2025',
      'invierno2025': 'Invierno 2025', 
      'winter2025': 'Invierno 2025',
      'primavera2025': 'Primavera 2025',
      'spring2025': 'Primavera 2025',
      'otono2025': 'Otoño 2025',
      'autumn2025': 'Otoño 2025',
      'fall2025': 'Otoño 2025'
    }
  }
  
  return legacyNames[language]?.[seasonOrKey] || seasonOrKey
}

/**
 * Initialize seasons for required years
 */
export async function initializeSeasons(years = [2024, 2025, 2026]) {
  const results = []
  
  for (const year of years) {
    try {
      // Check if seasons already exist for this year
      const existingSeasons = await Season.getSeasonsForYear(year)
      
      if (existingSeasons.length === 0) {
        console.log(`Creating seasons for year ${year}`)
        const created = await Season.createSeasonsForYear(year)
        results.push({ year, created: created.length })
      } else {
        console.log(`Seasons already exist for year ${year}`)
        results.push({ year, created: 0, existing: existingSeasons.length })
      }
    } catch (error) {
      console.error(`Error creating seasons for ${year}:`, error)
      results.push({ year, error: error.message })
    }
  }
  
  return results
}

/**
 * Get all available seasons for a language (for navigation, etc.)
 */
export async function getAvailableSeasons(language = 'en') {
  const seasons = await Season.find({})
    .sort({ year: -1, order: 1 })
  
  return seasons.map(season => ({
    id: season._id,
    slug: season.getSlug(language),
    name: season.getName(language),
    year: season.year,
    type: season.type,
    status: season.status,
    startDate: season.startDate,
    endDate: season.endDate
  }))
}

/**
 * Get the current active season
 */
export async function getCurrentSeason() {
  return await Season.getCurrentSeason()
}

/**
 * Update season status based on current date
 */
export async function updateSeasonStatuses() {
  const now = new Date()
  const seasons = await Season.find({})
  
  const updates = []
  
  for (const season of seasons) {
    let newStatus = season.status
    
    // Determine status based on dates
    if (now < season.startDate) {
      if (season.registration?.opensAt && now >= season.registration.opensAt && 
          season.registration?.closesAt && now < season.registration.closesAt) {
        newStatus = 'registration_open'
      } else {
        newStatus = 'upcoming'
      }
    } else if (now >= season.startDate && now <= season.endDate) {
      newStatus = 'active'
    } else if (now > season.endDate) {
      newStatus = 'completed'
    }
    
    // Update if status changed
    if (newStatus !== season.status) {
      await Season.findByIdAndUpdate(season._id, { status: newStatus })
      updates.push({ 
        season: season.getName(), 
        oldStatus: season.status, 
        newStatus 
      })
    }
  }
  
  return updates
}

const seasonUtils = {
  findSeasonByLegacyKey,
  findSeasonBySlug,
  getSeasonDisplayName,
  initializeSeasons,
  getAvailableSeasons,
  getCurrentSeason,
  updateSeasonStatuses
}

export default seasonUtils