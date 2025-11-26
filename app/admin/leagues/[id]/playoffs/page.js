'use client'

/**
 * CRITICAL RULE FOR ALL JSX/REACT CODE:
 * =====================================
 * NEVER use unescaped quotes in JSX text content!
 * 
 * ❌ WRONG: <p>Click the "button" here</p>
 * ✅ RIGHT: <p>Click the &quot;button&quot; here</p>
 * 
 * Common HTML entities to use:
 * - " becomes &quot; or &ldquo;/&rdquo;
 * - ' becomes &apos; or &#39;
 * - & becomes &amp;
 * - < becomes &lt;
 * - > becomes &gt;
 * 
 * This prevents build errors in production!
 */

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { usePlayoffData } from '@/components/admin/playoffs/usePlayoffData'
import { usePlayoffActions } from '@/components/admin/playoffs/usePlayoffActions'
import PlayoffStandings from '@/components/admin/playoffs/PlayoffStandings'
import PlayoffConfiguration from '@/components/admin/playoffs/PlayoffConfiguration'
import PlayoffBrackets from '@/components/admin/playoffs/PlayoffBrackets'
import NotificationModal from '@/components/admin/playoffs/NotificationModal'
import FinalistEmailModal from '@/components/admin/playoffs/FinalistEmailModal'

export default function LeaguePlayoffsAdmin() {
  const params = useParams()
  const leagueId = params.id
  
  // Use custom hooks for data and actions
  const playoffData = usePlayoffData(leagueId)
  const playoffActions = usePlayoffActions(leagueId, playoffData)
  
  // Modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationGroup, setNotificationGroup] = useState('A')
  const [showFinalistEmailModal, setShowFinalistEmailModal] = useState(false)
  const [finalistGroup, setFinalistGroup] = useState('A')
  
  const {
    loading,
    league,
    playoffConfig,
    playoffMatches,
    standings,
    eligiblePlayerCount,
    seasonIdentifier,
    playoffsInitialized,
    numberOfGroups,
    setNumberOfGroups
  } = playoffData
  
  const {
    handleInitializePlayoffs,
    handleResetPlayoffs,
    handleUpdateConfig,
    handleCreateNextRound,
    handleMatchClick
  } = playoffActions
  
  const handleOpenNotifications = (group) => {
    setNotificationGroup(group)
    setShowNotificationModal(true)
  }
  
  const handleOpenFinalistEmails = (group) => {
    setFinalistGroup(group)
    setShowFinalistEmailModal(true)
  }
  
  const currentPhase = playoffConfig?.currentPhase || 'regular_season'
  const isPlayoffsActive = currentPhase !== 'regular_season' && currentPhase !== 'completed'
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Playoff Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          League: {league?.name} | Status: {currentPhase.replace(/_/g, ' ').toUpperCase()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Season ID: {seasonIdentifier || 'Loading...'} | League Slug: {league?.slug}
        </p>
      </div>
      
      {/* Eligible Players Display */}
      {currentPhase === 'regular_season' && (
        <PlayoffStandings
          eligiblePlayerCount={eligiblePlayerCount}
          playoffsInitialized={playoffsInitialized}
          standings={standings}
          seasonIdentifier={seasonIdentifier}
          numberOfGroups={numberOfGroups}
        />
      )}
      
      {/* Configuration Section */}
      {currentPhase === 'regular_season' && !playoffsInitialized && (
        <PlayoffConfiguration
          numberOfGroups={numberOfGroups}
          setNumberOfGroups={setNumberOfGroups}
          eligiblePlayerCount={eligiblePlayerCount}
          onUpdateConfig={handleUpdateConfig}
          onInitializePlayoffs={handleInitializePlayoffs}
        />
      )}
      
      {/* Playoff Bracket Display */}
      {isPlayoffsActive && (
        <PlayoffBrackets
          playoffConfig={playoffConfig}
          playoffMatches={playoffMatches}
          onCreateNextRound={handleCreateNextRound}
          onMatchClick={handleMatchClick}
          onResetPlayoffs={handleResetPlayoffs}
          onOpenNotifications={handleOpenNotifications}
          onOpenFinalistEmails={handleOpenFinalistEmails}
        />
      )}
      
      {/* Completed Status */}
      {currentPhase === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Playoffs Completed! 🏆
          </h2>
          <p className="text-green-700">
            The playoffs have been successfully completed. Check the tournament brackets above for final results.
          </p>
        </div>
      )}
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Check the eligible players count before initializing playoffs</li>
          <li>You need at least 8 players who have played matches to start playoffs</li>
          <li>Configure the number of playoff groups before initializing</li>
          <li>Initialize playoffs when regular season is complete - this will LOCK IN the qualified players</li>
          <li>Once initialized, playoff players are locked and won&apos;t change even if regular season standings change</li>
          <li>Send notification emails and WhatsApp messages to qualified players</li>
          <li>If playoffs show wrong players, use &quot;Reset &amp; Recalculate Playoffs&quot; button to re-lock with current standings</li>
          <li>Quarterfinal matches are created automatically with proper seeding</li>
          <li>Create semifinal matches after quarterfinals are complete</li>
          <li>Create final matches after semifinals are complete</li>
          <li>Click on any match to enter results</li>
        </ul>
      </div>
      
      {/* Modals */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        leagueId={leagueId}
        group={notificationGroup}
      />
      
      <FinalistEmailModal
        isOpen={showFinalistEmailModal}
        onClose={() => setShowFinalistEmailModal(false)}
        leagueId={leagueId}
        group={finalistGroup}
      />
    </div>
  )
}
