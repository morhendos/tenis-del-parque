import Club from '@/lib/models/Club'

/**
 * Utility functions for detecting duplicate clubs during Google Maps import
 */

// Calculate distance between two coordinates in meters
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

// Clean text for comparison
function cleanText(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

// Calculate text similarity using Levenshtein distance
function calculateTextSimilarity(str1, str2) {
  const cleanStr1 = cleanText(str1)
  const cleanStr2 = cleanText(str2)
  
  if (!cleanStr1 || !cleanStr2) return 0
  if (cleanStr1 === cleanStr2) return 1

  const matrix = []
  const len1 = cleanStr1.length
  const len2 = cleanStr2.length

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (cleanStr2.charAt(i - 1) === cleanStr1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  const maxLength = Math.max(len1, len2)
  return maxLength === 0 ? 1 : (maxLength - matrix[len2][len1]) / maxLength
}

/**
 * Check if a Google Maps club already exists in the database
 * Returns existing club data or null if no match found
 */
export async function findExistingClub(googleClub) {
  try {
    const existingClubs = await Club.find({ status: 'active' }).select({
      name: 1,
      slug: 1,
      googlePlaceId: 1,
      'location.coordinates': 1,
      'location.address': 1,
      'location.city': 1,
      'location.area': 1,
      importSource: 1,
      createdAt: 1
    })

    if (!existingClubs || existingClubs.length === 0) {
      return null
    }

    // Method 1: Exact Google Place ID match (most reliable)
    if (googleClub.place_id) {
      const placeIdMatch = existingClubs.find(club => club.googlePlaceId === googleClub.place_id)
      if (placeIdMatch) {
        return {
          club: placeIdMatch,
          matchType: 'place_id',
          confidence: 100,
          reason: 'Exact Google Place ID match'
        }
      }
    }

    // Method 2: Coordinate proximity check (within 100m radius)
    if (googleClub.geometry?.location) {
      const googleLat = googleClub.geometry.location.lat
      const googleLng = googleClub.geometry.location.lng

      for (const club of existingClubs) {
        if (club.location?.coordinates?.lat && club.location?.coordinates?.lng) {
          const distance = calculateDistance(
            googleLat,
            googleLng,
            club.location.coordinates.lat,
            club.location.coordinates.lng
          )

          if (distance <= 100) { // Within 100 meters
            return {
              club: club,
              matchType: 'coordinates',
              confidence: Math.max(0, 95 - Math.floor(distance / 10)),
              reason: `Same location (${Math.round(distance)}m apart)`,
              distance: Math.round(distance)
            }
          }
        }
      }
    }

    // Method 3: Name similarity check (within same city/area)
    if (googleClub.name) {
      // First try exact or very similar name matches
      for (const club of existingClubs) {
        const similarity = calculateTextSimilarity(googleClub.name, club.name)
        
        if (similarity >= 0.8) { // 80% similarity threshold
          // Check if they're in the same general area
          let locationMatch = false
          
          if (googleClub.formatted_address && club.location?.address) {
            const addressSimilarity = calculateTextSimilarity(
              googleClub.formatted_address,
              club.location.address
            )
            locationMatch = addressSimilarity >= 0.6
          }

          if (locationMatch || similarity >= 0.95) {
            return {
              club: club,
              matchType: 'name',
              confidence: Math.round(similarity * 100),
              reason: `Similar name (${Math.round(similarity * 100)}% match)`,
              nameSimilarity: similarity
            }
          }
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error checking for existing club:', error)
    return null
  }
}

/**
 * Batch check multiple Google clubs against existing database
 * Returns array with existence status for each club
 */
export async function checkMultipleClubsExistence(googleClubs) {
  try {
    const results = []
    
    for (const googleClub of googleClubs) {
      const existingMatch = await findExistingClub(googleClub)
      
      results.push({
        ...googleClub,
        alreadyExists: !!existingMatch,
        existingClub: existingMatch ? {
          id: existingMatch.club._id,
          name: existingMatch.club.name,
          slug: existingMatch.club.slug,
          city: existingMatch.club.location?.city,
          area: existingMatch.club.location?.area,
          matchType: existingMatch.matchType,
          confidence: existingMatch.confidence,
          reason: existingMatch.reason,
          distance: existingMatch.distance,
          importSource: existingMatch.club.importSource,
          createdAt: existingMatch.club.createdAt
        } : null
      })
    }

    return results
  } catch (error) {
    console.error('Error checking multiple clubs existence:', error)
    return googleClubs.map(club => ({ ...club, alreadyExists: false, existingClub: null }))
  }
}

/**
 * Get summary of existing clubs statistics
 */
export function getExistingClubsSummary(checkedClubs) {
  const existing = checkedClubs.filter(club => club.alreadyExists)
  const byMatchType = existing.reduce((acc, club) => {
    const type = club.existingClub?.matchType || 'unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  return {
    total: checkedClubs.length,
    existing: existing.length,
    new: checkedClubs.length - existing.length,
    matchTypes: byMatchType,
    highConfidence: existing.filter(club => club.existingClub?.confidence >= 90).length,
    mediumConfidence: existing.filter(club => 
      club.existingClub?.confidence >= 70 && club.existingClub?.confidence < 90
    ).length,
    lowConfidence: existing.filter(club => club.existingClub?.confidence < 70).length
  }
}
