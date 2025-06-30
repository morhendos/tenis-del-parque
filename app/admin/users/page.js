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

  useEffect(() => {
    fetchPlayersWithoutUsers()
  }, [])

  const fetchPlayersWithoutUsers = async () => {
    try {
      const res = await fetch('/api/admin/players?hasUser=false&status=confirmed')
      if (!res.ok) throw new Error('Failed to fetch players')
      
      const data = await res.json()
      setPlayers(data.players || [])
    } catch (error) {
      setError('Failed to load players')
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

      alert(`Successfully sent ${data.sent} invitations`)
      onSuccess()
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
        <h3 className="text-lg font-semibold mb-4">Invite Players</h3>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-600">Loading players...</div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Select players to send invitation emails
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
        )}
      </div>
    </div>
  )
}
