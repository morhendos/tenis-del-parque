import { useState, useEffect, useRef } from 'react'

export function MatchModals({ 
  showResultModal,
  showScheduleModal,
  selectedMatch,
  player,
  language,
  league,
  onCloseResult,
  onCloseSchedule,
  onSubmitResult,
  onSubmitSchedule,
  isEditingSchedule = false
}) {
  // Venue options by city
  const VENUE_OPTIONS = {
    sotogrande: [
      { value: 'La Reserva', label: 'La Reserva' },
      { value: 'Racket Center', label: 'Racket Center' },
      { value: 'Octagono', label: 'Octágono' },
      { value: 'Faisan', label: 'Faisán' },
      { value: 'San Roque Club', label: 'San Roque Club' },
      { value: 'other', label: language === 'es' ? 'Otro...' : 'Other...' }
    ]
  }

  // Get venues for current league city
  const getVenueOptions = () => {
    // Try citySlug first, then fall back to city name converted to slug
    let citySlug = league?.location?.citySlug?.toLowerCase()
    if (!citySlug && league?.location?.city) {
      citySlug = league.location.city.toLowerCase().replace(/\s+/g, '-')
    }
    return VENUE_OPTIONS[citySlug] || null
  }

  const venueOptions = getVenueOptions()
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
    customVenue: '',
    court: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [formError, setFormError] = useState('')
  
  // Refs for auto-focus functionality
  const inputRefs = useRef({})
  
  // Helper function to get next input key
  const getNextInputKey = (currentSetIndex, currentField, setsLength) => {
    if (currentField === 'myScore') {
      return `${currentSetIndex}-opponentScore`
    } else if (currentField === 'opponentScore') {
      // Move to next set's myScore, if it exists
      if (currentSetIndex + 1 < setsLength) {
        return `${currentSetIndex + 1}-myScore`
      }
    }
    return null
  }

  const getOpponent = (match) => {
    if (!player || !match) return null
    return match.players.player1._id === player._id 
      ? match.players.player2 
      : match.players.player1
  }

  // Reset forms when modals open/close
  useEffect(() => {
    if (!showResultModal) {
      setResultForm({ 
        sets: [
          { myScore: '', opponentScore: '' },
          { myScore: '', opponentScore: '' }
        ],
        walkover: false,
        retiredPlayer: null
      })
      setValidationErrors({})
      setFormError('')
    }
  }, [showResultModal])

  useEffect(() => {
    if (!showScheduleModal) {
      setScheduleForm({ date: '', time: '', venue: '', customVenue: '', court: '', notes: '' })
      setFormError('')
    } else if (showScheduleModal && isEditingSchedule && selectedMatch) {
      // Prefill form with existing schedule data when editing
      const schedule = selectedMatch.schedule || {}
      const scheduledDate = schedule.confirmedDate || selectedMatch.scheduledDate
      const existingVenue = schedule.venue || schedule.club || ''
      
      // Check if existing venue is in our predefined list (case-insensitive)
      const currentVenueOptions = getVenueOptions()
      const matchedOption = currentVenueOptions?.find(opt => 
        opt.value.toLowerCase() === existingVenue.toLowerCase()
      )
      
      setScheduleForm({
        date: scheduledDate ? new Date(scheduledDate).toISOString().split('T')[0] : '',
        time: schedule.time || '',
        venue: matchedOption ? matchedOption.value : (existingVenue ? 'other' : ''),
        customVenue: matchedOption ? '' : existingVenue,
        court: schedule.court || (schedule.courtNumber ? `${language === 'es' ? 'Pista' : 'Court'} ${schedule.courtNumber}` : ''),
        notes: schedule.notes || ''
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScheduleModal, isEditingSchedule, selectedMatch, language])

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
    // Clear error for this set when user starts typing
    setValidationErrors(prev => ({ ...prev, [`set${index}`]: '' }))
    setFormError('')
    
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
    
    // Auto-focus to next input when user enters a number
    if (value !== '' && !isNaN(value) && value.trim() !== '') {
      const nextInputKey = getNextInputKey(index, field, newSets.length)
      if (nextInputKey && inputRefs.current[nextInputKey]) {
        // Small delay to ensure the state update is processed
        setTimeout(() => {
          inputRefs.current[nextInputKey].focus()
        }, 10)
      }
    }
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
    setValidationErrors({})
    setFormError('')
    
    try {
      // Validate sets
      if (!resultForm.walkover) {
        let errors = {}
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
            
            errors[`set${i}`] = language === 'es' 
              ? `Por favor completa el set ${i + 1}` 
              : `Please complete set ${i + 1}`
            continue
          }
          
          const myScore = parseInt(set.myScore)
          const oppScore = parseInt(set.opponentScore)
          
          if (isNaN(myScore) || isNaN(oppScore) || myScore < 0 || oppScore < 0) {
            errors[`set${i}`] = language === 'es' ? 'Puntuaciones inválidas' : 'Invalid scores'
            continue
          }
          
          const validationError = validateSetScore(i, myScore, oppScore)
          if (validationError) {
            errors[`set${i}`] = validationError
            continue
          }
          
          hasValidScores = true
        }
        
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors)
          setSubmitting(false)
          return
        }
        
        if (!hasValidScores) {
          setFormError(language === 'es' ? 'Por favor ingresa al menos un set' : 'Please enter at least one set')
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
      
    } catch (error) {
      console.error('Error submitting result:', error)
      setFormError(language === 'es' ? 'Error al enviar resultado' : 'Error submitting result')
    } finally {
      setSubmitting(false)
    }
  }

  const handleScheduleMatch = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    
    try {
      // Determine the actual venue value
      const actualVenue = scheduleForm.venue === 'other' 
        ? scheduleForm.customVenue 
        : scheduleForm.venue
      
      await onSubmitSchedule({
        matchId: selectedMatch._id,
        ...scheduleForm,
        venue: actualVenue
      })
    } catch (error) {
      console.error('Error scheduling match:', error)
      setFormError(language === 'es' ? 'Error al programar partido' : 'Error scheduling match')
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
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 pb-24 sm:pb-6 max-h-[90vh] overflow-y-auto animate-slide-up-mobile sm:animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'es' ? 'Reportar Resultado' : 'Report Result'}
              </h2>
              <button
                onClick={onCloseResult}
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
            
            {/* Error display */}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formError}
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmitResult} className="space-y-4">
              {/* Walkover option */}
              <label className="flex items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  id="walkover"
                  checked={resultForm.walkover}
                  onChange={(e) => {
                    setResultForm({...resultForm, walkover: e.target.checked})
                    setValidationErrors({})
                    setFormError('')
                  }}
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
                      <div key={index}>
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-3">
                          <span className="text-sm text-gray-500 w-16">{getSetLabel(index)}:</span>
                          <input
                            type="number"
                            min="0"
                            max={getMaxScore(index)}
                            placeholder={language === 'es' ? 'Yo' : 'Me'}
                            value={set.myScore}
                            onChange={(e) => handleSetChange(index, 'myScore', e.target.value)}
                            ref={(el) => inputRefs.current[`${index}-myScore`] = el}
                            className={`w-20 px-3 py-2 border rounded-lg focus:outline-none focus:border-parque-purple focus:ring-1 focus:ring-parque-purple text-center font-medium ${
                              validationErrors[`set${index}`] ? 'border-red-300' : 'border-gray-300'
                            }`}
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
                            ref={(el) => inputRefs.current[`${index}-opponentScore`] = el}
                            className={`w-20 px-3 py-2 border rounded-lg focus:outline-none focus:border-parque-purple focus:ring-1 focus:ring-parque-purple text-center font-medium ${
                              validationErrors[`set${index}`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            required={index < 2 || (index === 2 && checkForSuperTiebreak())}
                          />
                          {index === 2 && (
                            <span className="text-xs text-gray-500 ml-2">
                              {language === 'es' ? '(a 10+)' : '(to 10+)'}
                            </span>
                          )}
                        </div>
                        {validationErrors[`set${index}`] && (
                          <p className="mt-1 text-xs text-red-600 pl-2">
                            {validationErrors[`set${index}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onCloseResult}
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
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 pb-24 sm:pb-6 max-h-[90vh] overflow-y-auto animate-slide-up-mobile sm:animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditingSchedule 
                  ? (language === 'es' ? 'Editar Programación' : 'Edit Schedule')
                  : (language === 'es' ? 'Programar Partido' : 'Schedule Match')}
              </h2>
              <button
                onClick={onCloseSchedule}
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
            
            {/* Error display */}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formError}
                </p>
              </div>
            )}
            
            <form onSubmit={handleScheduleMatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Fecha' : 'Date'}
                </label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => {
                    setScheduleForm({...scheduleForm, date: e.target.value})
                    setFormError('')
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-parque-purple focus:ring-1 focus:ring-parque-purple"
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
                  onChange={(e) => {
                    setScheduleForm({...scheduleForm, time: e.target.value})
                    setFormError('')
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-parque-purple focus:ring-1 focus:ring-parque-purple"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Lugar' : 'Venue'}
                </label>
                {venueOptions ? (
                  // Dropdown for cities with predefined venues
                  <>
                    <div className="relative">
                      <select
                        value={scheduleForm.venue}
                        onChange={(e) => {
                          setScheduleForm({...scheduleForm, venue: e.target.value, customVenue: ''})
                          setFormError('')
                        }}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:border-parque-purple focus:ring-1 focus:ring-parque-purple bg-white appearance-none cursor-pointer"
                        required
                      >
                        <option value="">{language === 'es' ? 'Seleccionar lugar...' : 'Select venue...'}</option>
                        {venueOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {scheduleForm.venue === 'other' && (
                      <input
                        type="text"
                        value={scheduleForm.customVenue}
                        onChange={(e) => {
                          setScheduleForm({...scheduleForm, customVenue: e.target.value})
                          setFormError('')
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-parque-purple focus:ring-1 focus:ring-parque-purple mt-2"
                        placeholder={language === 'es' ? 'Nombre del lugar...' : 'Venue name...'}
                        required
                      />
                    )}
                  </>
                ) : (
                  // Text input for cities without predefined venues
                  <input
                    type="text"
                    value={scheduleForm.venue}
                    onChange={(e) => {
                      setScheduleForm({...scheduleForm, venue: e.target.value})
                      setFormError('')
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-parque-purple focus:ring-1 focus:ring-parque-purple"
                    placeholder={language === 'es' ? 'Ej: Club Deportivo' : 'Ex: Sports Club'}
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Cancha' : 'Court'}
                </label>
                <input
                  type="text"
                  value={scheduleForm.court}
                  onChange={(e) => {
                    setScheduleForm({...scheduleForm, court: e.target.value})
                    setFormError('')
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-parque-purple focus:ring-1 focus:ring-parque-purple"
                  placeholder={language === 'es' ? 'Ej: Cancha 1' : 'Ex: Court 1'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Notas' : 'Notes'}
                </label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => {
                    setScheduleForm({...scheduleForm, notes: e.target.value})
                    setFormError('')
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-parque-purple focus:ring-1 focus:ring-parque-purple resize-none"
                  rows="3"
                  placeholder={language === 'es' ? 'Información adicional...' : 'Additional information...'}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onCloseSchedule}
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
                    : isEditingSchedule
                    ? (language === 'es' ? 'Actualizar' : 'Update')
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