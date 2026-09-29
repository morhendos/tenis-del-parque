const KEY = 'tdp_attribution'

function deriveFromReferrer(ref) {
  if (!ref) return 'direct'
  try {
    const host = new URL(ref).hostname.replace('www.', '')
    if (host.includes('tenisdp.es')) return null
    if (host.includes('instagram')) return 'instagram'
    if (host.includes('facebook') || host === 'l.facebook.com' || host === 'fb.com') return 'facebook'
    if (host.includes('google')) return 'google'
    if (host.includes('whatsapp') || host === 'wa.me') return 'whatsapp'
    if (host === 't.co' || host.includes('twitter') || host.includes('x.com')) return 'x'
    return `referral:${host}`
  } catch {
    return 'direct'
  }
}

export function captureAttribution() {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source')
    const existing = localStorage.getItem(KEY)

    // UTM in URL always wins (latest campaign touch), otherwise keep first touch
    if (!utmSource && existing) return

    let source = utmSource
    if (!source) {
      source = deriveFromReferrer(document.referrer)
      if (source === null) return // internal navigation, keep whatever we have
      if (existing) return
    }

    const data = {
      source,
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
      content: params.get('utm_content') || '',
      referrer: (document.referrer || '').slice(0, 200),
      landing: (window.location.pathname + window.location.search).slice(0, 200),
      ts: Date.now()
    }
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // storage blocked - fine, we just lose attribution
  }
}

export function getAttribution() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
