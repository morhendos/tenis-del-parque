/**
 * Recursively converts MongoDB ObjectIDs and Dates to strings
 * Handles nested objects and arrays
 */
function serializeValue(value) {
  // Handle null/undefined
  if (value == null) return value
  
  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString()
  }
  
  // Handle ObjectIDs - check for toString and if it returns 24-char hex
  if (typeof value === 'object' && typeof value.toString === 'function') {
    const str = value.toString()
    // If it's a 24-character hex string (ObjectID pattern), return it as string
    if (/^[0-9a-fA-F]{24}$/.test(str)) {
      return str
    }
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => serializeValue(item))
  }
  
  // Handle plain objects (including lean() MongoDB docs)
  if (typeof value === 'object') {
    const serialized = {}
    for (const [key, val] of Object.entries(value)) {
      serialized[key] = serializeValue(val)
    }
    return serialized
  }
  
  // Return primitives as-is
  return value
}

/**
 * Serializes league data to ensure all MongoDB objects are converted to plain JavaScript objects
 * This is necessary when passing data from Server Components to Client Components in Next.js
 * 
 * @param {Object} league - The league object from MongoDB (should be .lean())
 * @returns {Object} - Serialized league object safe for client components
 */
export function serializeLeague(league) {
  if (!league) return null
  
  const serialized = {}
  
  // Recursively serialize all properties
  for (const [key, value] of Object.entries(league)) {
    serialized[key] = serializeValue(value)
  }
  
  // Ensure _id is always a string
  if (serialized._id && typeof serialized._id !== 'string') {
    serialized._id = String(serialized._id)
  }
  
  return serialized
}

/**
 * Serializes an array of league objects
 * 
 * @param {Array} leagues - Array of league objects from MongoDB
 * @returns {Array} - Array of serialized league objects
 */
export function serializeLeagues(leagues) {
  if (!Array.isArray(leagues)) return []
  return leagues.map(serializeLeague)
}

