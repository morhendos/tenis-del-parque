'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

function unpaidOpenRegistration(registrations = []) {
  const now = Date.now()
  return registrations.find(r => {
    const league = r.league
    if (!league || typeof league !== 'object') return false
    if (r.paymentStatus !== 'pending' || r.status !== 'pending') return false
    if (!(r.finalPrice > 0)) return false
    if (league.status !== 'registration_open') return false
    const end = league.seasonConfig?.registrationEnd ? new Date(league.seasonConfig.registrationEnd).getTime() : null
    return !end || end > now
  })
}

export default function FinishRegistrationCard({ player, language = 'es' }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const reg = unpaidOpenRegistration(player?.registrations)
  if (!reg) return null

  const es = language === 'es'
  const league = reg.league
  const start = league.seasonConfig?.startDate ? new Date(league.seasonConfig.startDate) : null
  const date = start
    ? start.toLocaleDateString(es ? 'es-ES' : 'en-US', { month: es ? 'long' : 'short', day: 'numeric' })
    : null

  const goToCheckout = async () => {
    setBusy(true)
    setError(false)
    try {
      const res = await fetch('/api/players/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: player.email, leagueId: league._id, language })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      if (data.alreadyPaid) {
        window.location.reload()
        return
      }
      setError(true)
    } catch {
      setError(true)
    }
    setBusy(false)
  }

  return (
    <div className="bg-gradient-to-br from-parque-purple to-purple-700 rounded-2xl shadow-lg shadow-purple-500/25 p-4 sm:p-5 text-white">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-lg leading-tight">{es ? 'Te queda un paso' : 'One step left'}</h3>
          <p className="text-white/85 text-sm mt-1">
            {es
              ? `Termina tu inscripción en ${league.name}${date ? ` y estarás listo para el ${date}` : ''}.`
              : `Finish your registration for ${league.name}${date ? ` and you're ready for ${date}` : ''}.`}
          </p>
        </div>
      </div>
      <button
        onClick={goToCheckout}
        disabled={busy}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-parque-purple font-semibold rounded-xl py-3 active:scale-[0.99] transition-all disabled:opacity-80"
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {es ? 'Terminar inscripción' : 'Finish registration'}
      </button>
      {error && (
        <p className="text-white/90 text-xs mt-2 text-center">
          {es ? 'No se pudo abrir el pago. Inténtalo de nuevo.' : "Couldn't open the payment. Please try again."}
        </p>
      )}
    </div>
  )
}
