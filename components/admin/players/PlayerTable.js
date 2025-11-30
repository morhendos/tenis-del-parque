import React from 'react'
import PlayerTableRow from './PlayerTableRow'

export default function PlayerTable({ 
  players, 
  onStatusUpdate, 
  onLevelUpdate, 
  onInvite, 
  onDelete,
  onRecalculateElo,
  onRemoveFromLeague,
  onViewDetails,
  onPaymentStatusUpdate,
  updateLoading,
  invitationLoading,
  eloRecalculateLoading,
  currentLeagueId
}) {
  if (players.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="text-center py-8 text-gray-500">
          No players found matching your criteria
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <PlayerTableRow
                key={player._id}
                player={player}
                onStatusUpdate={onStatusUpdate}
                onLevelUpdate={onLevelUpdate}
                onInvite={onInvite}
                onDelete={onDelete}
                onRecalculateElo={onRecalculateElo}
                onRemoveFromLeague={onRemoveFromLeague}
                onViewDetails={onViewDetails}
                onPaymentStatusUpdate={onPaymentStatusUpdate}
                updateLoading={updateLoading}
                invitationLoading={invitationLoading}
                eloRecalculateLoading={eloRecalculateLoading}
                currentLeagueId={currentLeagueId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
