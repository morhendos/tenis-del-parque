'use client'

import StandingsTable from './StandingsTable'

export default function PlayoffStandings({ 
  eligiblePlayerCount,
  playoffsInitialized,
  standings,
  seasonIdentifier,
  numberOfGroups
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">
        {playoffsInitialized ? '🔒 Locked-in Playoff Players' : 'Current Standings'}
      </h2>
      
      {playoffsInitialized && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 font-semibold">
            ⚠️ Playoffs have been initialized - these players are LOCKED IN
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            The standings shown below are the qualified players at the time playoffs were initialized.
            To recalculate with current standings, use the &quot;Reset &amp; Recalculate Playoffs&quot; button.
          </p>
        </div>
      )}
      
      {eligiblePlayerCount === 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            ⚠️ No eligible players found! This could mean:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-red-700">
            <li>Players are not properly registered for this league</li>
            <li>The season identifier mismatch (check season ID above)</li>
            <li>No matches have been played yet</li>
            <li>Player registrations use a different season value than &quot;{seasonIdentifier}&quot;</li>
          </ul>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-green-700">
            ✅ {playoffsInitialized ? 'Qualified' : 'Found'} {eligiblePlayerCount} eligible players {playoffsInitialized ? '(locked in)' : 'with completed matches'}
          </p>
          
          <StandingsTable 
            standings={standings}
            playoffsInitialized={playoffsInitialized}
            numberOfGroups={numberOfGroups}
          />
        </div>
      )}
    </div>
  )
}

