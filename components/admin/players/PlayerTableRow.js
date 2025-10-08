import React from 'react'

export default function PlayerTableRow({ 
  player, 
  onStatusUpdate, 
  onLevelUpdate, 
  onInvite, 
  onDelete,
  onRecalculateElo,
  updateLoading,
  invitationLoading,
  eloRecalculateLoading
}) {
  const getInviteButtonConfig = (player) => {
    const canInvite = player.status === 'pending' && !player.userId
    const canReinvite = player.status === 'pending' && player.userId
    
    if (canInvite) {
      return { show: true, text: '📧 Invite', isReinvite: false }
    }
    if (canReinvite) {
      return { show: true, text: '🔄 Re-invite', isReinvite: true }
    }
    if (player.status === 'confirmed') {
      return { show: false, status: '✉️ Invited' }
    }
    if (player.status === 'active') {
      return { show: false, status: '✅ Active' }
    }
    return { show: false, status: '-' }
  }

  const config = getInviteButtonConfig(player)
  const statusLoadingKey = `status-${player._id}`
  const levelLoadingKey = `level-${player._id}`
  const inviteLoadingKey = `invite-${player._id}`

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {player.name}
          </div>
          <div className="text-sm text-gray-500">
            Registered: {new Date(player.registeredAt).toLocaleDateString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{player.email}</div>
        <div className="text-sm text-gray-500">{player.whatsapp}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={player.level}
          onChange={(e) => onLevelUpdate(player._id, e.target.value)}
          disabled={updateLoading[levelLoadingKey]}
          className={`text-xs font-semibold px-2 py-1 rounded border ${
            player.level === 'beginner' ? 'bg-green-50 text-green-800 border-green-200' :
            player.level === 'intermediate' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
            'bg-purple-50 text-purple-800 border-purple-200'
          } ${updateLoading[levelLoadingKey] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        {updateLoading[levelLoadingKey] && (
          <div className="inline-block ml-2">
            <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {player.league?.name || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>ELO: {player.eloRating || 1200}</div>
        <div>W/L: {player.stats?.matchesWon || 0}/{(player.stats?.matchesPlayed || 0) - (player.stats?.matchesWon || 0)}</div>
        {(player.stats?.matchesPlayed || 0) > 0 && (
          <button
            onClick={() => onRecalculateElo(player._id)}
            disabled={eloRecalculateLoading[`elo-${player._id}`]}
            className="mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Recalculate ELO based on match history"
          >
            {eloRecalculateLoading[`elo-${player._id}`] ? '⟳' : '🔄'} Recalc ELO
          </button>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={player.status}
          onChange={(e) => onStatusUpdate(player._id, e.target.value)}
          disabled={updateLoading[statusLoadingKey]}
          className={`text-xs font-semibold px-2 py-1 rounded border ${
            player.status === 'active' ? 'bg-green-50 text-green-800 border-green-200' :
            player.status === 'confirmed' ? 'bg-blue-50 text-blue-800 border-blue-200' :
            player.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
            'bg-gray-50 text-gray-800 border-gray-200'
          } ${updateLoading[statusLoadingKey] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {updateLoading[statusLoadingKey] && (
          <div className="inline-block ml-2">
            <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {config.show ? (
          <button
            onClick={() => onInvite(player._id, config.isReinvite)}
            disabled={invitationLoading[inviteLoadingKey]}
            className={`px-3 py-1 text-white text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed ${
              config.isReinvite 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {invitationLoading[inviteLoadingKey] 
              ? (config.isReinvite ? 'Re-inviting...' : 'Inviting...') 
              : config.text
            }
          </button>
        ) : (
          <span className={`text-xs font-medium ${
            player.status === 'confirmed' ? 'text-blue-600' :
            player.status === 'active' ? 'text-green-600' : 'text-gray-400'
          }`}>
            {config.status}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onDelete({ show: true, player: player })}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  )
}
