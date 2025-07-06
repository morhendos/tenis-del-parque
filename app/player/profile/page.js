'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../../lib/hooks/useLanguage'

export default function PlayerProfile() {
  const [player, setPlayer] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const { language, setLanguage: setGlobalLanguage } = useLanguage()
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferences: {
      language: 'es',
      notifications: {
        email: true,
        matchReminders: true,
        resultReminders: true
      }
    }
  })
  
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/player/profile')
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setPlayer(data.player)
      setUser(data.user)
      
      // Populate form data
      setFormData({
        name: data.player.name || '',
        email: data.user.email || '',
        phone: data.player.phone || '',
        preferences: {
          language: data.user.preferences?.language || 'es',
          notifications: {
            email: data.user.preferences?.notifications?.email ?? true,
            matchReminders: data.user.preferences?.notifications?.matchReminders ?? true,
            resultReminders: data.user.preferences?.notifications?.resultReminders ?? true
          }
        }
      })
      
      // Sync with global language state
      if (data.user.preferences?.language) {
        setGlobalLanguage(data.user.preferences.language)
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      if (field.includes('preferences.')) {
        const childField = field.replace('preferences.', '')
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [childField]: value
          }
        }
      } else if (field.includes('notifications.')) {
        const childField = field.replace('notifications.', '')
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            notifications: {
              ...prev.preferences.notifications,
              [childField]: value
            }
          }
        }
      }
      return {
        ...prev,
        [field]: value
      }
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/player/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          preferences: formData.preferences
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const data = await response.json()
      setPlayer(data.player)
      setUser(data.user)
      setIsEditing(false)
      
      // Update global language state when language preference changes
      setGlobalLanguage(formData.preferences.language)
      
      setSuccess(language === 'es' ? '¡Perfil actualizado exitosamente!' : 'Profile updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    if (player && user) {
      setFormData({
        name: player.name || '',
        email: user.email || '',
        phone: player.phone || '',
        preferences: {
          language: user.preferences?.language || 'es',
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            matchReminders: user.preferences?.notifications?.matchReminders ?? true,
            resultReminders: user.preferences?.notifications?.resultReminders ?? true
          }
        }
      })
    }
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-parque-purple mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">
            {language === 'es' ? 'Cargando tu perfil...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    )
  }

  if (error && !player) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 font-medium text-lg">{error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            {language === 'es' ? 'Intentar de nuevo' : 'Try Again'}
          </button>
        </div>
      </div>
    )
  }

  const winRate = player?.stats?.matchesPlayed > 0 
    ? Math.round((player.stats.matchesWon / player.stats.matchesPlayed) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-parque-purple via-purple-600 to-indigo-600 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-10 sm:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-4xl font-bold text-white">
                  {player?.name ? player.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  {player?.name || (language === 'es' ? 'Tu Perfil' : 'Your Profile')}
                </h1>
                <p className="text-purple-100 mt-2 text-lg">
                  {player?.league?.name || (language === 'es' ? 'Sin Liga' : 'No League')} • {player?.season || (language === 'es' ? 'Sin Temporada' : 'No Season')}
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                    <span className="text-lg mr-1">🏆</span>
                    ELO: {player?.stats?.eloRating || 1200}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                    <span className="text-lg mr-1">🎾</span>
                    {player?.stats?.matchesPlayed || 0} {language === 'es' ? 'partidos' : 'matches'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 lg:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-6 py-3 bg-white text-parque-purple rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {language === 'es' ? 'Editar Perfil' : 'Edit Profile'}
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
                  >
                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {language === 'es' ? 'Guardando...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {language === 'es' ? 'Guardar' : 'Save'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <span className="text-green-800 font-medium">{success}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">
                {language === 'es' ? 'Rating ELO' : 'ELO Rating'}
              </p>
              <p className="text-3xl font-bold mt-1">{player?.stats?.eloRating || 1200}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">
                {language === 'es' ? 'Partidos' : 'Matches'}
              </p>
              <p className="text-3xl font-bold mt-1">{player?.stats?.matchesPlayed || 0}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎾</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">
                {language === 'es' ? '% Victorias' : 'Win Rate'}
              </p>
              <p className="text-3xl font-bold mt-1">{winRate}%</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-parque-purple rounded-xl flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === 'es' ? 'Información Personal' : 'Personal Information'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Actualiza tu información de contacto' : 'Update your contact information'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {language === 'es' ? 'Nombre completo' : 'Full Name'}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-all"
                      placeholder={language === 'es' ? 'Ingresa tu nombre completo' : 'Enter your full name'}
                    />
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-900 font-medium">
                        {player?.name || (language === 'es' ? 'No proporcionado' : 'Not provided')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {language === 'es' ? 'Correo electrónico' : 'Email Address'}
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-all"
                      placeholder={language === 'es' ? 'Ingresa tu correo' : 'Enter your email'}
                    />
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-900 font-medium">
                        {user?.email || (language === 'es' ? 'No proporcionado' : 'Not provided')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {language === 'es' ? 'Teléfono' : 'Phone Number'}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-all"
                      placeholder={language === 'es' ? 'Ingresa tu teléfono' : 'Enter your phone number'}
                    />
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-900 font-medium">
                        {player?.phone || (language === 'es' ? 'No proporcionado' : 'Not provided')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {language === 'es' ? 'Idioma preferido' : 'Preferred Language'}
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.preferences.language}
                      onChange={(e) => handleInputChange('preferences.language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent transition-all"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-900 font-medium">
                        {user?.preferences?.language === 'es' ? 'Español' : 'English'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  {language === 'es' ? 'Notificaciones por email' : 'Email Notifications'}
                </label>
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <label className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.preferences.notifications.email}
                          onChange={(e) => handleInputChange('notifications.email', e.target.checked)}
                          className="rounded border-gray-300 text-parque-purple focus:ring-parque-purple w-5 h-5"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {language === 'es' ? 'Notificaciones generales' : 'General notifications'}
                        </span>
                      </label>
                      <label className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.preferences.notifications.matchReminders}
                          onChange={(e) => handleInputChange('notifications.matchReminders', e.target.checked)}
                          className="rounded border-gray-300 text-parque-purple focus:ring-parque-purple w-5 h-5"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {language === 'es' ? 'Recordatorios de partidos' : 'Match reminders'}
                        </span>
                      </label>
                      <label className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.preferences.notifications.resultReminders}
                          onChange={(e) => handleInputChange('notifications.resultReminders', e.target.checked)}
                          className="rounded border-gray-300 text-parque-purple focus:ring-parque-purple w-5 h-5"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {language === 'es' ? 'Recordatorios de resultados' : 'Result reminders'}
                        </span>
                      </label>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'es' ? 'Generales' : 'General'}
                        </span>
                        <span className={`text-sm font-semibold ${user?.preferences?.notifications?.email ? 'text-green-600' : 'text-red-600'}`}>
                          {user?.preferences?.notifications?.email ? 
                            (language === 'es' ? '✓ Activado' : '✓ Enabled') : 
                            (language === 'es' ? '✗ Desactivado' : '✗ Disabled')
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'es' ? 'Recordatorios de partidos' : 'Match reminders'}
                        </span>
                        <span className={`text-sm font-semibold ${user?.preferences?.notifications?.matchReminders ? 'text-green-600' : 'text-red-600'}`}>
                          {user?.preferences?.notifications?.matchReminders ? 
                            (language === 'es' ? '✓ Activado' : '✓ Enabled') : 
                            (language === 'es' ? '✗ Desactivado' : '✗ Disabled')
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'es' ? 'Recordatorios de resultados' : 'Result reminders'}
                        </span>
                        <span className={`text-sm font-semibold ${user?.preferences?.notifications?.resultReminders ? 'text-green-600' : 'text-red-600'}`}>
                          {user?.preferences?.notifications?.resultReminders ? 
                            (language === 'es' ? '✓ Activado' : '✓ Enabled') : 
                            (language === 'es' ? '✗ Desactivado' : '✗ Disabled')
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* League Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-parque-purple rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {language === 'es' ? 'Mi Liga' : 'My League'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'es' ? 'Información de participación' : 'Participation information'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-parque-purple to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎾</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900">
                  {player?.league?.name || (language === 'es' ? 'Sin Liga' : 'No League')}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {player?.season || (language === 'es' ? 'Sin temporada' : 'No season')}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    {language === 'es' ? 'Estadísticas' : 'Statistics'}
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">{player?.stats?.matchesWon || 0}</div>
                      <div className="text-xs text-gray-600">
                        {language === 'es' ? 'Victorias' : 'Wins'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">{player?.stats?.matchesLost || 0}</div>
                      <div className="text-xs text-gray-600">
                        {language === 'es' ? 'Derrotas' : 'Losses'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">{player?.stats?.setsWon || 0}</div>
                      <div className="text-xs text-gray-600">
                        {language === 'es' ? 'Sets ganados' : 'Sets won'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">{player?.stats?.setsLost || 0}</div>
                      <div className="text-xs text-gray-600">
                        {language === 'es' ? 'Sets perdidos' : 'Sets lost'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    {language === 'es' ? 'Información adicional' : 'Additional information'}
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {language === 'es' ? 'Nivel:' : 'Level:'}
                      </span>
                      <span className="font-medium text-gray-900 capitalize">{player?.level || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {language === 'es' ? 'Miembro desde:' : 'Member since:'}
                      </span>
                      <span className="font-medium text-gray-900">
                        {player?.createdAt ? new Date(player.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 