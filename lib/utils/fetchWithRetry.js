/**
 * Fetch with automatic retry on failure.
 * Handles Vercel cold starts after inactivity — MongoDB connections
 * can be stale, causing transient 500s on first request.
 * 
 * @param {string} url - The URL to fetch
 * @param {RequestInit} [options] - Standard fetch options
 * @param {Object} [retryConfig] - Retry configuration
 * @param {number} [retryConfig.maxRetries=2] - Max number of retries
 * @param {number[]} [retryConfig.delays=[1500, 3000]] - Delay (ms) before each retry
 * @param {string} [retryConfig.label=''] - Label for console logs
 * @returns {Promise<Response>} - The fetch response
 */
export async function fetchWithRetry(url, options = {}, retryConfig = {}) {
  const {
    maxRetries = 2,
    delays = [1500, 3000],
    label = url
  } = retryConfig

  let response = await fetch(url, options)

  for (let attempt = 0; attempt < maxRetries && !response.ok; attempt++) {
    const delay = delays[attempt] || delays[delays.length - 1]
    console.log(`[fetchWithRetry] ${label} returned ${response.status}, retry ${attempt + 1}/${maxRetries} after ${delay}ms...`)
    await new Promise(r => setTimeout(r, delay))
    response = await fetch(url, options)
  }

  return response
}
