import { useState, useEffect } from 'react'

export function MatchModals({ 
  showResultModal,
  showScheduleModal,
  selectedMatch,
  player,
  language,
  onCloseResult,
  onCloseSchedule,
  onSubmitResult,
  onSubmitSchedule
}) {
  const [resultForm, setResultForm] = useState({ 
    sets: [
      { myScore: '', opponentScore: '' },
      { myScore: '', opponentScore: '' }
    ],
    walkover: false,
    retiredPlayer: null
  })
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    venue: '',
    court: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const getOpponent = (match) => {
    if (!player || !match) return null
    return match.players.player1._id === player._id 
      ? match.players.player2 
      : match.players.player1
  }

  // Check if we need a super tiebreak (1:1 in sets)
  const checkForSuperTiebreak = () => {
    if (resultForm.walkover || resultForm.sets.length < 2) return false
    
    let mySetWins = 0
    let oppSetWins = 0
    
    for (let i = 0; i < 2; i++) {
      const set = resultForm.sets[i]
      if (set.myScore !== '' && set.opponentScore !== '') {
        const myScore = parseInt(set.myScore)
        const oppScore = parseInt(set.opponentScore)
        if (!isNaN(myScore) && !isNaN(oppScore)) {
          if (myScore > oppScore) mySetWins++
          else if (oppScore > myScore) oppSetWins++
        }
      }
    }
    
    return mySetWins === 1 && oppSetWins === 1
  }

  // Auto-add super tiebreak when it's 1:1
  useEffect(() => {
    if (checkForSuperTiebreak() && resultForm.sets.length === 2) {
      setResultForm(prev => ({
        ...prev,
        sets: [...prev.sets, { myScore: '', opponentScore: '' }]
      }))
    }
  }, [resultForm.sets])

  const handleSetChange = (index, field, value) => {
    const newSets = [...resultForm.sets]
    newSets[index][field] = value
    
    // If changing set 1 or 2 and it's no longer 1:1, remove the third set
    if (index < 2 && resultForm.sets.length === 3) {
      let mySetWins = 0
      let oppSetWins = 0
      
      for (let i = 0; i < 2; i++) {
        const set = i === index ? { ...newSets[i], [field]: value } : newSets[i]
        if (set.myScore !== '' && set.opponentScore !== '') {
          const myScore = parseInt(set.myScore)
          const oppScore = parseInt(set.opponentScore)
          if (!isNaN(myScore) && !isNaN(oppScore)) {
            if (myScore > oppScore) mySetWins++
            else if (oppScore > myScore) oppSetWins++
          }
        }
      }
      
      // Remove third set if it's not 1:1
      if (!(mySetWins === 1 && oppSetWins === 1)) {
        newSets.splice(2, 1)
      }
    }
    
    setResultForm({ ...resultForm, sets: newSets })
  }

  const validateSetScore = (setIndex, myScore, oppScore) => {
    const isSupertiebreak = setIndex === 2 // Third set is super tiebreak
    
    if (isSupertiebreak) {
      // Super tiebreak validation: one player must reach at least 10 and win by 2
      if (myScore >= 10 || oppScore >= 10) {
        const diff = Math.abs(myScore - oppScore)
        if (diff < 2) {
          return language === 'es' 
            ? 'El super tiebreak debe ganarse por diferencia de 2 puntos' 
            : 'Super tiebreak must be won by 2 points'
        }
      } else if (myScore < 10 && oppScore < 10) {
        return language === 'es'
          ? 'En el super tiebreak, un jugador debe llegar a 10 puntos'
          : 'In super tiebreak, one player must reach 10 points'
      }
    } else {
      // Regular set validation
      if (myScore === oppScore) {
        return language === 'es' ? 'El set no puede terminar empatado' : 'Set cannot end in a tie'
      }
      
      if (myScore === 7 || oppScore === 7) {
        // Tiebreak set
        const diff = Math.abs(myScore - oppScore)
        if (myScore === 7 && oppScore === 5) return null // 7-5 is valid
        if (oppScore === 7 && myScore === 5) return null // 5-7 is valid
        if (myScore === 7 && oppScore === 6) return null // 7-6 is valid
        if (oppScore === 7 && myScore === 6) return null // 6-7 is valid
        if (myScore === 7 && oppScore < 5) return null // 7-0 to 7-4 are valid
        if (oppScore === 7 && myScore < 5) return null // 0-7 to 4-7 are valid
        
        return language === 'es' 
          ? 'Puntuación de set inválida' 
          : 'Invalid set score'
      } else if (myScore === 6 || oppScore === 6) {
        // Regular set win
        const winner = myScore === 6 ? myScore : oppScore
        const loser = myScore === 6 ? oppScore : myScore
        
        if (loser > 4 && winner - loser < 2) {
          return language === 'es' 
            ? 'Debe ganar por diferencia de 2 juegos' 
            : 'Must win by 2 games difference'
        }
      } else if (myScore > 7 || oppScore > 7) {
        return language === 'es' 
          ? 'Puntuación máxima del set es 7' 
          : 'Maximum set score is 7'
      }
    }
    
    return null // Valid
  }

  const handleSubmitResult = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Validate sets
      if (!resultForm.walkover) {
        let hasValidScores = false
        
        for (let i = 0; i < resultForm.sets.length; i++) {
          const set = resultForm.sets[i]
          if (set.myScore === '' || set.opponentScore === '') {
            // For the third set (super tiebreak), it's optional if match is already decided
            if (i === 2) {
              // Check if match is already decided after 2 sets
              let mySetWins = 0
              let oppSetWins = 0
              for (let j = 0; j < 2; j++) {
                const prevSet = resultForm.sets[j]
                if (prevSet.myScore !== '' && prevSet.opponentScore !== '') {
                  if (parseInt(prevSet.myScore) > parseInt(prevSet.opponentScore)) mySetWins++
                  else oppSetWins++
                }
              }
              if (mySetWins === 2 || oppSetWins === 2) {
                // Match already decided, remove empty third set
                resultForm.sets.splice(2, 1)
                continue
              }
            }
            
            alert(language === 'es' 
              ? `Por favor completa el set ${i + 1}` 
              : `Please complete set ${i + 1}`)
            setSubmitting(false)
            return
          }
          
          const myScore = parseInt(set.myScore)
          const oppScore = parseInt(set.opponentScore)
          
          if (isNaN(myScore) || isNaN(oppScore) || myScore < 0 || oppScore < 0) {
            alert(language === 'es' ? 'Puntuaciones inválidas' : 'Invalid scores')
            setSubmitting(false)
            return
          }
          
          const validationError = validateSetScore(i, myScore, oppScore)
          if (validationError) {
            alert(validationError)
            setSubmitting(false)
            return
          }
          
          hasValidScores = true
        }
        
        if (!hasValidScores) {
          alert(language === 'es' ? 'Por favor ingresa al menos un set' : 'Please enter at least one set')
          setSubmitting(false)
          return
        }
      }
      
      await onSubmitResult({
        matchId: selectedMatch._id,
        sets: resultForm.walkover ? [] : resultForm.sets.map(set => ({
          myScore: parseInt(set.myScore),
          opponentScore: parseInt(set.opponentScore)
        })),
        walkover: resultForm.walkover,
        retiredPlayer: resultForm.retiredPlayer
      })
      
      setResultForm({ 
        sets: [
          { myScore: '', opponentScore: '' },
          { myScore: '', opponentScore: '' }
        ],
        walkover: false,
        retiredPlayer: null
      })
    } catch (error) {
      console.error('Error submitting result:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleScheduleMatch = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      await onSubmitSchedule({
        matchId: selectedMatch._id,
        ...scheduleForm
      })
      
      setScheduleForm({ date: '', time: '', venue: '', court: '', notes: '' })
    } catch (error) {
      console.error('Error scheduling match:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getMaxScore = (setIndex) => {
    // Third set (super tiebreak) can go higher
    return setIndex === 2 ? 30 : 7
  }

  const getSetLabel = (index) => {
    if (index === 2) {
      return language === 'es' ? 'Super TB' : 'Super TB'
    }
    return `Set ${index + 1}`
  }

  return (
    <>
      {/* Result Modal - Mobile Optimized */}
      {showResultModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto animate-slide-up-mobile sm:animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'es' ? 'Reportar Resultado' : 'Report Result'}
              </h2>
              <button
                onClick={() => {
                  onCloseResult()
                  setResultForm({ 
                    sets: [
                      { myScore: '', opponentScore: '' },
                      { myScore: '', opponentScore: '' }
                    ],
                    walkover: false,
                    retiredPlayer: null
                  })
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Opponent info */}
            <div className="mb-4 p-3 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'es' ? 'Partido contra' : 'Match against'}
              </p>
              <p className="font-semibold text-gray-900">
                {getOpponent(selectedMatch)?.name || 'Unknown'}
              </p>
            </div>
            
            <form onSubmit={handleSubmitResult} className="space-y-4">
              {/* Walkover option */}
              <label className="flex items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  id="walkover"
                  checked={resultForm.walkover}
                  onChange={(e) => setResultForm({...resultForm, walkover: e.target.checked})}
                  className="h-5 w-5 text-parque-purple border-gray-300 rounded focus:ring-parque-purple"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {language === 'es' ? 'Walkover (Oponente no se presentó)' : 'Walkover (Opponent didn\'t show)'}
                </span>
              </label>
              
              {!resultForm.walkover && (
                <>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'es' ? 'Puntuación de Sets' : 'Set Scores'}
                    </label>
                    
                    {checkForSuperTiebreak() && resultForm.sets.length === 3 && (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                        {language === 'es' 
                          ? '⚡ Super tiebreak necesario (1-1 en sets)' 
                          : '⚡ Super tiebreak required (1-1 in sets)'}
                      </div>
                    )}
                    
                    {resultForm.sets.map((set, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-xl p-3">
                        <span className="text-sm text-gray-500 w-16">{getSetLabel(index)}:</span>
                        <input
                          type="number"
                          min="0"
                          max={getMaxScore(index)}
                          placeholder={language === 'es' ? 'Yo' : 'Me'}
                          value={set.myScore}
                          onChange={(e) => handleSetChange(index, 'myScore', e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent text-center font-medium"
                          required={index < 2 || (index === 2 && checkForSuperTiebreak())}
                        />
                        <span className="text-gray-500 font-medium">-</span>
                        <input
                          type="number"
                          min="0"
                          max={getMaxScore(index)}
                          placeholder={language === 'es' ? 'Rival' : 'Opp'}
                          value={set.opponentScore}
                          onChange={(e) => handleSetChange(index, 'opponentScore', e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent text-center font-medium"
                          required={index < 2 || (index === 2 && checkForSuperTiebreak())}
                        />
                        {index === 2 && (
                          <span className="text-xs text-gray-500 ml-2">
                            {language === 'es' ? '(a 10+)' : '(to 10+)'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onCloseResult()
                    setResultForm({ 
                      sets: [
                        { myScore: '', opponentScore: '' },
                        { myScore: '', opponentScore: '' }
                      ],
                      walkover: false,
                      retiredPlayer: null
                    })
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 font-medium"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-parque-purple to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 font-medium shadow-lg shadow-purple-500/25"
                >
                  {submitting 
                    ? (language === 'es' ? 'Enviando...' : 'Submitting...') 
                    : (language === 'es' ? 'Reportar' : 'Report')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal - Mobile Optimized */}
      {showScheduleModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto animate-slide-up-mobile sm:animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'es' ? 'Programar Partido' : 'Schedule Match'}
              </h2>
              <button
                onClick={() => {
                  onCloseSchedule()
                  setScheduleForm({ date: '', time: '', venue: '', court: '', notes: '' })
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Opponent info */}
            <div className="mb-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'es' ? 'Partido contra' : 'Match against'}
              </p>
              <p className="font-semibold text-gray-900">
                {getOpponent(selectedMatch)?.name || 'Unknown'}
              </p>
            </div>
            
            <form onSubmit={handleScheduleMatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Fecha' : 'Date'}
                </label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Hora' : 'Time'}
                </label>
                <input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Lugar' : 'Venue'}
                </label>
                <input
                  type="text"
                  value={scheduleForm.venue}
                  onChange={(e) => setScheduleForm({...scheduleForm, venue: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  placeholder={language === 'es' ? 'Ej: Club Deportivo' : 'Ex: Sports Club'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Cancha' : 'Court'}
                </label>
                <input
                  type="text"
                  value={scheduleForm.court}
                  onChange={(e) => setScheduleForm({...scheduleForm, court: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                  placeholder={language === 'es' ? 'Ej: Cancha 1' : 'Ex: Court 1'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Notas' : 'Notes'}
                </label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent resize-none"
                  rows="3"
                  placeholder={language === 'es' ? 'Información adicional...' : 'Additional information...'}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onCloseSchedule()
                    setScheduleForm({ date: '', time: '', venue: '', court: '', notes: '' })
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 font-medium"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 font-medium shadow-lg shadow-blue-500/25"
                >
                  {submitting 
                    ? (language === 'es' ? 'Guardando...' : 'Saving...') 
                    : (language === 'es' ? 'Programar' : 'Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up-mobile {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-up-mobile {
          animation: slide-up-mobile 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}