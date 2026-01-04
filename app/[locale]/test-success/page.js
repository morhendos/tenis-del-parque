'use client'

import { useParams } from 'next/navigation'
import EnhancedSuccessMessage from '../../../components/ui/EnhancedSuccessMessage'

// Test page for viewing success message without registration
// URL: /en/test-success or /es/test-success
export default function TestSuccessPage() {
  const params = useParams()
  const locale = params.locale || 'en'

  // Mock data for testing
  const mockData = {
    playerName: 'Test Player',
    leagueName: 'Gold League',
    cityName: 'Sotogrande',
    leagueStatus: 'registration_open', // or 'coming_soon' for waiting list
    expectedStartDate: '2026-01-15',
    whatsappGroupLink: null, // set to a URL to test WhatsApp button
    shareUrl: `http://localhost:3000/${locale}/signup/gold-league-sotogrande`,
    language: locale
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8">
      {/* Dev banner */}
      <div className="max-w-3xl mx-auto mb-4 px-4">
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-yellow-800 text-sm">
          <strong>🛠 Dev Mode:</strong> This is a test page for the success message. 
          Remove <code className="bg-yellow-200 px-1 rounded">/app/[locale]/test-success</code> before production.
        </div>
      </div>
      
      <EnhancedSuccessMessage {...mockData} />
    </div>
  )
}
