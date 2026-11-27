import { fetchWithRetry } from './fetchWithRetry'

const TTL_MS = 10000
const cache = new Map()

export function invalidatePlayerData() {
  cache.clear()
}

function toResponse({ ok, status, body }) {
  return {
    ok,
    status,
    text: async () => body,
    json: async () => JSON.parse(body)
  }
}

function cachedGet(url, options, retryConfig) {
  const hit = cache.get(url)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise.then(toResponse)

  const request = retryConfig ? fetchWithRetry(url, options, retryConfig) : fetch(url, options)
  const promise = request.then(async (response) => ({
    ok: response.ok,
    status: response.status,
    body: await response.text()
  }))

  const entry = { at: Date.now(), promise }
  cache.set(url, entry)
  promise.then(
    (result) => {
      if (!result.ok && cache.get(url) === entry) cache.delete(url)
    },
    () => {
      if (cache.get(url) === entry) cache.delete(url)
    }
  )

  return promise.then(toResponse)
}

export function playerFetch(url, options = {}, retryConfig) {
  const method = (options.method || 'GET').toUpperCase()
  if (method === 'GET') return cachedGet(url, options, retryConfig)

  cache.clear()
  return fetch(url, options).finally(() => cache.clear())
}
