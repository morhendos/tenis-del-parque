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
  onMoveToLeague,
  onViewDetails,
  onPaymentStatusUpdate,
  onInjuryToggle,
  updateLoading,
  invitationLoading,
  eloRecalculateLoading,
  currentLeagueId
}) {
  if (players.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="text-center py-10 text-sm text-gray-500">
          No players found matching your criteria
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Level
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Account
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
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
                onMoveToLeague={onMoveToLeague}
                onViewDetails={onViewDetails}
                onPaymentStatusUpdate={onPaymentStatusUpdate}
                onInjuryToggle={onInjuryToggle}
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
