import { useState } from 'react'

const cityId = (league) => String(league?.city?._id || league?.city || '')
const sameSeason = (a, b) =>
  a?.season?.year === b?.season?.year && a?.season?.type === b?.season?.type

export default function MoveLeagueModal({ player, currentLeagueId, leagues, onClose, onMove }) {
  const [targetId, setTargetId] = useState('')
  const [saving, setSaving] = useState(false)

  if (!player) return null

  const current = leagues.find(l => l._id === currentLeagueId)
  const options = leagues.filter(l =>
    l._id !== currentLeagueId &&
    current &&
    cityId(l) === cityId(current) &&
    sameSeason(l, current)
  )

  const handleMove = async () => {
    if (!targetId) return
    setSaving(true)
    await onMove(player._id, currentLeagueId, targetId)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Move {player.name}</h3>
        <p className="mt-1 text-sm text-gray-500">From {current?.name || 'current league'}</p>

        {options.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No other leagues in this city and season.</p>
        ) : (
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="mt-4 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Choose league...</option>
            {options.map(l => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>
        )}

        <p className="mt-3 text-xs text-gray-500">
          Payment and status stay as they are. Level changes to the new league&apos;s level.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={!targetId || saving}
            className="rounded bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Moving...' : 'Move'}
          </button>
        </div>
      </div>
    </div>
  )
}
