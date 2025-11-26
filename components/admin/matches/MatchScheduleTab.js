import React, { useState } from 'react'

export default function MatchScheduleTab({ match, onScheduleUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [scheduleForm, setScheduleForm] = useState(() => {
    const scheduleDate = match.schedule?.confirmedDate
    if (scheduleDate) {
      const date = new Date(scheduleDate)
      return {
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().slice(0, 5),
        venue: match.schedule?.club || '',
        court: match.schedule?.court || ''
      }
    }
    return { date: '', time: '', venue: '', court: '' }
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const scheduledDate = scheduleForm.date && scheduleForm.time 
        ? new Date(`${scheduleForm.date}T${scheduleForm.time}`)
        : null

      await onScheduleUpdate({
        confirmedDate: scheduledDate,
        club: scheduleForm.venue,
        court: scheduleForm.court,
        time: scheduleForm.time
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
    if (scheduleDate) {
      const date = new Date(scheduleDate)
      setScheduleForm({
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().slice(0, 5),
        venue: match.schedule?.club || '',
        court: match.schedule?.court || ''
      })
    } else {
      setScheduleForm({ date: '', time: '', venue: '', court: '' })
    }
  }

  const isScheduled = match.schedule?.confirmedDate

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
      ) : (
        <div className="space-y-4">
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
