'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Users, CreditCard, TrendingUp, Check, X, Copy, Trash2, Plus, ChevronLeft } from 'lucide-react'

export default function DiscountManagementPage() {
  const { id } = useParams()
  const router = useRouter()
  const [league, setLeague] = useState(null)
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    discountPercentage: 100,
    description: 'Summer 2025 Launch Promotion',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUses: '',
    isActive: true
  })

  const fetchLeagueData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/leagues/${id}/discounts`)
      const data = await res.json()
      
      if (data.success) {
        setLeague(data.league)
        setDiscounts(data.league.discountCodes || [])
      } else {
        setError(data.error || 'Failed to fetch league data')
      }
    } catch (error) {
      console.error('Error fetching league:', error)
      setError('Failed to fetch league data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch league and discounts
  useEffect(() => {
    fetchLeagueData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleAddDiscount = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    
    try {
      const res = await fetch(`/api/admin/leagues/${id}/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDiscount,
          maxUses: newDiscount.maxUses === '' ? null : parseInt(newDiscount.maxUses)
        })
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setSuccessMessage('Discount code created successfully!')
        await fetchLeagueData()
        setShowAddForm(false)
        setNewDiscount({
          code: '',
          discountPercentage: 100,
          description: 'Summer 2025 Launch Promotion',
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          maxUses: '',
          isActive: true
        })
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(data.error || 'Failed to create discount code')
      }
    } catch (error) {
      console.error('Error adding discount:', error)
      setError('Failed to create discount code')
    }
  }

  const toggleDiscountStatus = async (discountCode) => {
    setError(null)
    setSuccessMessage(null)
    
    try {
      const res = await fetch(`/api/admin/leagues/${id}/discounts/${discountCode}`, {
        method: 'PATCH'
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setSuccessMessage(data.message)
        await fetchLeagueData()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(data.error || 'Failed to toggle discount')
      }
    } catch (error) {
      console.error('Error toggling discount:', error)
      setError('Failed to toggle discount')
    }
  }

  const deleteDiscount = async (discountCode) => {
    if (!confirm('Are you sure you want to delete this discount code? This action cannot be undone.')) {
      return
    }
    
    setError(null)
    setSuccessMessage(null)
    
    try {
      const res = await fetch(`/api/admin/leagues/${id}/discounts/${discountCode}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setSuccessMessage('Discount code deleted successfully!')
        await fetchLeagueData()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(data.error || 'Failed to delete discount')
      }
    } catch (error) {
      console.error('Error deleting discount:', error)
      setError('Failed to delete discount')
    }
  }

  const getShareableLink = (code) => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'
    return `${baseUrl}/signup/${league?.slug}?discount=${code}`
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSuccessMessage('Link copied to clipboard!')
    setTimeout(() => setSuccessMessage(null), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading discount codes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/admin/leagues/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to League
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discount Codes</h1>
            <p className="text-gray-600 mt-2">{league?.name}</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Discount Code
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <Check className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <X className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Add Discount Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Create New Discount Code</h2>
          <form onSubmit={handleAddDiscount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="SUMMER2025"
                  required
                  maxLength={20}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newDiscount.discountPercentage}
                  onChange={(e) => setNewDiscount({...newDiscount, discountPercentage: parseInt(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  min="0"
                  max="100"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newDiscount.description}
                  onChange={(e) => setNewDiscount({...newDiscount, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Summer 2025 Launch Promotion"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newDiscount.validFrom}
                  onChange={(e) => setNewDiscount({...newDiscount, validFrom: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newDiscount.validUntil}
                  onChange={(e) => setNewDiscount({...newDiscount, validUntil: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Uses (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  value={newDiscount.maxUses}
                  onChange={(e) => setNewDiscount({...newDiscount, maxUses: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  min="1"
                  placeholder="Unlimited"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newDiscount.isActive}
                  onChange={(e) => setNewDiscount({...newDiscount, isActive: e.target.checked})}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active immediately
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discount Codes List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active Discount Codes</h2>
          
          {discounts.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No discount codes created yet</p>
              <p className="text-gray-400 text-sm mt-2">Click &ldquo;Add Discount Code&rdquo; to create your first promotional code</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discounts.map((discount) => (
                <div key={discount.code} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl font-bold font-mono text-gray-900">{discount.code}</span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          discount.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {discount.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                          {discount.discountPercentage}% OFF
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{discount.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-500">Valid until</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(discount.validUntil).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-500">Used</p>
                            <p className="font-semibold text-gray-900">
                              {discount.usedCount || 0}
                              {discount.maxUses ? ` / ${discount.maxUses}` : ' times'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-500">Discount</p>
                            <p className="font-semibold text-gray-900">{discount.discountPercentage}%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-500">Created</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(discount.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => toggleDiscountStatus(discount.code)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          discount.isActive 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {discount.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button
                        onClick={() => deleteDiscount(discount.code)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Shareable Link */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Shareable Registration Link:</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={getShareableLink(discount.code)}
                        readOnly
                        className="flex-1 p-2 bg-white border border-gray-300 rounded text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(getShareableLink(discount.code))}
                        className="px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  {/* Usage Details - Show if code has been used */}
                  {discount.usedBy && discount.usedBy.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <details className="cursor-pointer">
                        <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                          View {discount.usedBy.length} registration{discount.usedBy.length !== 1 ? 's' : ''} with this code
                        </summary>
                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                          {discount.usedBy.slice(0, 10).map((usage, idx) => (
                            <div key={idx} className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100">
                              <span className="font-medium">{usage.email}</span>
                              {' • '}
                              <span className="text-gray-500">
                                {new Date(usage.usedAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {discount.usedBy.length > 10 && (
                            <p className="text-xs text-gray-500 italic">
                              ...and {discount.usedBy.length - 10} more
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Stats */}
      {discounts.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Codes</p>
                <p className="text-2xl font-bold text-gray-900">{discounts.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Codes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {discounts.filter(d => d.isActive).length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Uses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {discounts.reduce((sum, d) => sum + (d.usedCount || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
