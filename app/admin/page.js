'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminIndex() {
  const router = useRouter()

  useEffect(() => {
    // Check if authenticated
    fetch('/api/admin/auth/check')
      .then(res => {
        if (res.ok) {
          // If authenticated, go to dashboard
          router.push('/admin/dashboard')
        } else {
          // If not authenticated, go to login page
          router.push('/login')
        }
      })
      .catch(() => {
        // On error, go to login page
        router.push('/login')
      })
  }, [router])

  // Show loading state while checking auth
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
