import React from 'react'
import { useRouter } from 'next/navigation'

export default function MatchDetailHeader({ match, onBack }) {
  const router = useRouter()
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'postponed': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack || (() => router.push(`/admin/matches?league=${match.league._id}`))}
          className="flex items-center text-gray-600 hover:text-parque-purple transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Matches
        </button>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(match.status)}`}>
          {match.status.toUpperCase()}
        </div>
      </div>
      
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Round {match.round}</h1>
        <p className="text-gray-600">{match.league?.name || 'Unknown League'}</p>
      </div>
    </div>
  )
}
