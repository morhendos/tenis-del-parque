export async function swrFetcher(url) {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const error = new Error(body.error || 'Request failed')
    error.status = response.status
    throw error
  }
  return response.json()
}

export const swrOptions = {
  fetcher: swrFetcher,
  dedupingInterval: 60000,
  revalidateOnFocus: false,
  errorRetryCount: 2,
  errorRetryInterval: 1500,
  shouldRetryOnError: (error) => !error.status || error.status >= 500 || error.status === 401
}

export const isApiKey = (key) => typeof key === 'string' && key.startsWith('/api/')
