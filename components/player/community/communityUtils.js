const KEY = (leagueId) => `tdp-community-seen-${leagueId}`

export function getSeen(leagueId) {
  try {
    return localStorage.getItem(KEY(leagueId))
  } catch {
    return null
  }
}

export function markSeen(leagueId, at) {
  if (!leagueId || !at) return
  try {
    const prev = localStorage.getItem(KEY(leagueId))
    if (!prev || new Date(at) > new Date(prev)) localStorage.setItem(KEY(leagueId), new Date(at).toISOString())
    window.dispatchEvent(new CustomEvent('tdp-community-seen', { detail: { leagueId } }))
  } catch {}
}

export function isUnread(leagueId, latestAt) {
  if (!latestAt) return false
  const seen = getSeen(leagueId)
  return !seen || new Date(latestAt) > new Date(seen)
}

export function timeAgo(date, locale = 'es') {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat(locale === 'es' ? 'es' : 'en', { numeric: 'auto', style: 'short' })
  if (diff < 60) return locale === 'es' ? 'ahora' : 'now'
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute')
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour')
  if (diff < 86400 * 7) return rtf.format(-Math.floor(diff / 86400), 'day')
  return new Date(date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short' })
}
