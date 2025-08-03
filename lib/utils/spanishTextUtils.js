/**
 * Text normalization and fuzzy matching utilities
 * For accent-insensitive search and better Spanish text handling
 */

/**
 * Normalize text for accent-insensitive comparison
 * Converts "Málaga" to "malaga" for better matching
 */
export function normalizeText(text) {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents/diacritics
    .trim()
}

/**
 * Generate search variations for Spanish city names
 * Helps find cities with different spellings and accents
 */
export function generateSearchVariations(query) {
  const baseQuery = query.toLowerCase().trim()
  const normalizedQuery = normalizeText(baseQuery)
  
  const variations = new Set([
    baseQuery,
    normalizedQuery
  ])
  
  // Generate common Spanish city patterns
  const commonPrefixes = ['', 'el ', 'la ', 'los ', 'las ']
  const commonSuffixes = ['', ' de la costa', ' del sol', ' de mar']
  
  commonPrefixes.forEach(prefix => {
    commonSuffixes.forEach(suffix => {
      variations.add(prefix + baseQuery + suffix)
      variations.add(prefix + normalizedQuery + suffix)
    })
  })
  
  // Add specific accent variations for common Spanish cities
  const accentVariations = {
    'malag': 'málaga',
    'cordoba': 'córdoba', 
    'cadiz': 'cádiz',
    'almeria': 'almería',
    'leon': 'león',
    'avila': 'ávila',
    'jaen': 'jaén',
    'malaga': 'málaga',
    'sevilla': 'sevilla',
    'valencia': 'valencia',
    'zaragoza': 'zaragoza',
    'murcia': 'murcia',
    'santander': 'santander',
    'gijon': 'gijón',
    'vigo': 'vigo',
    'hospitalet': "l'hospitalet",
    'coruna': 'la coruña',
    'mostoles': 'móstoles',
    'alcorcon': 'alcorcón'
  }
  
  Object.entries(accentVariations).forEach(([without, with_]) => {
    if (normalizedQuery.includes(without)) {
      variations.add(with_)
      variations.add(without)
    }
  })
  
  return Array.from(variations).slice(0, 8) // Limit to prevent too many API calls
}

/**
 * Fuzzy matching function for better search results
 * Returns a score from 0 to 1 indicating match quality
 */
export function fuzzyMatch(query, target, threshold = 0.6) {
  if (!query || !target) return 0
  
  const normalizedQuery = normalizeText(query)
  const normalizedTarget = normalizeText(target)
  
  // Exact match (highest score)
  if (normalizedTarget === normalizedQuery) return 1.0
  
  // Starts with match (high score)
  if (normalizedTarget.startsWith(normalizedQuery)) {
    return Math.max(0.8, 0.9 - (normalizedTarget.length - normalizedQuery.length) * 0.05)
  }
  
  // Contains match (medium score)
  if (normalizedTarget.includes(normalizedQuery)) {
    const position = normalizedTarget.indexOf(normalizedQuery)
    const positionPenalty = position * 0.02 // Prefer matches at beginning
    return Math.max(0.6, 0.8 - positionPenalty - Math.abs(normalizedTarget.length - normalizedQuery.length) * 0.02)
  }
  
  // Levenshtein distance for typo tolerance
  const distance = levenshteinDistance(normalizedQuery, normalizedTarget)
  const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length)
  const similarity = 1 - (distance / maxLength)
  
  return similarity >= threshold ? similarity * 0.5 : 0
}

/**
 * Calculate Levenshtein distance for typo tolerance
 */
function levenshteinDistance(str1, str2) {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Highlight matching text for UI display
 * Returns JSX with highlighted portions
 */
export function highlightMatch(text, query) {
  if (!query.trim() || !text) return text
  
  const normalizedText = normalizeText(text)
  const normalizedQuery = normalizeText(query)
  
  // Find the start index of the match
  const matchIndex = normalizedText.indexOf(normalizedQuery)
  if (matchIndex === -1) return text
  
  // Extract the original text parts preserving case and accents
  const beforeMatch = text.substring(0, matchIndex)
  const match = text.substring(matchIndex, matchIndex + normalizedQuery.length)
  const afterMatch = text.substring(matchIndex + normalizedQuery.length)
  
  return {
    __html: `${beforeMatch}<mark class="bg-yellow-200 font-semibold">${match}</mark>${afterMatch}`
  }
}

/**
 * Get common Spanish provinces for dropdowns
 */
export function getSpanishProvinces() {
  return [
    'Málaga', 'Cádiz', 'Sevilla', 'Córdoba', 'Huelva', 'Jaén', 'Almería', 'Granada',
    'Madrid', 'Barcelona', 'Valencia', 'Alicante', 'Murcia', 'Bilbao', 'Santander',
    'La Coruña', 'Vigo', 'Zaragoza', 'Palma', 'Las Palmas', 'Santa Cruz de Tenerife',
    'Valladolid', 'Salamanca', 'León', 'Ávila', 'Segovia', 'Soria', 'Zamora',
    'Palencia', 'Burgos', 'Logroño', 'Vitoria', 'Donostia', 'Pamplona',
    'Huesca', 'Teruel', 'Castellón', 'Lleida', 'Girona', 'Tarragona'
  ].sort()
}

/**
 * Validate Spanish city name
 */
export function validateSpanishCityName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'City name is required' }
  }
  
  const trimmed = name.trim()
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'City name must be at least 2 characters' }
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'City name must be less than 50 characters' }
  }
  
  // Allow Spanish characters, spaces, hyphens, apostrophes
  const validPattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-']+$/
  if (!validPattern.test(trimmed)) {
    return { valid: false, error: 'City name contains invalid characters' }
  }
  
  return { valid: true, normalized: trimmed }
}

/**
 * Generate URL-friendly slug from Spanish text
 */
export function generateSlug(text) {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Common Spanish city synonyms and alternatives
 */
export const SPANISH_CITY_ALIASES = {
  'donostia': 'san sebastián',
  'san sebastian': 'donostia',
  'vitoria': 'vitoria-gasteiz',
  'gasteiz': 'vitoria-gasteiz',
  'lleida': 'lérida',
  'lerida': 'lleida',
  'girona': 'gerona',
  'gerona': 'girona',
  'la coruna': 'a coruña',
  'corunna': 'a coruña',
  'orense': 'ourense',
  'pontevedra': 'pontevedra',
  'lugo': 'lugo'
}
