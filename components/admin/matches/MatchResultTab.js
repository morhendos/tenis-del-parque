import React, { useState } from 'react'
import MatchResultForm from './MatchResultForm'
import MatchResultDisplay from './MatchResultDisplay'

export default function MatchResultTab({ match, onResultUpdate, onResetToUnplayed }) {
  const [isEditingResult, setIsEditingResult] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resultForm, setResultForm] = useState(() => {
    if (match.result) {
      return {
        sets: match.result.score?.sets || [{ player1: '', player2: '' }],
        winner: match.result.winner || '',
        walkover: match.result.score?.walkover || false,
        retiredPlayer: match.result.score?.retiredPlayer || ''
      }
    }
    return {
      sets: [{ player1: '', player2: '' }],
      winner: '',
      walkover: false,
      retiredPlayer: ''
    }
  })

  const handleSubmitResult = async () => {
    if (!resultForm.winner) {
      alert('Please select a winner')
      return
    }

    setSubmitting(true)
    try {
      // Prepare result data
      const result = {
        winner: resultForm.winner,
        score: {
          sets: resultForm.sets.filter(set => set.player1 !== '' && set.player2 !== ''),
          walkover: resultForm.walkover
        }
      }

      if (resultForm.retiredPlayer) {
        result.score.retiredPlayer = resultForm.retiredPlayer
      }

      await onResultUpdate(result)
      setIsEditingResult(false)
    } catch (error) {
      console.error('Error submitting result:', error)
      alert(error.message || 'Failed to submit result')
    } finally {
      setSubmitting(false)
    }
  }

  const shouldShowForm = match.status !== 'completed' || !match.result || isEditingResult

  return (
    <div className="space-y-6">
      {!shouldShowForm ? (
        <MatchResultDisplay 
          match={match}
          onEdit={() => setIsEditingResult(true)}
          onResetToUnplayed={onResetToUnplayed}
        />
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {isEditingResult ? 'Edit Match Result' : 'Enter Match Result'}
          </h3>

          <MatchResultForm
            match={match}
            resultForm={resultForm}
            onResultFormChange={setResultForm}
            onSubmit={handleSubmitResult}
            submitting={submitting}
          />

          {isEditingResult && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsEditingResult(false)
                  // Reset form to original result
                  if (match.result) {
                    setResultForm({
                      sets: match.result.score?.sets || [{ player1: '', player2: '' }],
                      winner: match.result.winner || '',
                      walkover: match.result.score?.walkover || false,
                      retiredPlayer: match.result.score?.retiredPlayer || ''
                    })
                  }
                }}
                className="mr-3 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
