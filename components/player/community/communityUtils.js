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
  const d = new Date(date)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  const es = locale === 'es'
  const rtf = new Intl.RelativeTimeFormat(es ? 'es' : 'en', { numeric: 'auto', style: 'short' })
  if (diff < 60) return es ? 'ahora' : 'now'
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute')
  const time = d.toLocaleTimeString(es ? 'es-ES' : 'en-GB', { hour: '2-digit', minute: '2-digit' })
  const dayStart = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((dayStart(now) - dayStart(d)) / 86400000)
  if (days === 0) return rtf.format(-Math.floor(diff / 3600), 'hour')
  if (days < 7) return `${rtf.format(-days, 'day')} ${time}`
  return d.toLocaleDateString(es ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short' })
}
