'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'

export default function PlayerProfile() {
  const [player, setPlayer] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const params = useParams()
  const pathname = usePathname()
  const locale = params.locale || 'es'
  const language = locale
  
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

  const fetchProfile = useCallback(async () => {
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
      
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

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

      // Check if language is changing
      const isLanguageChanging = user?.preferences?.language !== formData.preferences.language

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
      
      // If language changed, redirect to the new locale
      if (isLanguageChanging) {
        const newLocale = formData.preferences.language
        
        // Get the current path without locale
        const pathWithoutLocale = pathname.replace(`/${locale}`, '')
        const newPath = `/${newLocale}${pathWithoutLocale}`
        
        // Show success message briefly
        setSuccess(newLocale === 'es' ? '¡Perfil actualizado! Cambiando idioma...' : 'Profile updated! Changing language...')
        
        // Use window.location for a full page navigation to ensure URL updates
        setTimeout(() => {
          window.location.href = newPath
        }, 500)
      } else {
        // No language change, just show success
        setSuccess(language === 'es' ? '¡Perfil actualizado!' : 'Profile updated!')
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      }
      
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
      <TennisPreloaderInline 
        text={language === 'es' ? 'Cargando perfil...' : 'Loading profile...'}
        locale={language}
      />
    )
  }

  if (error && !player) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <svg className="w-10 h-10 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 font-medium">{error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
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

  // Extract league name properly
  const leagueName = player?.league?.name || (language === 'es' ? 'Sin Liga' : 'No League')

  return (
    <div className="space-y-4">
      {/* Hero Header - Compact Mobile Style */}
      <div className="bg-gradient-to-r from-parque-purple via-purple-600 to-indigo-600 rounded-xl shadow-lg overflow-hidden relative">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 p-4 sm:p-6 text-white">
          {/* Top row: Avatar, Name, Edit button */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <span className="text-2xl sm:text-3xl font-bold">
                  {player?.name ? player.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">
                  {player?.name || (language === 'es' ? 'Tu Perfil' : 'Your Profile')}
                </h1>
                <p className="text-purple-200 text-xs sm:text-sm">
                  {leagueName} • {player?.season || (language === 'es' ? 'Sin Temporada' : 'No Season')}
                </p>
              </div>
            </div>
            
            {/* Edit/Save buttons */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-2 bg-green-500 rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg sm:text-xl font-bold">{player?.stats?.eloRating || 1200}</div>
              <div className="text-[10px] sm:text-xs text-purple-200">ELO</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg sm:text-xl font-bold">{player?.stats?.matchesPlayed || 0}</div>
              <div className="text-[10px] sm:text-xs text-purple-200">{language === 'es' ? 'Partidos' : 'Matches'}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg sm:text-xl font-bold">{player?.stats?.matchesWon || 0}</div>
              <div className="text-[10px] sm:text-xs text-purple-200">{language === 'es' ? 'Victorias' : 'Wins'}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg sm:text-xl font-bold">{winRate}%</div>
              <div className="text-[10px] sm:text-xs text-purple-200">{language === 'es' ? '% Victorias' : 'Win %'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages - Compact */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-800 text-sm font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800 text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Personal Information - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="font-semibold text-gray-900 text-sm">
            {language === 'es' ? 'Información Personal' : 'Personal Information'}
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {language === 'es' ? 'Nombre completo' : 'Full Name'}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">
                {player?.name || (language === 'es' ? 'No proporcionado' : 'Not provided')}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {language === 'es' ? 'Correo electrónico' : 'Email'}
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">
                {user?.email || (language === 'es' ? 'No proporcionado' : 'Not provided')}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {language === 'es' ? 'Teléfono' : 'Phone'}
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900">
                {player?.phone || (language === 'es' ? 'No proporcionado' : 'Not provided')}
              </p>
            )}
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {language === 'es' ? 'Idioma' : 'Language'}
            </label>
            {isEditing ? (
              <select
                value={formData.preferences.language}
                onChange={(e) => handleInputChange('preferences.language', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            ) : (
              <p className="text-sm font-medium text-gray-900">
                {user?.preferences?.language === 'es' ? 'Español' : 'English'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notifications - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="font-semibold text-gray-900 text-sm">
            {language === 'es' ? 'Notificaciones' : 'Notifications'}
          </h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {/* General notifications */}
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {language === 'es' ? 'Generales' : 'General'}
            </span>
            {isEditing ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferences.notifications.email}
                  onChange={(e) => handleInputChange('notifications.email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-parque-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-parque-purple"></div>
              </label>
            ) : (
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${user?.preferences?.notifications?.email ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {user?.preferences?.notifications?.email ? (language === 'es' ? 'Activado' : 'On') : (language === 'es' ? 'Desactivado' : 'Off')}
              </span>
            )}
          </div>
          
          {/* Match reminders */}
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {language === 'es' ? 'Recordatorios de partidos' : 'Match reminders'}
            </span>
            {isEditing ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferences.notifications.matchReminders}
                  onChange={(e) => handleInputChange('notifications.matchReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-parque-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-parque-purple"></div>
              </label>
            ) : (
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${user?.preferences?.notifications?.matchReminders ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {user?.preferences?.notifications?.matchReminders ? (language === 'es' ? 'Activado' : 'On') : (language === 'es' ? 'Desactivado' : 'Off')}
              </span>
            )}
          </div>
          
          {/* Result reminders */}
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {language === 'es' ? 'Recordatorios de resultados' : 'Result reminders'}
            </span>
            {isEditing ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preferences.notifications.resultReminders}
                  onChange={(e) => handleInputChange('notifications.resultReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-parque-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-parque-purple"></div>
              </label>
            ) : (
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${user?.preferences?.notifications?.resultReminders ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {user?.preferences?.notifications?.resultReminders ? (language === 'es' ? 'Activado' : 'On') : (language === 'es' ? 'Desactivado' : 'Off')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* League Stats - Compact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="font-semibold text-gray-900 text-sm">
            {language === 'es' ? 'Estadísticas de Liga' : 'League Stats'}
          </h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{player?.stats?.matchesWon || 0}</div>
              <div className="text-[10px] text-gray-500">{language === 'es' ? 'Victorias' : 'Wins'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{player?.stats?.matchesLost || 0}</div>
              <div className="text-[10px] text-gray-500">{language === 'es' ? 'Derrotas' : 'Losses'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{player?.stats?.setsWon || 0}</div>
              <div className="text-[10px] text-gray-500">{language === 'es' ? 'Sets ganados' : 'Sets won'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{player?.stats?.setsLost || 0}</div>
              <div className="text-[10px] text-gray-500">{language === 'es' ? 'Sets perdidos' : 'Sets lost'}</div>
            </div>
          </div>
          
          {/* Additional info */}
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{language === 'es' ? 'Nivel' : 'Level'}</span>
              <span className="font-medium text-gray-900 capitalize">{player?.level || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{language === 'es' ? 'Miembro desde' : 'Member since'}</span>
              <span className="font-medium text-gray-900">
                {player?.createdAt ? new Date(player.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
