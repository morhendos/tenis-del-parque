'use client'

import { useState, useEffect } from 'react'

/**
 * Season Start Email Modal
 * Allows admin to preview and send season start emails to players
 */
export default function SeasonStartEmailModal({ 
  isOpen, 
  onClose, 
  leagueId, 
  leagueName 
}) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [testEmail, setTestEmail] = useState('')
  const [selectedRound, setSelectedRound] = useState(1)
  const [language, setLanguage] = useState('es')

  // Fetch preview when modal opens
  useEffect(() => {
    if (isOpen && leagueId) {
      fetchPreview()
    }
  }, [isOpen, leagueId, selectedRound])

  const fetchPreview = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch(
        `/api/admin/leagues/${leagueId}/season-start-email?round=${selectedRound}`
      )
      const data = await response.json()
      if (response.ok) {
        setPreview(data)
      } else {
        setPreview({ error: data.error })
      }
    } catch (error) {
      setPreview({ error: 'Failed to load preview' })
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    if (!testEmail) return
    
    setSending(true)
    setResult(null)
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}/season-start-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          round: selectedRound, 
          testEmail, 
          language 
        })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to send test email' })
    } finally {
      setSending(false)
    }
  }

  const handleSendAll = async () => {
    if (!confirm(`Are you sure you want to send emails to ${preview?.summary?.totalRecipients} players?`)) {
      return
    }
    
    setSending(true)
    setResult(null)
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}/season-start-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          round: selectedRound, 
          language 
        })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to send emails' })
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-parque-purple to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Season Start Emails</h2>
              <p className="text-white/80 text-sm mt-1">{leagueName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(r => (
                  <option key={r} value={r}>Round {r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="es">Spanish</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-parque-purple border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Loading preview...</p>
            </div>
          )}

          {/* Preview */}
          {!loading && preview && !preview.error && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-parque-purple">{preview.summary.totalRecipients}</p>
                  <p className="text-sm text-gray-600">Total Recipients</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{preview.summary.regularMatches}</p>
                  <p className="text-sm text-gray-600">Regular Matches</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-600">{preview.summary.byeMatches}</p>
                  <p className="text-sm text-gray-600">BYE Players</p>
                </div>
              </div>

              {/* Warning for players without matches */}
              {preview.playersWithoutMatches?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-medium text-amber-800">
                    {preview.playersWithoutMatches.length} active player(s) have no match in Round {selectedRound}:
                  </p>
                  <ul className="mt-2 text-sm text-amber-700">
                    {preview.playersWithoutMatches.map(p => (
                      <li key={p._id}>{p.name} ({p.email})</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recipients List */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Recipients Preview</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Player</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Opponent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {preview.recipients.map((r, i) => (
                        <tr key={i} className={r.isBye ? 'bg-emerald-50/50' : ''}>
                          <td className="px-4 py-2 font-medium text-gray-900">{r.player.name}</td>
                          <td className="px-4 py-2 text-gray-600">{r.player.email}</td>
                          <td className="px-4 py-2">
                            {r.isBye ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                BYE
                              </span>
                            ) : (
                              <span className="text-gray-600">{r.opponent?.name}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Test Email Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Send Test Email</h3>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  />
                  <button
                    onClick={handleSendTest}
                    disabled={!testEmail || sending}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This will send both a regular match email and a BYE email (if applicable) to your test address.
                </p>
              </div>

              {/* Result */}
              {result && (
                <div className={`rounded-xl p-4 ${
                  result.error 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  {result.error ? (
                    <p className="text-red-800">{result.error}</p>
                  ) : result.mode === 'test' ? (
                    <div>
                      <p className="font-medium text-green-800">Test email(s) sent to {result.testEmail}</p>
                      <ul className="mt-2 text-sm text-green-700">
                        {result.results.map((r, i) => (
                          <li key={i}>
                            {r.type === 'regular' ? 'Regular match' : 'BYE'} email: {r.success ? 'Sent' : `Failed - ${r.error}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-green-800">
                        Emails sent successfully!
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {result.summary.sent} sent, {result.summary.failed} failed
                      </p>
                      {result.results.failed?.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          <p className="font-medium">Failed:</p>
                          <ul>
                            {result.results.failed.map((f, i) => (
                              <li key={i}>{f.name} ({f.email}): {f.error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {!loading && preview?.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
              {preview.error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Close
          </button>
          <button
            onClick={handleSendAll}
            disabled={!preview || preview.error || sending || preview?.summary?.totalRecipients === 0}
            className="px-6 py-2 bg-parque-purple text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send to All ({preview?.summary?.totalRecipients || 0})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
