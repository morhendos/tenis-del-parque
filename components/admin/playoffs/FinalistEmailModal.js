'use client'

import { useState } from 'react'

export default function FinalistEmailModal({ 
  isOpen, 
  onClose, 
  leagueId, 
  group 
}) {
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [sendingEmails, setSendingEmails] = useState(false)
  const [emailResult, setEmailResult] = useState(null)
  
  const handleTestEmail = async () => {
    if (!testEmailAddress) {
      alert('Please enter a test email address')
      return
    }
    
    setSendingEmails(true)
    setEmailResult(null)
    
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs/finalist-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          testEmail: testEmailAddress,
          group
        })
      })
      
      const data = await res.json()
      setEmailResult(data)
      
      if (data.success) {
        alert('Test email sent successfully!')
      } else {
        alert('Error: ' + (data.results?.errors?.[0]?.error || 'Failed to send test email'))
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      alert('Failed to send test email')
      setEmailResult({ success: false, error: error.message })
    } finally {
      setSendingEmails(false)
    }
  }
  
  const handleSendEmails = async () => {
    if (!confirm(`This will send congratulatory finalist emails to both players in the Group ${group} final. They will be congratulated on reaching the final and prompted to schedule the match.\n\nAre you sure?`)) {
      return
    }
    
    setSendingEmails(true)
    setEmailResult(null)
    
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs/finalist-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          group
        })
      })
      
      const data = await res.json()
      setEmailResult(data)
      
      if (data.success) {
        const sentInfo = data.results.sent.map(s => s.message).join('\n')
        alert('Finalist emails sent successfully!\n\n' + sentInfo)
      } else {
        const errors = data.results?.errors?.map(e => e.error).join('\n') || 'Unknown error'
        alert('Error sending finalist emails:\n\n' + errors)
      }
    } catch (error) {
      console.error('Error sending finalist emails:', error)
      alert('Failed to send finalist emails')
      setEmailResult({ success: false, error: error.message })
    } finally {
      setSendingEmails(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🏆</span>
            Send Finalist Congratulations - Group {group}
          </h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">What this does:</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Sends exciting congratulatory emails to BOTH finalists</li>
              <li>Includes opponent contact info (email &amp; WhatsApp)</li>
              <li>Shows their playoff journey (QF and SF victories)</li>
              <li>Head-to-head stats comparison</li>
              <li>Prompts them to schedule the final match ASAP</li>
              <li>Lists what&apos;s at stake (championship, prestige, etc.)</li>
            </ul>
          </div>
          
          {/* Test Email Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">1. Test First (Recommended)</h3>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="your-email@example.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleTestEmail}
                disabled={sendingEmails || !testEmailAddress}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {sendingEmails ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              This will send you a preview of the email that Player 1 would receive
            </p>
          </div>
          
          {/* Send to Finalists Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">2. Send to Both Finalists</h3>
            <button
              onClick={handleSendEmails}
              disabled={sendingEmails}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:bg-gray-400 flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
            >
              {sendingEmails ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>🌟</span>
                  <span>Send to Both Finalists</span>
                </>
              )}
            </button>
          </div>
          
          {/* Results Display */}
          {emailResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              emailResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                emailResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {emailResult.success ? '✅ Success!' : '❌ Error'}
              </h3>
              {emailResult.results?.sent?.length > 0 && (
                <div className="text-sm text-green-800">
                  {emailResult.results.sent.map((s, idx) => (
                    <p key={idx}>• {s.message}</p>
                  ))}
                </div>
              )}
              {emailResult.results?.errors?.length > 0 && (
                <div className="text-sm text-red-800">
                  {emailResult.results.errors.map((e, idx) => (
                    <p key={idx}>• {e.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={() => {
                onClose()
                setEmailResult(null)
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

