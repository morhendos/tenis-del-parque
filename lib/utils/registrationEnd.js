const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function madridOffsetMs(utcMs) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(new Date(utcMs))
  const get = (type) => Number(parts.find((p) => p.type === type).value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return asUtc - utcMs
}

export function endOfDayMadrid(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const guess = Date.UTC(y, m - 1, d, 23, 59, 59)
  return new Date(guess - madridOffsetMs(guess))
}

export function normalizeRegistrationEnd(value) {
  if (!value) return value || null
  const str = typeof value === 'string' ? value.trim() : null
  if (str && DATE_ONLY.test(str)) return endOfDayMadrid(str)
  if (str && /^\d{4}-\d{2}-\d{2}T00:00:00(\.000)?Z$/.test(str)) return endOfDayMadrid(str.slice(0, 10))
  return value
}

export function normalizeSeasonConfigDates(seasonConfig) {
  if (seasonConfig && 'registrationEnd' in seasonConfig) {
    seasonConfig.registrationEnd = normalizeRegistrationEnd(seasonConfig.registrationEnd)
  }
  return seasonConfig
}
