'use client'

import { useState } from 'react'

/**
 * Modal for sending push notifications from admin panel.
 * Supports both "New Round" notifications and "Match Reminders".
 * 
 * Props:
 *   mode: 'new-round' | 'reminder'
 *   leagueId: string
 *   round: number (optional, for round-specific actions)
 *   onClose: () => void
 */
export default function PushNotificationModal({ mode, leagueId, round, onClose }) {
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [customMessage, setCustomMessage] = useState('')
  const [testMode, setTestMode] = useState(false)

  const isReminder = mode === 'reminder'
  const title = isReminder ? 'Send Match Reminders' : 'Notify Players About New Matches'
  const description = isReminder
    ? `Send a reminder to all players with unplayed matches${round ? ` in Round ${round}` : ''}.`
    : `Notify all players about their match assignments for Round ${round}.`

  const handleSend = async () => {
    setSending(true)
    setError(null)
    setResult(null)

    try {
      const endpoint = isReminder
        ? '/api/admin/push/send-reminders'
        : '/api/admin/push/notify-round'

      const body = { leagueId }
      if (round) body.round = round
      if (customMessage.trim()) body.customMessage = customMessage.trim()
      // testMode sends to logged-in admin's player only (handled server-side via testPlayerId)
      // For now, we just include a flag — admin can use the test endpoint separately

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send notifications')
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{isReminder ? '⏰' : '🔔'}</span>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Custom message option */}
          {isReminder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom message (optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Leave empty for default reminder message"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              />
            </div>
          )}

          {/* What will happen */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">What happens:</p>
            {isReminder ? (
              <p>Every player with an unplayed match{round ? ` in Round ${round}` : ''} will get a push notification reminding them to schedule and play their match.</p>
            ) : (
              <p>Every player assigned a match in Round {round} will get a notification with their opponent&apos;s name.</p>
            )}
            <p className="mt-1 text-blue-600">Only players who have enabled push notifications will receive it.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-800 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Notifications sent!
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>Matches processed: {result.matchesProcessed}</p>
                <p>Notifications delivered: {result.notificationsSent}</p>
                {result.notificationsFailed > 0 && (
                  <p className="text-orange-600">Failed: {result.notificationsFailed}</p>
                )}
              </div>
              {result.details && result.details.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-green-600 cursor-pointer">Show details</summary>
                  <div className="mt-1 text-xs text-gray-600 space-y-0.5 max-h-40 overflow-y-auto">
                    {result.details.map((d, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span>{d.sent ? '✓' : '✗'}</span>
                        <span>{d.player} {d.opponent ? `(vs ${d.opponent})` : ''}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleSend}
              disabled={sending}
              className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${
                isReminder
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-parque-purple hover:bg-opacity-90'
              }`}
            >
              {sending ? 'Sending...' : isReminder ? 'Send Reminders' : 'Notify Players'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
