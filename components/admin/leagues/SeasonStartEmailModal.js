'use client'

import { useState, useEffect } from 'react'

/**
 * Season Start Email Modal
 * Allows admin to preview and send season start emails to players
 * Language is automatically detected from each player's preferences
 * Admin can manually override language for any player
 * Supports sending to individual players or all at once
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
  const [sendingIndividual, setSendingIndividual] = useState(null) // Index of player being sent to
  const [result, setResult] = useState(null)
  const [individualResults, setIndividualResults] = useState({}) // { index: { success, error } }
  const [testEmail, setTestEmail] = useState('')
  const [testLanguage, setTestLanguage] = useState('es')
  const [selectedRound, setSelectedRound] = useState(1)
  const [languageOverrides, setLanguageOverrides] = useState({}) // { recipientIndex: 'es' | 'en' }
  const [pushing, setPushing] = useState(false)
  const [pushResult, setPushResult] = useState(null)

  const sendPush = async (testEmailAddress) => {
    if (!testEmailAddress && !confirm(`Send a push notification to every player with a match in Round ${selectedRound}?`)) return
    setPushing(true)
    setPushResult(null)
    try {
      const response = await fetch('/api/admin/push/notify-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, round: selectedRound, testEmail: testEmailAddress || undefined })
      })
      const data = await response.json()
      setPushResult(response.ok ? data : { error: data.error || 'Failed to send push' })
    } catch (error) {
      setPushResult({ error: 'Failed to send push' })
    } finally {
      setPushing(false)
    }
  }

  // Fetch preview when modal opens
  useEffect(() => {
    if (isOpen && leagueId) {
      fetchPreview()
      setLanguageOverrides({}) // Reset overrides when refetching
      setIndividualResults({}) // Reset individual results
      setResult(null)
      setPushResult(null)
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

  // Get effective language for a recipient (override or default)
  const getEffectiveLanguage = (index, defaultLang) => {
    return languageOverrides[index] || defaultLang || 'es'
  }

  // Handle language change for a recipient
  const handleLanguageChange = (index, newLang) => {
    setLanguageOverrides(prev => ({
      ...prev,
      [index]: newLang
    }))
  }

  // Calculate language counts with overrides
  const getLanguageCounts = () => {
    if (!preview?.recipients) return { spanish: 0, english: 0 }
    
    let spanish = 0
    let english = 0
    
    preview.recipients.forEach((r, i) => {
      const lang = getEffectiveLanguage(i, r.player.language)
      if (lang === 'en') {
        english++
      } else {
        spanish++
      }
    })
    
    return { spanish, english }
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
          testLanguage
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

  // Send to individual player
  const handleSendIndividual = async (index, recipient) => {
    const lang = getEffectiveLanguage(index, recipient.player.language)
    
    setSendingIndividual(index)
    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}/season-start-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          round: selectedRound,
          singlePlayerEmail: recipient.player.email,
          languageOverrides: { [recipient.player.email]: lang }
        })
      })
      const data = await response.json()
      
      setIndividualResults(prev => ({
        ...prev,
        [index]: {
          success: data.summary?.sent > 0,
          error: data.results?.failed?.[0]?.error || null
        }
      }))
    } catch (error) {
      setIndividualResults(prev => ({
        ...prev,
        [index]: { success: false, error: 'Failed to send' }
      }))
    } finally {
      setSendingIndividual(null)
    }
  }

  const handleSendAll = async () => {
    const { spanish, english } = getLanguageCounts()
    
    const confirmMsg = `Send emails to ${preview?.summary?.totalRecipients} players?\n\n` +
      `• ${spanish} in Spanish\n` +
      `• ${english} in English\n\n` +
      `Each player will receive the email in their assigned language.`
    
    if (!confirm(confirmMsg)) {
      return
    }
    
    setSending(true)
    setResult(null)
    try {
      // Build language map with overrides
      const languageMap = {}
      preview.recipients.forEach((r, i) => {
        const lang = getEffectiveLanguage(i, r.player.language)
        languageMap[r.player.email] = lang
      })
      
      const response = await fetch(`/api/admin/leagues/${leagueId}/season-start-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          round: selectedRound,
          languageOverrides: languageMap
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

  // Check if any overrides have been made
  const hasOverrides = Object.keys(languageOverrides).length > 0

  if (!isOpen) return null

  const { spanish: spanishCount, english: englishCount } = getLanguageCounts()

  const sendIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Round emails</h3>
            <p className="text-sm text-gray-500">{leagueName} · pairings, rival and deadline for each player</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-parque-purple"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(r => (
                <option key={r} value={r}>Round {r}</option>
              ))}
            </select>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="text-center py-10">
              <div className="animate-spin w-6 h-6 border-2 border-parque-purple border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading preview...</p>
            </div>
          )}

          {!loading && preview?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{preview.error}</div>
          )}

          {!loading && preview && !preview.error && (
            <>
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                <span><span className="font-semibold text-gray-900">{preview.summary.totalRecipients}</span> recipients</span>
                <span><span className="font-semibold text-gray-900">{preview.summary.regularMatches}</span> matches</span>
                <span><span className="font-semibold text-gray-900">{preview.summary.byeMatches}</span> bye</span>
                <span><span className="font-semibold text-gray-900">{spanishCount}</span> ES · <span className="font-semibold text-gray-900">{englishCount}</span> EN</span>
                {hasOverrides && (
                  <button onClick={() => setLanguageOverrides({})} className="text-parque-purple hover:underline">
                    Reset {Object.keys(languageOverrides).length} language change{Object.keys(languageOverrides).length === 1 ? '' : 's'}
                  </button>
                )}
              </div>

              {preview.playersWithoutMatches?.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">{preview.playersWithoutMatches.length} active player(s) have no match in Round {selectedRound}</p>
                  <p className="mt-1 text-amber-700">{preview.playersWithoutMatches.map(p => p.name).join(', ')}</p>
                </div>
              )}

              {/* Recipients */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Recipients</h3>
                  <p className="text-xs text-gray-500">Change a language if needed, or send to one player with the arrow</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="text-left px-6 py-2 font-medium">Player</th>
                        <th className="text-left px-4 py-2 font-medium">Rival</th>
                        <th className="text-center px-4 py-2 font-medium">Lang</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {preview.recipients.map((r, i) => {
                        const effectiveLang = getEffectiveLanguage(i, r.player.language)
                        const isOverridden = languageOverrides[i] !== undefined
                        const individualResult = individualResults[i]
                        const isSendingThis = sendingIndividual === i

                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-2.5">
                              <div className="font-medium text-gray-900">{r.player.name}</div>
                              <div className="text-xs text-gray-500">{r.player.email}</div>
                            </td>
                            <td className="px-4 py-2.5 text-gray-600">
                              {r.isBye ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Rests</span>
                              ) : r.opponent?.name}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <select
                                value={effectiveLang}
                                onChange={(e) => handleLanguageChange(i, e.target.value)}
                                className={`text-xs font-medium rounded-md px-2 py-1 border bg-white cursor-pointer focus:ring-2 focus:ring-parque-purple ${
                                  isOverridden ? 'border-parque-purple text-parque-purple' : 'border-gray-300 text-gray-700'
                                }`}
                              >
                                <option value="es">ES</option>
                                <option value="en">EN</option>
                              </select>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {individualResult?.success ? (
                                <span className="text-xs font-medium text-green-600">Sent</span>
                              ) : individualResult?.error ? (
                                <span className="text-xs font-medium text-red-600" title={individualResult.error}>Failed</span>
                              ) : (
                                <button
                                  onClick={() => handleSendIndividual(i, r)}
                                  disabled={isSendingThis || sending}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-parque-purple hover:bg-parque-purple/10 disabled:opacity-50"
                                  title={`Send to ${r.player.name}`}
                                >
                                  {isSendingThis ? (
                                    <span className="animate-spin w-4 h-4 border-2 border-parque-purple border-t-transparent rounded-full"></span>
                                  ) : sendIcon}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Test */}
              <div className="bg-white border rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Test</h3>
                  <p className="text-xs text-gray-500 mt-1">Email: a match sample and a bye sample (if any) to this address. Push: only to the player with this email.</p>
                </div>
                <div className="p-6 flex flex-wrap gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-parque-purple"
                  />
                  <select
                    value={testLanguage}
                    onChange={(e) => setTestLanguage(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-parque-purple focus:border-parque-purple"
                  >
                    <option value="es">Spanish</option>
                    <option value="en">English</option>
                  </select>
                  <button
                    onClick={handleSendTest}
                    disabled={!testEmail || sending}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Test email'}
                  </button>
                  <button
                    onClick={() => sendPush(testEmail.trim().toLowerCase())}
                    disabled={!testEmail || pushing}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                  >
                    {pushing ? 'Sending...' : 'Test push'}
                  </button>
                </div>
              </div>

              {pushResult && (
                <div className={`rounded-lg border p-4 text-sm ${pushResult.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
                  {pushResult.error ? (
                    <p>{pushResult.error}</p>
                  ) : (
                    <p className="font-medium">
                      Push{pushResult.testMode ? ' test' : ''}: {pushResult.notificationsSent} sent, {pushResult.notificationsFailed} failed
                      {!pushResult.testMode && ` (${pushResult.matchesProcessed} matches, only players with push enabled)`}
                    </p>
                  )}
                </div>
              )}

              {/* Result */}
              {result && (
                <div className={`rounded-lg border p-4 text-sm ${result.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
                  {result.error ? (
                    <p>{result.error}</p>
                  ) : result.mode === 'test' ? (
                    <>
                      <p className="font-medium">Test sent to {result.testEmail}</p>
                      <p className="mt-1 text-green-700">
                        {result.results.map(r => `${r.type === 'regular' ? 'Match' : 'Bye'} (${r.language?.toUpperCase()}): ${r.success ? 'sent' : `failed - ${r.error}`}`).join(' · ')}
                      </p>
                    </>
                  ) : result.mode === 'single' ? (
                    <p className="font-medium">Email sent to {result.results?.sent?.[0]?.name || 'player'}</p>
                  ) : (
                    <>
                      <p className="font-medium">{result.summary.sent} emails sent ({result.summary.spanishSent} ES, {result.summary.englishSent} EN), {result.summary.failed} failed</p>
                      {result.results.failed?.length > 0 && (
                        <p className="mt-1 text-red-700">
                          Failed: {result.results.failed.map(f => `${f.name} (${f.error})`).join(', ')}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            Close
          </button>
          <div className="flex items-center gap-2">
          <button
            onClick={() => sendPush()}
            disabled={!preview || preview.error || pushing || preview?.summary?.regularMatches === 0}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pushing ? 'Sending...' : 'Send push to all'}
          </button>
          <button
            onClick={handleSendAll}
            disabled={!preview || preview.error || sending || preview?.summary?.totalRecipients === 0}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>}
            {sending ? 'Sending...' : `Send emails to all (${preview?.summary?.totalRecipients || 0})`}
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}
