'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AreasEditorPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the unified areas management page
    router.replace('/admin/areas/map')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-3 text-gray-600">Redirecting to Areas Management...</p>
      </div>
    </div>
  )
}