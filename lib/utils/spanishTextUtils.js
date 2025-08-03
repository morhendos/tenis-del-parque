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
  const commonSuffixes = ['', ' de la costa', ' del sol', ' de mar', ' de la concepcion', ' de la frontera', ' del campo']
  const commonMiddleParts = ['', ' de la ', ' del ', ' de los ', ' de las ', ' de ']
  
  // Add variations with prefixes and suffixes
  commonPrefixes.forEach(prefix => {
    commonSuffixes.forEach(suffix => {
      variations.add(prefix + baseQuery + suffix)
      variations.add(prefix + normalizedQuery + suffix)
    })
  })
  
  // Handle multi-part city names (like "La Línea de la Concepción")
  commonMiddleParts.forEach(middle => {
    const withMiddle = baseQuery + middle + 'concepcion'
    const withMiddleNorm = normalizedQuery + middle + 'concepcion'
    variations.add(withMiddle)
    variations.add(withMiddleNorm)
    
    // Also try with "frontera"
    const withFrontera = baseQuery + middle + 'frontera'
    const withFronteraNorm = normalizedQuery + middle + 'frontera'
    variations.add(withFrontera)
    variations.add(withFronteraNorm)
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
    'linea': 'línea',
    'concepcion': 'concepción',
    'la linea': 'la línea de la concepción',
    'linea de la concepcion': 'línea de la concepción',
    'jerez': 'jerez de la frontera',
    'mostoles': 'móstoles',
    'alcorcon': 'alcorcón',
    'hospitalet': "l'hospitalet",
    'coruna': 'la coruña',
    'gijon': 'gijón'
  }
  
  Object.entries(accentVariations).forEach(([without, with_]) => {
    if (normalizedQuery.includes(without.split(' ')[0])) {
      variations.add(with_)
      variations.add(without)
    }
  })
  
  return Array.from(variations).slice(0, 12) // Increased limit for complex names
}

/**
 * Enhanced fuzzy matching function for better search results
 * Returns a score from 0 to 1 indicating match quality
 * Now handles multi-part Spanish city names better
 */
export function fuzzyMatch(query, target, threshold = 0.5) {
  if (!query || !target) return 0
  
  const normalizedQuery = normalizeText(query)
  const normalizedTarget = normalizeText(target)
  
  // Exact match (highest score)
  if (normalizedTarget === normalizedQuery) return 1.0
  
  // Starts with match (high score)
  if (normalizedTarget.startsWith(normalizedQuery)) {
    return Math.max(0.85, 0.95 - (normalizedTarget.length - normalizedQuery.length) * 0.02)
  }
  
  // Contains match (medium-high score)
  if (normalizedTarget.includes(normalizedQuery)) {
    const position = normalizedTarget.indexOf(normalizedQuery)
    const positionPenalty = position * 0.01 // Prefer matches at beginning
    return Math.max(0.7, 0.85 - positionPenalty - Math.abs(normalizedTarget.length - normalizedQuery.length) * 0.01)
  }
  
  // For multi-part names, check if query matches beginning of any significant word
  const targetWords = normalizedTarget.split(/\s+/)
  const queryWords = normalizedQuery.split(/\s+/)
  
  // Spanish articles and prepositions to ignore
  const stopWords = new Set(['de', 'la', 'del', 'las', 'los', 'el', 'y', 'e'])
  
  // Filter out stop words but keep them for context
  const significantTargetWords = targetWords.filter(word => 
    !stopWords.has(word) && word.length > 1
  )
  
  const significantQueryWords = queryWords.filter(word => 
    !stopWords.has(word) && word.length > 1
  )
  
  // Check if any query word starts any target word
  let wordMatches = 0
  let totalPossibleMatches = Math.max(significantQueryWords.length, 1)
  
  for (const queryWord of significantQueryWords) {
    for (const targetWord of significantTargetWords) {
      if (targetWord.startsWith(queryWord) && queryWord.length >= 2) {
        wordMatches++
        break // Count each query word only once
      }
    }
  }
  
  if (wordMatches > 0) {
    const wordMatchScore = (wordMatches / totalPossibleMatches) * 0.8
    return Math.max(0.6, wordMatchScore)
  }
  
  // Check if query matches within any significant word (partial word match)
  for (const queryWord of significantQueryWords) {
    for (const targetWord of significantTargetWords) {
      if (targetWord.includes(queryWord) && queryWord.length >= 3) {
        return Math.max(0.5, 0.7 - (targetWord.length - queryWord.length) * 0.02)
      }
    }
  }
  
  // Levenshtein distance for typo tolerance
  const distance = levenshteinDistance(normalizedQuery, normalizedTarget)
  const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length)
  const similarity = 1 - (distance / maxLength)
  
  return similarity >= threshold ? similarity * 0.4 : 0
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
  
  // For multi-part queries, highlight each part
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 1)
  let highlightedText = text
  
  // Highlight each query word
  for (const queryWord of queryWords) {
    if (queryWord.length >= 2) {
      const regex = new RegExp(`(${escapeRegExp(queryWord)})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 font-semibold">$1</mark>')
    }
  }
  
  return {
    __html: highlightedText
  }
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'City name must be less than 100 characters' }
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
  'lugo': 'lugo',
  'la linea': 'la línea de la concepción',
  'linea': 'la línea de la concepción',
  'jerez': 'jerez de la frontera',
  'xerez': 'jerez de la frontera'
}

/**
 * Test function to validate multi-part city name matching
 */
export function testMultiPartMatching() {
  const testCases = [
    { query: 'La Linea', target: 'La Línea de la Concepción', expectedScore: '>0.8' },
    { query: 'Linea', target: 'La Línea de la Concepción', expectedScore: '>0.6' },
    { query: 'Jerez', target: 'Jerez de la Frontera', expectedScore: '>0.8' },
    { query: 'Malag', target: 'Málaga', expectedScore: '>0.8' },
    { query: 'Cordoba', target: 'Córdoba', expectedScore: '1.0' }
  ]
  
  console.log('Testing multi-part city name matching:')
  testCases.forEach(({ query, target, expectedScore }) => {
    const score = fuzzyMatch(query, target)
    console.log(`"${query}" → "${target}": ${score.toFixed(3)} (expected ${expectedScore})`)
  })
}
