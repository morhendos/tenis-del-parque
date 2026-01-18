import React, { useState } from 'react'

export default function MatchScheduleTab({ match, onScheduleUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [scheduleForm, setScheduleForm] = useState(() => {
    const scheduleDate = match.schedule?.confirmedDate
    const deadline = match.schedule?.deadline
    
    return {
      date: scheduleDate ? new Date(scheduleDate).toISOString().split('T')[0] : '',
      time: scheduleDate ? new Date(scheduleDate).toTimeString().slice(0, 5) : '',
      venue: match.schedule?.club || '',
      court: match.schedule?.court || '',
      deadlineDate: deadline ? new Date(deadline).toISOString().split('T')[0] : '',
      deadlineTime: deadline ? new Date(deadline).toTimeString().slice(0, 5) : '23:59'
    }
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const scheduledDate = scheduleForm.date && scheduleForm.time 
        ? new Date(`${scheduleForm.date}T${scheduleForm.time}`)
        : null

      const deadline = scheduleForm.deadlineDate
        ? new Date(`${scheduleForm.deadlineDate}T${scheduleForm.deadlineTime || '23:59'}`)
        : null

      await onScheduleUpdate({
        confirmedDate: scheduledDate,
        club: scheduleForm.venue,
        court: scheduleForm.court,
        time: scheduleForm.time,
        deadline: deadline
      })
      
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating schedule:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form
    const scheduleDate = match.schedule?.confirmedDate
    const deadline = match.schedule?.deadline
    
    setScheduleForm({
      date: scheduleDate ? new Date(scheduleDate).toISOString().split('T')[0] : '',
      time: scheduleDate ? new Date(scheduleDate).toTimeString().slice(0, 5) : '',
      venue: match.schedule?.club || '',
      court: match.schedule?.court || '',
      deadlineDate: deadline ? new Date(deadline).toISOString().split('T')[0] : '',
      deadlineTime: deadline ? new Date(deadline).toTimeString().slice(0, 5) : '23:59'
    })
  }

  const isScheduled = match.schedule?.confirmedDate
  const deadline = match.schedule?.deadline
  const isDeadlinePassed = deadline && new Date(deadline) < new Date()

  // Calculate time until deadline
  const getDeadlineInfo = () => {
    if (!deadline) return null
    
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffMs = deadlineDate - now
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMs < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} days`, status: 'overdue' }
    } else if (diffDays === 0) {
      return { text: `${diffHours} hours left`, status: 'critical' }
    } else if (diffDays <= 2) {
      return { text: `${diffDays} days left`, status: 'warning' }
    } else {
      return { text: `${diffDays} days left`, status: 'ok' }
    }
  }

  const deadlineInfo = getDeadlineInfo()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Match Schedule</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-parque-purple hover:underline"
          >
            {isScheduled ? 'Edit Schedule' : 'Set Schedule'}
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          {/* Deadline Info */}
          <div className={`rounded-lg p-4 ${
            isDeadlinePassed ? 'bg-red-50 border border-red-200' :
            deadlineInfo?.status === 'critical' ? 'bg-orange-50 border border-orange-200' :
            deadlineInfo?.status === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className={`w-5 h-5 mr-2 ${
                  isDeadlinePassed ? 'text-red-500' :
                  deadlineInfo?.status === 'critical' ? 'text-orange-500' :
                  deadlineInfo?.status === 'warning' ? 'text-yellow-600' :
                  'text-gray-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Deadline</p>
                  {deadline ? (
                    <p className="text-sm text-gray-600">
                      {new Date(deadline).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No deadline set</p>
                  )}
                </div>
              </div>
              {deadlineInfo && (
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  isDeadlinePassed ? 'bg-red-100 text-red-800' :
                  deadlineInfo.status === 'critical' ? 'bg-orange-100 text-orange-800' :
                  deadlineInfo.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {deadlineInfo.text}
                </span>
              )}
            </div>
          </div>

          {/* Schedule Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            {isScheduled ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-parque-purple/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(match.schedule.confirmedDate).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-parque-purple/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(match.schedule.confirmedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-parque-purple/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Venue</p>
                  <p className="font-semibold text-gray-900">
                    {match.schedule?.club || 'Not specified'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-parque-purple/10 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Court</p>
                  <p className="font-semibold text-gray-900">
                    {match.schedule?.court || 'Not assigned'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">No schedule set</p>
                <p className="text-sm text-gray-500">Click &quot;Set Schedule&quot; to add date, time, venue and court</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Deadline Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Match Deadline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline Date
                </label>
                <input
                  type="date"
                  value={scheduleForm.deadlineDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, deadlineDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline Time
                </label>
                <input
                  type="time"
                  value={scheduleForm.deadlineTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, deadlineTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Players must schedule their match before this deadline. Default is end of day (23:59).
            </p>
          </div>

          {/* Schedule Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Confirmed Schedule (optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue / Club
                </label>
                <input
                  type="text"
                  value={scheduleForm.venue}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                  placeholder="e.g., Tennis Club Sotogrande"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court
                </label>
                <input
                  type="text"
                  value={scheduleForm.court}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, court: e.target.value })}
                  placeholder="e.g., Court 1, Center Court"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
