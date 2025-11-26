'use client'

import { useState, useEffect } from 'react'

export default function NotificationModal({ 
  isOpen, 
  onClose, 
  leagueId, 
  group 
}) {
  const [notificationPreview, setNotificationPreview] = useState(null)
  const [sendingNotifications, setSendingNotifications] = useState(false)
  const [whatsappMessages, setWhatsappMessages] = useState([])
  
  useEffect(() => {
    if (isOpen) {
      fetchPreview()
    }
  }, [isOpen, group])
  
  const fetchPreview = async () => {
    setNotificationPreview(null)
    setWhatsappMessages([])
    
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          group
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setNotificationPreview(data)
      }
    } catch (error) {
      console.error('Error fetching preview:', error)
    }
  }
  
  const handleSendIndividualEmail = async (playerId) => {
    if (!confirm('Send a test email to this player?')) {
      return
    }
    
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendIndividualEmail',
          group,
          playerId
        })
      })
      
      const data = await res.json()
      if (data.success) {
        alert(data.message)
      } else {
        alert('Error: ' + (data.error || 'Failed to send test email'))
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      alert('Failed to send test email')
    }
  }
  
  const handleSendEmails = async () => {
    if (!confirm('This will send congratulation emails to all qualified players in Group ' + group + '. Continue?')) {
      return
    }
    
    setSendingNotifications(true)
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendEmails',
          group
        })
      })
      
      const data = await res.json()
      if (data.success) {
        alert(data.message + (data.errors ? '\n\nErrors:\n' + data.errors.join('\n') : ''))
      } else {
        alert('Error: ' + (data.error || 'Failed to send emails'))
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      alert('Failed to send emails')
    } finally {
      setSendingNotifications(false)
    }
  }
  
  const handleGenerateWhatsApp = async () => {
    setSendingNotifications(true)
    try {
      const res = await fetch(`/api/admin/leagues/${leagueId}/playoffs/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateWhatsApp',
          group
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setWhatsappMessages(data.whatsappMessages)
      } else {
        alert('Error: ' + (data.error || 'Failed to generate WhatsApp messages'))
      }
    } catch (error) {
      console.error('Error generating WhatsApp:', error)
      alert('Failed to generate WhatsApp messages')
    } finally {
      setSendingNotifications(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            Send Playoff Notifications - Group {group}
          </h2>
          
          {notificationPreview ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Players to Notify</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-600">
                        <th className="pb-2">Seed</th>
                        <th className="pb-2">Player</th>
                        <th className="pb-2">Opponent</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">WhatsApp</th>
                        <th className="pb-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {notificationPreview.previews.map((p) => (
                        <tr key={p.playerId} className="border-t border-gray-200">
                          <td className="py-2">#{p.seed}</td>
                          <td className="py-2">{p.player}</td>
                          <td className="py-2">{p.opponent}</td>
                          <td className="py-2">
                            {p.hasEmail ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </td>
                          <td className="py-2">
                            {p.hasWhatsApp ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </td>
                          <td className="py-2">
                            {p.hasEmail && (
                              <button
                                onClick={() => handleSendIndividualEmail(p.playerId)}
                                className="text-purple-600 hover:text-purple-800 text-xs underline"
                              >
                                Test Email
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleSendEmails}
                  disabled={sendingNotifications}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {sendingNotifications ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>📧</span>
                      <span>Send Emails</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleGenerateWhatsApp}
                  disabled={sendingNotifications}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {sendingNotifications ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <span>💬</span>
                      <span>Generate WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
              
              {whatsappMessages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">WhatsApp Messages</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {whatsappMessages.map((msg, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{msg.player} (Seed #{msg.seed})</span>
                          <a
                            href={msg.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Send WhatsApp
                          </a>
                        </div>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">{msg.message}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={() => {
                onClose()
                setWhatsappMessages([])
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

