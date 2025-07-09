import React from 'react'

export default function MatchResultForm({ 
  match, 
  resultForm, 
  onResultFormChange, 
  onSubmit, 
  submitting 
}) {
  const handleAddSet = () => {
    onResultFormChange({
      ...resultForm,
      sets: [...resultForm.sets, { player1: '', player2: '' }]
    })
  }

  const handleRemoveSet = (index) => {
    const newSets = resultForm.sets.filter((_, i) => i !== index)
    onResultFormChange({
      ...resultForm,
      sets: newSets.length > 0 ? newSets : [{ player1: '', player2: '' }]
    })
  }

  const handleSetChange = (index, player, value) => {
    const newSets = [...resultForm.sets]
    newSets[index][player] = value
    onResultFormChange({ ...resultForm, sets: newSets })
    
    // Auto-determine winner if all sets are filled
    if (value !== '') {
      const completeSets = newSets.filter(set => set.player1 !== '' && set.player2 !== '')
      if (completeSets.length >= 2) {
        const player1Wins = completeSets.filter(set => parseInt(set.player1) > parseInt(set.player2)).length
        const player2Wins = completeSets.filter(set => parseInt(set.player2) > parseInt(set.player1)).length
        
        if (player1Wins > player2Wins) {
          onResultFormChange(prev => ({ ...prev, winner: match.players.player1._id }))
        } else if (player2Wins > player1Wins) {
          onResultFormChange(prev => ({ ...prev, winner: match.players.player2._id }))
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Score Entry */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Score (Sets)
        </label>
        <div className="space-y-3">
          {resultForm.sets.map((set, index) => (
            <div key={index} className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 w-24 text-right">
                  {match.players.player1.name}
                </span>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={set.player1}
                  onChange={(e) => handleSetChange(index, 'player1', e.target.value)}
                  className="w-16 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  disabled={resultForm.walkover}
                />
              </div>
              <div className="text-xl font-bold text-gray-400">-</div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={set.player2}
                  onChange={(e) => handleSetChange(index, 'player2', e.target.value)}
                  className="w-16 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  disabled={resultForm.walkover}
                />
                <span className="text-sm font-medium text-gray-700 w-24">
                  {match.players.player2.name}
                </span>
              </div>
              {resultForm.sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSet(index)}
                  className="ml-4 text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        
        {!resultForm.walkover && resultForm.sets.length < 5 && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleAddSet}
              className="text-sm text-parque-purple hover:underline"
            >
              + Add Set
            </button>
          </div>
        )}
      </div>

      {/* Winner Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Winner <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onResultFormChange({ ...resultForm, winner: match.players.player1._id })}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              resultForm.winner === match.players.player1._id
                ? 'border-parque-purple bg-parque-purple bg-opacity-10'
                : 'border-gray-300 hover:border-parque-purple'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                resultForm.winner === match.players.player1._id
                  ? 'border-parque-purple bg-parque-purple'
                  : 'border-gray-300'
              }`}></div>
              <div>
                <p className="font-medium text-gray-900">{match.players.player1.name}</p>
                <p className="text-sm text-gray-600">{match.players.player1.level}</p>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onResultFormChange({ ...resultForm, winner: match.players.player2._id })}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              resultForm.winner === match.players.player2._id
                ? 'border-parque-purple bg-parque-purple bg-opacity-10'
                : 'border-gray-300 hover:border-parque-purple'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                resultForm.winner === match.players.player2._id
                  ? 'border-parque-purple bg-parque-purple'
                  : 'border-gray-300'
              }`}></div>
              <div>
                <p className="font-medium text-gray-900">{match.players.player2.name}</p>
                <p className="text-sm text-gray-600">{match.players.player2.level}</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Special Cases */}
      <div className="space-y-4">
        <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            checked={resultForm.walkover}
            onChange={(e) => onResultFormChange({ ...resultForm, walkover: e.target.checked })}
            className="mr-3 h-4 w-4 text-parque-purple focus:ring-parque-purple border-gray-300 rounded"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">Walkover</span>
            <p className="text-xs text-gray-600">One player didn't show up</p>
          </div>
        </label>

        {!resultForm.walkover && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retirement (optional)
            </label>
            <select
              value={resultForm.retiredPlayer}
              onChange={(e) => onResultFormChange({ ...resultForm, retiredPlayer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            >
              <option value="">No retirement</option>
              <option value={match.players.player1._id}>{match.players.player1.name} retired</option>
              <option value={match.players.player2._id}>{match.players.player2.name} retired</option>
            </select>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onSubmit}
          disabled={submitting || !resultForm.winner}
          className="px-8 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 font-medium"
        >
          {submitting ? 'Saving...' : 'Save Result'}
        </button>
      </div>
    </div>
  )
}
