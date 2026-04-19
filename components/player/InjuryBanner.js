'use client'

import { useState } from 'react'

const translations = {
  es: {
    injuredTitle: 'Estás marcado como lesionado',
    injuredUntil: 'Fecha estimada de regreso:',
    reason: 'Motivo:',
    imBack: 'Ya estoy bien',
    reportInjury: 'Reportar lesión',
    reportTitle: 'Reportar lesión',
    returnDate: 'Fecha estimada de regreso',
    reasonLabel: 'Motivo (opcional)',
    reasonPlaceholder: 'Ej: Lesión de rodilla, esguince de tobillo...',
    cancel: 'Cancelar',
    submit: 'Reportar lesión',
    submitting: 'Enviando...',
    clearing: 'Limpiando...',
    walkoverNote: 'Tus partidos no jugados antes de la fecha límite se resolverán como walkover para tu oponente.',
    successReport: '¡Lesión reportada!',
    successClear: '¡Bienvenido de vuelta!',
    errorGeneric: 'Error al actualizar. Inténtalo de nuevo.',
    reportedBy: 'Reportado por:',
    byPlayer: 'ti',
    byAdmin: 'admin'
  },
  en: {
    injuredTitle: "You're marked as injured",
    injuredUntil: 'Estimated return:',
    reason: 'Reason:',
    imBack: "I'm back",
    reportInjury: 'Report injury',
    reportTitle: 'Report injury',
    returnDate: 'Estimated return date',
    reasonLabel: 'Reason (optional)',
    reasonPlaceholder: 'E.g. Knee injury, ankle sprain...',
    cancel: 'Cancel',
    submit: 'Report injury',
    submitting: 'Submitting...',
    clearing: 'Clearing...',
    walkoverNote: 'Your unplayed matches past the deadline will be resolved as walkovers for your opponent.',
    successReport: 'Injury reported!',
    successClear: 'Welcome back!',
    errorGeneric: 'Failed to update. Try again.',
    reportedBy: 'Reported by:',
    byPlayer: 'you',
    byAdmin: 'admin'
  }
}

export default function InjuryBanner({ player, language = 'es', onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [returnDate, setReturnDate] = useState('')
  const [reason, setReason] = useState('')
  const [toast, setToast] = useState(null)

  const t = translations[language] || translations.es
  const injury = player?.injury
  const isInjured = injury?.active

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleReport = async () => {
    if (!returnDate) return
    setLoading(true)
    try {
      const res = await fetch('/api/player/injury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report',
          estimatedReturnDate: returnDate,
          reason
        })
      })
      if (res.ok) {
        showToast(t.successReport)
        setShowModal(false)
        setReturnDate('')
        setReason('')
        if (onUpdate) onUpdate()
      } else {
        showToast(t.errorGeneric, 'error')
      }
    } catch {
      showToast(t.errorGeneric, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/player/injury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      })
      if (res.ok) {
        showToast(t.successClear)
        if (onUpdate) onUpdate()
      } else {
        showToast(t.errorGeneric, 'error')
      }
    } catch {
      showToast(t.errorGeneric, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}

      {isInjured ? (
        /* Active injury banner */
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🤕</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-amber-900">{t.injuredTitle}</h3>
              <div className="mt-1 space-y-0.5">
                {injury.estimatedReturnDate && (
                  <p className="text-xs text-amber-700">
                    {t.injuredUntil}{' '}
                    <span className="font-medium">
                      {new Date(injury.estimatedReturnDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </p>
                )}
                {injury.reason && (
                  <p className="text-xs text-amber-600">{t.reason} {injury.reason}</p>
                )}
              </div>
              <p className="text-[11px] text-amber-500 mt-2">{t.walkoverNote}</p>
            </div>
            <button
              onClick={handleClear}
              disabled={loading}
              className="flex-shrink-0 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? t.clearing : `💪 ${t.imBack}`}
            </button>
          </div>
        </div>
      ) : (
        /* Report injury button - subtle */
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 rounded-xl text-xs text-gray-500 hover:text-amber-700 transition-all"
        >
          <span>🏥</span>
          <span>{t.reportInjury}</span>
        </button>
      )}

      {/* Report injury modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🏥</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t.reportTitle}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.returnDate}</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={e => setReturnDate(e.target.value)}
                  min={minDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.reasonLabel}</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder={t.reasonPlaceholder}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              <p className="text-[11px] text-gray-400">{t.walkoverNote}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleReport}
                disabled={!returnDate || loading}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t.submitting : t.submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
