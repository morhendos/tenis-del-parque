// lib/utils/playerModelHelpers.js
// Helper functions for working with the new Player model structure

/**
 * Helper functions for querying players with the new registrations array structure
 */

/**
 * Find players registered for a specific league and season
 * @param {Model} PlayerModel - The Player mongoose model
 * @param {string} leagueId - League ObjectId
 * @param {string} season - Season identifier (e.g., "summer-2025")
 * @param {Object} options - Additional filter options
 * @returns {Promise<Array>} Array of players
 */
export async function findPlayersByLeague(PlayerModel, leagueId, season, options = {}) {
  const matchQuery = {
    'registrations.league': leagueId,
    'registrations.season': season
  }
  
  if (options.status) {
    matchQuery['registrations.status'] = options.status
  }
  
  if (options.level) {
    matchQuery['registrations.level'] = options.level
  }
  
  return PlayerModel.find({
    registrations: { $elemMatch: matchQuery }
  }).sort({ 'metadata.firstRegistrationDate': -1 })
}

/**
 * Get league standings for a specific league and season
 * @param {Model} PlayerModel - The Player mongoose model
 * @param {string} leagueId - League ObjectId
 * @param {string} season - Season identifier
 * @param {string} level - Optional level filter
 * @returns {Promise<Array>} Array of player standings
 */
export async function getLeagueStandings(PlayerModel, leagueId, season, level = null) {
  const pipeline = [
    // Match players registered for this league/season
    {
      $match: {
        registrations: {
          $elemMatch: {
            league: leagueId,
            season: season,
            status: { $in: ['confirmed', 'active'] },
            ...(level && { level: level })
          }
        }
      }
    },
    // Unwind registrations to work with individual registrations
    { $unwind: '$registrations' },
    // Match only the specific league/season registration
    {
      $match: {
        'registrations.league': leagueId,
        'registrations.season': season,
        'registrations.status': { $in: ['confirmed', 'active'] },
        ...(level && { 'registrations.level': level })
      }
    },
    // Add calculated fields
    {
      $addFields: {
        'registrations.stats.winPercentage': {
          $cond: {
            if: { $eq: ['$registrations.stats.matchesPlayed', 0] },
            then: 0,
            else: {
              $multiply: [
                { $divide: ['$registrations.stats.matchesWon', '$registrations.stats.matchesPlayed'] },
                100
              ]
            }
          }
        }
      }
    },
    // Sort by performance
    {
      $sort: {
        'registrations.stats.matchesWon': -1,
        'registrations.stats.eloRating': -1,
        'registrations.stats.setsWon': -1
      }
    },
    // Restructure for easier consumption
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        registration: '$registrations',
        stats: '$registrations.stats',
        level: '$registrations.level',
        status: '$registrations.status'
      }
    },
    { $limit: 50 }
  ]
  
  return PlayerModel.aggregate(pipeline)
}

/**
 * Count players registered for a specific league
 * @param {Model} PlayerModel - The Player mongoose model
 * @param {string} leagueId - League ObjectId
 * @param {string} season - Optional season filter
 * @returns {Promise<number>} Count of players
 */
export async function countPlayersByLeague(PlayerModel, leagueId, season = null) {
  const matchQuery = { 'registrations.league': leagueId }
  if (season) {
    matchQuery['registrations.season'] = season
  }
  
  return PlayerModel.countDocuments({
    registrations: { $elemMatch: matchQuery }
  })
}

/**
 * Find players without user accounts (for linking purposes)
 * @param {Model} PlayerModel - The Player mongoose model
 * @param {string} leagueId - Optional league filter
 * @returns {Promise<Array>} Array of players without user accounts
 */
export async function findPlayersWithoutUsers(PlayerModel, leagueId = null) {
  const query = { 
    userId: { $exists: false }
  }
  
  if (leagueId) {
    query.registrations = {
      $elemMatch: { 
        league: leagueId,
        status: { $in: ['confirmed', 'active'] }
      }
    }
  }
  
  return PlayerModel.find(query).sort({ 'metadata.firstRegistrationDate': -1 })
}

/**
 * Get player registration for specific league/season
 * @param {Object} player - Player document
 * @param {string} leagueId - League ObjectId
 * @param {string} season - Season identifier
 * @returns {Object|null} Registration object or null
 */
export function getPlayerRegistration(player, leagueId, season) {
  return player.registrations.find(reg => 
    reg.league.toString() === leagueId.toString() && reg.season === season
  )
}

/**
 * Check if player can participate in specific league/season
 * @param {Object} player - Player document
 * @param {string} leagueId - League ObjectId
 * @param {string} season - Season identifier
 * @returns {boolean} Whether player can participate
 */
export function canPlayerParticipate(player, leagueId, season) {
  const registration = getPlayerRegistration(player, leagueId, season)
  return registration && (registration.status === 'confirmed' || registration.status === 'active')
}

/**
 * Get all leagues a player is registered for
 * @param {Object} player - Player document
 * @returns {Array} Array of league registrations
 */
export function getPlayerLeagues(player) {
  return player.registrations.map(reg => ({
    league: reg.league,
    season: reg.season,
    level: reg.level,
    status: reg.status,
    registeredAt: reg.registeredAt,
    stats: reg.stats
  }))
}

/**
 * Calculate global player stats across all leagues
 * @param {Object} player - Player document
 * @returns {Object} Aggregated stats
 */
export function getGlobalPlayerStats(player) {
  const globalStats = {
    totalLeagues: player.registrations.length,
    totalMatches: 0,
    totalWins: 0,
    totalSets: 0,
    totalGames: 0,
    averageElo: 0,
    highestElo: 0,
    activeRegistrations: 0
  }
  
  let eloSum = 0
  let eloCount = 0
  
  player.registrations.forEach(reg => {
    if (reg.stats) {
      globalStats.totalMatches += reg.stats.matchesPlayed || 0
      globalStats.totalWins += reg.stats.matchesWon || 0
      globalStats.totalSets += (reg.stats.setsWon || 0) + (reg.stats.setsLost || 0)
      globalStats.totalGames += (reg.stats.gamesWon || 0) + (reg.stats.gamesLost || 0)
      
      if (reg.stats.eloRating) {
        eloSum += reg.stats.eloRating
        eloCount++
        
        if (reg.stats.highestElo && reg.stats.highestElo > globalStats.highestElo) {
          globalStats.highestElo = reg.stats.highestElo
        }
      }
    }
    
    if (reg.status === 'active' || reg.status === 'confirmed') {
      globalStats.activeRegistrations++
    }
  })
  
  globalStats.averageElo = eloCount > 0 ? Math.round(eloSum / eloCount) : 0
  globalStats.winPercentage = globalStats.totalMatches > 0 
    ? Math.round((globalStats.totalWins / globalStats.totalMatches) * 100) 
    : 0
  
  return globalStats
}

/**
 * Migration helper: Convert old Player document to new structure
 * @param {Array} oldPlayerDocs - Array of old Player documents for same email
 * @returns {Object} New Player document structure
 */
export function convertToNewPlayerStructure(oldPlayerDocs) {
  if (!oldPlayerDocs || oldPlayerDocs.length === 0) {
    throw new Error('No player documents provided')
  }
  
  // Use first document as base for personal info
  const basePlayer = oldPlayerDocs[0]
  
  return {
    name: basePlayer.name,
    email: basePlayer.email.toLowerCase(),
    whatsapp: basePlayer.whatsapp,
    userId: basePlayer.userId,
    
    registrations: oldPlayerDocs.map(doc => ({
      league: doc.league,
      season: doc.season || 'summer-2025',
      level: doc.level,
      registeredAt: doc.registeredAt || new Date(),
      status: doc.status || 'pending',
      stats: doc.stats || getDefaultStats(doc.level),
      matchHistory: doc.matchHistory || [],
      wildCards: doc.wildCards || { total: 3, used: 0, history: [] },
      notes: doc.notes || ''
    })),
    
    preferences: {
      emailNotifications: basePlayer.preferences?.emailNotifications ?? true,
      whatsappNotifications: basePlayer.preferences?.whatsappNotifications ?? true,
      preferredLanguage: basePlayer.metadata?.language || 'es'
    },
    
    metadata: {
      source: basePlayer.metadata?.source || 'web',
      userAgent: basePlayer.metadata?.userAgent || '',
      ipAddress: basePlayer.metadata?.ipAddress || '',
      firstRegistrationDate: basePlayer.registeredAt || new Date()
    }
  }
}

/**
 * Get default stats for a player level
 * @param {string} level - Player level
 * @returns {Object} Default stats object
 */
function getDefaultStats(level) {
  const eloRatings = {
    'beginner': 1180,
    'intermediate': 1200,
    'advanced': 1250
  }
  
  const initialElo = eloRatings[level] || 1200
  
  return {
    matchesPlayed: 0,
    matchesWon: 0,
    totalPoints: 0,
    eloRating: initialElo,
    highestElo: initialElo,
    lowestElo: initialElo,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    retirements: 0,
    walkovers: 0
  }
}

// Export all helper functions
export default {
  findPlayersByLeague,
  getLeagueStandings,
  countPlayersByLeague,
  findPlayersWithoutUsers,
  getPlayerRegistration,
  canPlayerParticipate,
  getPlayerLeagues,
  getGlobalPlayerStats,
  convertToNewPlayerStructure,
  getDefaultStats
}
