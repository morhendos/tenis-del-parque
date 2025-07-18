'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
    preferences: {
      notifications: true,
      emailReminders: true
    }
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/player/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      setProfile(data)
      
      if (data.player) {
        setFormData({
          name: data.player.name || '',
          phone: data.player.phone || '',
          emergencyContact: data.player.emergencyContact || '',
          preferences: data.user?.preferences || {
            notifications: true,
            emailReminders: true
          }
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: locale === 'es' ? 'Error al cargar el perfil' : 'Error loading profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/player/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      setProfile(data)
      setEditing(false)
      setMessage({ 
        type: 'success', 
        text: locale === 'es' ? 'Perfil actualizado correctamente' : 'Profile updated successfully' 
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ 
        type: 'error', 
        text: locale === 'es' ? 'Error al actualizar el perfil' : 'Error updating profile' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('preferences.')) {
      const prefName = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefName]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-parque-purple rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">
            {locale === 'es' ? 'Cargando perfil...' : 'Loading profile...'}
          </p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          {locale === 'es' ? 'No se encontró información del perfil' : 'No profile information found'}
        </p>
      </div>
    )
  }

  // Extract league name from the league object
  const leagueName = profile.player?.league?.name || profile.player?.league || '-'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {locale === 'es' ? 'Mi Perfil' : 'My Profile'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {locale === 'es' 
              ? 'Gestiona tu información personal y preferencias'
              : 'Manage your personal information and preferences'}
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors"
          >
            {locale === 'es' ? 'Editar' : 'Edit'}
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Form/Display */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'es' ? 'Información de la Cuenta' : 'Account Information'}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {locale === 'es' ? 'Correo Electrónico' : 'Email'}
                </label>
                <p className="mt-1 text-sm text-gray-900">{profile.user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {locale === 'es' ? 'Liga' : 'League'}
                </label>
                <p className="mt-1 text-sm text-gray-900">{leagueName}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'es' ? 'Información Personal' : 'Personal Information'}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {locale === 'es' ? 'Nombre Completo' : 'Full Name'}
                </label>
                {editing ? (
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-parque-purple focus:border-parque-purple"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{profile.player?.name || '-'}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {locale === 'es' ? 'Teléfono' : 'Phone'}
                </label>
                {editing ? (
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-parque-purple focus:border-parque-purple"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{profile.player?.phone || '-'}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                  {locale === 'es' ? 'Contacto de Emergencia' : 'Emergency Contact'}
                </label>
                {editing ? (
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder={locale === 'es' ? 'Nombre y teléfono' : 'Name and phone'}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-parque-purple focus:border-parque-purple"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{profile.player?.emergencyContact || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'es' ? 'Preferencias' : 'Preferences'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="notifications"
                  name="preferences.notifications"
                  type="checkbox"
                  checked={formData.preferences.notifications}
                  onChange={handleChange}
                  disabled={!editing}
                  className="h-4 w-4 text-parque-purple focus:ring-parque-purple border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                  {locale === 'es' 
                    ? 'Recibir notificaciones de partidos' 
                    : 'Receive match notifications'}
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="emailReminders"
                  name="preferences.emailReminders"
                  type="checkbox"
                  checked={formData.preferences.emailReminders}
                  onChange={handleChange}
                  disabled={!editing}
                  className="h-4 w-4 text-parque-purple focus:ring-parque-purple border-gray-300 rounded"
                />
                <label htmlFor="emailReminders" className="ml-2 block text-sm text-gray-700">
                  {locale === 'es' 
                    ? 'Recibir recordatorios por email' 
                    : 'Receive email reminders'}
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          {editing && (
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  fetchProfile() // Reset form
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-parque-purple/90 transition-colors disabled:opacity-50"
              >
                {saving 
                  ? (locale === 'es' ? 'Guardando...' : 'Saving...')
                  : (locale === 'es' ? 'Guardar Cambios' : 'Save Changes')
                }
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Player Stats */}
      {profile.player && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === 'es' ? 'Estadísticas' : 'Statistics'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-parque-purple">{profile.player.stats?.matchesPlayed || 0}</p>
              <p className="text-sm text-gray-600">
                {locale === 'es' ? 'Partidos Jugados' : 'Matches Played'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{profile.player.stats?.wins || 0}</p>
              <p className="text-sm text-gray-600">
                {locale === 'es' ? 'Victorias' : 'Wins'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{profile.player.stats?.losses || 0}</p>
              <p className="text-sm text-gray-600">
                {locale === 'es' ? 'Derrotas' : 'Losses'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{profile.player.elo || 1500}</p>
              <p className="text-sm text-gray-600">ELO</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
