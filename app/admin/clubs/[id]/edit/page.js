'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClubEditor from '@/components/admin/clubs/ClubEditor'
import Link from 'next/link'

export default function EditClubPage({ params }) {
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchClub()
  }, [params.id])

  const fetchClub = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/clubs/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch club')
      
      const data = await response.json()
      setClub(data.club)
    } catch (err) {
      console.error('Error fetching club:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (updatedClub) => {
    router.push('/admin/clubs')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading club...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Link 
            href="/admin/clubs"
            className="text-parque-purple hover:underline"
          >
            ← Back to clubs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/clubs"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Edit Club: {club?.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <ClubEditor 
        club={club} 
        onSuccess={handleSuccess}
        onCancel={() => router.push('/admin/clubs')}
      />
    </div>
  )
}