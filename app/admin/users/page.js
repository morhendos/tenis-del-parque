'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  
  const router = useRouter()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        role: filters.role !== 'all' ? filters.role : '',
        status: filters.status !== 'all' ? filters.status : ''
      })
      
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Error loading users')
    } finally {
      setLoading(false)
    }
  }, [filters.role, filters.status])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreateAdmin = () => {
    setShowCreateModal(true)
  }

  const handleInvitePlayers = () => {
    setShowInviteModal(true)
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      
      if (!res.ok) throw new Error('Failed to update user')
      
      // Refresh users list
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user status')
    }
  }

  const handleResetPassword = async (userId, email) => {
    if (!confirm(`Send password reset email to ${email}?`)) return
    
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST'
      })
      
      if (!res.ok) throw new Error('Failed to send reset email')
      
      alert('Password reset email sent successfully')
    } catch (error) {
      console.error('Error resetting password:', error)
      setError('Failed to send password reset email')
    }
  }

  const getStatusBadgeClass = (user) => {
    if (!user.isActive) return 'bg-red-100 text-red-800'
    if (!user.emailVerified) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (user) => {
    if (!user.isActive) return 'Inactive'
    if (!user.emailVerified) return 'Unverified'
    return 'Active'
  }

  const filteredUsers = users.filter(user => {
    if (filters.role !== 'all' && user.role !== filters.role) return false
    if (filters.status !== 'all') {
      if (filters.status === 'active' && (!user.isActive || !user.emailVerified)) return false
      if (filters.status === 'inactive' && user.isActive) return false
      if (filters.status === 'unverified' && user.emailVerified) return false
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!user.email.toLowerCase().includes(searchLower) && 
          !user.player?.name?.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage admin users and player accounts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleInvitePlayers}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Invite Players
          </button>
          <button
            onClick={handleCreateAdmin}
            className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
          >
            + Create Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by email or name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="player">Player</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Linked Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(user)}`}>
                    {getStatusText(user)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.player ? (
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{user.player.name}</div>
                      <div className="text-gray-500">{user.player.level}</div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      className={`text-sm ${
                        user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {user.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleResetPassword(user._id, user.email)}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Reset Password
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchUsers()
          }}
        />
      )}

      {/* Invite Players Modal */}
      {showInviteModal && (
        <InvitePlayersModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false)
            fetchUsers()
          }}
        />
      )}
    </div>
  )
}

// Create Admin Modal Component
function CreateAdminModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: 'admin'
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create admin')
      }

      onSuccess()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create Admin User</h3>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Invite Players Modal Component
function InvitePlayersModal({ onClose, onSuccess }) {
  const [players, setPlayers] = useState([])
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('select') // 'select' or 'results'
  const [invitationResults, setInvitationResults] = useState(null)

  useEffect(() => {
    fetchPlayersWithoutUsers()
  }, [])

  const fetchPlayersWithoutUsers = async () => {
    try {
      // First, let's see all players to debug
      console.log('Fetching players...')
      const allPlayersRes = await fetch('/api/admin/players')
      if (allPlayersRes.ok) {
        const allPlayersData = await allPlayersRes.json()
        console.log('All players in database:', allPlayersData.players)
        console.log('Total players found:', allPlayersData.players?.length || 0)
        
        // Show status breakdown
        const statusCounts = {}
        const userCounts = { hasUser: 0, noUser: 0 }
        allPlayersData.players?.forEach(player => {
          statusCounts[player.status] = (statusCounts[player.status] || 0) + 1
          if (player.userId) {
            userCounts.hasUser++
          } else {
            userCounts.noUser++
          }
        })
        console.log('Status breakdown:', statusCounts)
        console.log('User account breakdown:', userCounts)
      }
      
      // Include active, confirmed, and pending players who don't have user accounts
      const res = await fetch('/api/admin/players?hasUser=false&status=pending,confirmed,active')
      if (!res.ok) throw new Error('Failed to fetch players')
      
      const data = await res.json()
      console.log('Players without users (filtered):', data.players) // Debug log
      setPlayers(data.players || [])
    } catch (error) {
      setError('Failed to load players')
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvitations = async () => {
    if (selectedPlayers.length === 0) return

    try {
      setSending(true)
      setError('')
      
      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds: selectedPlayers })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invitations')
      }

      // Show WhatsApp links instead of just alert
      setInvitationResults(data)
      setStep('results')
    } catch (error) {
      setError(error.message)
    } finally {
      setSending(false)
    }
  }

  const togglePlayer = (playerId) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const selectAll = () => {
    setSelectedPlayers(players.map(p => p._id))
  }

  const selectNone = () => {
    setSelectedPlayers([])
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <h3 className="text-lg font-semibold mb-4">
          {step === 'select' ? 'Invite Players' : '📱 WhatsApp Invitations Ready'}
        </h3>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        {step === 'results' && invitationResults ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Successfully created {invitationResults.sent} user accounts!
              </p>
              <p className="text-green-600 text-sm mt-1">
                Click the WhatsApp buttons below to send activation links to players.
              </p>
            </div>

            <div className="space-y-3">
              {invitationResults.invitations?.map((invitation) => (
                <div key={invitation.playerId} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{invitation.playerName}</h4>
                      <p className="text-sm text-gray-600">{invitation.email}</p>
                      <p className="text-sm text-gray-600">📱 {invitation.whatsapp}</p>
                    </div>
                    <a
                      href={invitation.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span>Send WhatsApp</span>
                    </a>
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p className="font-medium text-yellow-800">Development Mode:</p>
                      <p className="text-yellow-700 mt-1">Direct link: {invitation.activationLink}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  setStep('select')
                  setInvitationResults(null)
                  setSelectedPlayers([])
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                ← Back to Selection
              </button>
              <button
                onClick={() => {
                  onSuccess()
                  onClose()
                }}
                className="px-4 py-2 bg-parque-purple text-white rounded-lg hover:bg-opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        ) : step === 'select' && loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-600">Loading players...</div>
          </div>
        ) : step === 'select' ? (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Select players to send WhatsApp invitations
              </p>
              <div className="space-x-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-parque-purple hover:underline"
                >
                  Select All
                </button>
                <button
                  onClick={selectNone}
                  className="text-sm text-parque-purple hover:underline"
                >
                  Select None
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 border rounded-lg">
              {players.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No players without user accounts found
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={selectedPlayers.length === players.length}
                          onChange={(e) => e.target.checked ? selectAll() : selectNone()}
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        League
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {players.map((player) => (
                      <tr key={player._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedPlayers.includes(player._id)}
                            onChange={() => togglePlayer(player._id)}
                          />
                        </td>
                        <td className="px-4 py-2 text-sm">{player.name}</td>
                        <td className="px-4 py-2 text-sm">{player.email}</td>
                        <td className="px-4 py-2 text-sm">{player.league?.name || '-'}</td>
                        <td className="px-4 py-2 text-sm capitalize">{player.level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {selectedPlayers.length} players selected
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvitations}
                  disabled={sending || selectedPlayers.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : `Send ${selectedPlayers.length} Invitations`}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
