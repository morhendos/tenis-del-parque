'use client'

import { useState, useEffect } from 'react'

export default function WaitlistAdminPage() {
  const [interests, setInterests] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchInterests()
  }, [selectedCity, selectedStatus])

  const fetchInterests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCity !== 'all') params.set('city', selectedCity)
      if (selectedStatus !== 'all') params.set('status', selectedStatus)
      
      const response = await fetch(`/api/admin/league-interest?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setInterests(data.interests || [])
      setSummary(data.summary || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch('/api/admin/league-interest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      
      if (!response.ok) throw new Error('Failed to update')
      
      fetchInterests()
    } catch (err) {
      alert('Error updating status')
    }
  }

  const deleteInterest = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    
    try {
      const response = await fetch(`/api/admin/league-interest?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete')
      
      fetchInterests()
    } catch (err) {
      alert('Error deleting entry')
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'contacted': return 'bg-blue-100 text-blue-800'
      case 'converted': return 'bg-green-100 text-green-800'
      case 'unsubscribed': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  // Get unique cities from interests for filter
  const cities = [...new Set(interests.map(i => i.city))].sort()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">League Interest Waitlist</h1>
        <p className="text-gray-600">People interested in leagues in cities where we don&apos;t operate yet</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {summary.map((city) => (
          <div
            key={city._id}
            onClick={() => setSelectedCity(city._id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedCity === city._id 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="text-2xl font-bold text-purple-600">{city.count}</div>
            <div className="text-sm text-gray-600 capitalize">{city.cityDisplayName || city._id}</div>
          </div>
        ))}
        {summary.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-500 py-8">
            No waitlist signups yet
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>

        <button
          onClick={() => { setSelectedCity('all'); setSelectedStatus('all'); }}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          Clear filters
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">City</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {interests.map((interest) => (
                <tr key={interest._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{interest.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <a href={`mailto:${interest.email}`} className="text-purple-600 hover:underline">
                      {interest.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {interest.phone ? (
                      <a href={`tel:${interest.phone}`} className="text-purple-600 hover:underline">
                        {interest.phone}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{interest.cityDisplayName || interest.city}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{interest.skillLevel}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interest.status)}`}>
                      {interest.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(interest.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <select
                        value={interest.status}
                        onChange={(e) => updateStatus(interest._id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-200 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="unsubscribed">Unsubscribed</option>
                      </select>
                      <button
                        onClick={() => deleteInterest(interest._id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {interests.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                    No entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Export hint */}
      <div className="mt-6 text-sm text-gray-500">
        Total entries: {interests.length} | 
        Use filters to narrow down, then export via browser dev tools or add CSV export feature
      </div>
    </div>
  )
}
