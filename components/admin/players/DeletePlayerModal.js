import React from 'react'

export default function DeletePlayerModal({ player, onClose, onConfirm }) {
  if (!player) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">Delete Player</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{player.name}</strong>? 
          This will also delete all their match history and cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Player
          </button>
        </div>
      </div>
    </div>
  )
}
