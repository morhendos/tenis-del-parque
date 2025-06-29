'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function GenerateRoundPage() {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [roundsData, setRoundsData] = useState(null)
  const [preview, setPreview] = useState(null)
  const [selectedLeague, setSelectedLeague] = useState(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const leagueId = searchParams.get('league')

  useEffect(() => {
    const storedLeague = sessionStorage.getItem('selectedLeague')
    if (storedLeague) {
      const league = JSON.parse(storedLeague)
      setSelectedLeague(league)
      fetchRoundsData(league)
    } else if (!leagueId) {
      router.push('/admin/leagues')
    } else {
      fetchRoundsData({ id: leagueId })
    }
  }, [leagueId])

  const fetchRoundsData = async (league) => {
    try {
      setLoading(true)
      const season = league.currentSeason || 'summer-2025'
      const res = await fetch(`/api/admin/matches/generate-round?league=${league.id}&season=${season}`)
      
      if (!res.ok) throw new Error('Failed to fetch rounds data')
      
      const data = await res.json()
      setRoundsData(data)
    } catch (error) {
      console.error('Error fetching rounds:', error)
      setError('Failed to load rounds data')
    } finally {
      setLoading(false)
    }
  }

  const generatePreview = async () => {
    try {
      setGenerating(true)
      setError('')
      setSuccess('')
      
      const season = selectedLeague?.currentSeason || 'summer-2025'
      const nextRound = roundsData?.nextRound || 1
      
      const res = await fetch('/api/admin/matches/generate-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: selectedLeague?.id || leagueId,
          season: season,
          round: nextRound,
          generateMatches: false
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate preview')
      }

      setPreview(data.summary)
    } catch (error) {
      console.error('Error generating preview:', error)
      setError(error.message || 'Failed to generate preview')
    } finally {
      setGenerating(false)
    }
  }

  const confirmAndGenerate = async () => {
    try {
      setGenerating(true)
      setError('')
      
      const season = selectedLeague?.currentSeason || 'summer-2025'
      const nextRound = roundsData?.nextRound || 1
      
      const res = await fetch('/api/admin/matches/generate-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: selectedLeague?.id || leagueId,
          season: season,
          round: nextRound,
          generateMatches: true
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate matches')
      }

      setSuccess(data.message)
      setPreview(null)
      
      // Redirect to matches page after 2 seconds
      setTimeout(() => {
        router.push(`/admin/matches?league=${selectedLeague?.id || leagueId}`)
      }, 2000)
    } catch (error) {
      console.error('Error generating matches:', error)
      setError(error.message || 'Failed to generate matches')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading round data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generate Swiss Round</h2>
          <p className="text-gray-600 mt-1">
            {selectedLeague?.name || 'League'} - Generate pairings for the next round
          </p>
        </div>
        <button
          onClick={() => router.push(`/admin/matches?league=${selectedLeague?.id || leagueId}`)}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← Back to Matches
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-4">
          {success}
        </div>
      )}

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tournament Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded p-4">
            <div className="text-sm text-gray-600">Active Players</div>
            <div className="text-2xl font-bold text-gray-900">{roundsData?.activePlayers || 0}</div>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <div className="text-sm text-gray-600">Rounds Completed</div>
            <div className="text-2xl font-bold text-gray-900">{roundsData?.totalRounds || 0}</div>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <div className="text-sm text-gray-600">Next Round</div>
            <div className="text-2xl font-bold text-parque-purple">{roundsData?.nextRound || 1}</div>
          </div>
        </div>
      </div>

      {/* Previous Rounds Summary */}
      {roundsData?.rounds && roundsData.rounds.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Previous Rounds</h3>
          <div className="space-y-2">
            {roundsData.rounds.map(round => (
              <div key={round.round} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">Round {round.round}</span>
                <span className="text-sm text-gray-600">
                  {round.completedMatches}/{round.totalMatches} matches completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Preview Button */}
      {!preview && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">
            Ready to generate pairings for Round {roundsData?.nextRound || 1}?
          </p>
          <button
            onClick={generatePreview}
            disabled={generating}
            className="px-6 py-3 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Preview'}
          </button>
        </div>
      )}

      {/* Pairing Preview */}
      {preview && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Round {preview.round} Preview</h3>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Matches</div>
              <div className="text-xl font-bold">{preview.totalMatches}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Players</div>
              <div className="text-xl font-bold">{preview.totalPlayers}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Rematches</div>
              <div className="text-xl font-bold text-orange-600">{preview.rematches}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Bye</div>
              <div className="text-xl font-bold">{preview.byePlayer || 'None'}</div>
            </div>
          </div>

          {/* Pairings List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Pairings:</h4>
            {preview.pairings.map((pairing, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  pairing.isRematch ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium">{pairing.player1.name}</div>
                    <div className="text-sm text-gray-600">
                      ELO: {pairing.player1.elo} • Wins: {pairing.player1.wins}
                    </div>
                  </div>
                  <div className="mx-4 text-gray-400">VS</div>
                  <div className="flex-1 text-right">
                    <div className="font-medium">{pairing.player2.name}</div>
                    <div className="text-sm text-gray-600">
                      ELO: {pairing.player2.elo} • Wins: {pairing.player2.wins}
                    </div>
                  </div>
                </div>
                {pairing.isRematch && (
                  <div className="mt-2 text-sm text-orange-600 font-medium">
                    ⚠️ These players have already played each other
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Confirm/Cancel Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setPreview(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmAndGenerate}
              disabled={generating}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {generating ? 'Creating Matches...' : 'Confirm & Create Matches'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
