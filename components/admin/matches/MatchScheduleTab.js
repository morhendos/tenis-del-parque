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
        court: match.schedule?.court || ''
      }
    }
    return { date: '', time: '', court: '' }
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
        court: scheduleForm.court
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
        court: match.schedule?.court || ''
      })
    } else {
      setScheduleForm({ date: '', time: '', court: '' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Match Schedule</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-parque-purple hover:underline"
          >
            Edit Schedule
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">📅</div>
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="font-semibold text-gray-900">
                {match.schedule?.confirmedDate
                  ? new Date(match.schedule.confirmedDate).toLocaleDateString()
                  : 'To be determined'}
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">⏰</div>
              <p className="text-sm text-gray-600 mb-1">Time</p>
              <p className="font-semibold text-gray-900">
                {match.schedule?.confirmedDate
                  ? new Date(match.schedule.confirmedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'To be determined'}
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🎾</div>
              <p className="text-sm text-gray-600 mb-1">Court</p>
              <p className="font-semibold text-gray-900">
                {match.schedule?.court || 'To be assigned'}
              </p>
            </div>
          </div>
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
          <div className="flex justify-end space-x-3">
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
