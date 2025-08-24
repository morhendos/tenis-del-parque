'use client'

import { useRouter } from 'next/navigation'
import ClubEditor from '@/components/admin/clubs/ClubEditor'
import Link from 'next/link'

export default function NewClubPage() {
  const router = useRouter()

  const handleSuccess = (newClub) => {
    router.push('/admin/clubs')
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
                Add New Club
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <ClubEditor 
        onSuccess={handleSuccess}
        onCancel={() => router.push('/admin/clubs')}
      />
    </div>
  )
}