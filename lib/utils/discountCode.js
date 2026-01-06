// Discount code utility for sessionStorage management
// Allows discount codes to persist across page navigation

const DISCOUNT_STORAGE_KEY = 'tdp_discount_code'
const DISCOUNT_LEAGUE_KEY = 'tdp_discount_league'

/**
 * Store a discount code in sessionStorage
 * @param {string} code - The discount code
 * @param {string} leagueSlug - Optional league slug the discount is for
 */
export function storeDiscountCode(code, leagueSlug = null) {
  if (typeof window === 'undefined') return
  
  if (code) {
    sessionStorage.setItem(DISCOUNT_STORAGE_KEY, code.toUpperCase())
    if (leagueSlug) {
      sessionStorage.setItem(DISCOUNT_LEAGUE_KEY, leagueSlug)
    }
  }
}

/**
 * Get stored discount code from sessionStorage
 * @returns {string|null} The stored discount code or null
 */
export function getStoredDiscountCode() {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(DISCOUNT_STORAGE_KEY)
}

/**
 * Get stored league slug associated with the discount
 * @returns {string|null} The stored league slug or null
 */
export function getStoredDiscountLeague() {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(DISCOUNT_LEAGUE_KEY)
}

/**
 * Clear stored discount code from sessionStorage
 */
export function clearStoredDiscountCode() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(DISCOUNT_STORAGE_KEY)
  sessionStorage.removeItem(DISCOUNT_LEAGUE_KEY)
}

/**
 * Check URL for discount parameter and store it
 * Call this on page load to capture discount from URL
 * @param {URLSearchParams|string} searchParams - URL search params
 * @param {string} leagueSlug - Optional league slug
 * @returns {string|null} The discount code if found
 */
export function captureDiscountFromUrl(searchParams, leagueSlug = null) {
  if (typeof window === 'undefined') return null
  
  let params = searchParams
  if (typeof searchParams === 'string') {
    params = new URLSearchParams(searchParams)
  }
  
  const discountCode = params?.get?.('discount') || params?.discount
  
  if (discountCode) {
    storeDiscountCode(discountCode, leagueSlug)
    return discountCode.toUpperCase()
  }
  
  return null
}

/**
 * Get discount code - first from URL, then from storage
 * @param {URLSearchParams|string} searchParams - URL search params
 * @param {string} leagueSlug - Optional league slug to store
 * @returns {string|null} The discount code
 */
export function getDiscountCode(searchParams, leagueSlug = null) {
  // First check URL
  const urlDiscount = captureDiscountFromUrl(searchParams, leagueSlug)
  if (urlDiscount) return urlDiscount
  
  // Then check storage
  return getStoredDiscountCode()
}
