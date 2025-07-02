'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PlayerIndex() {
  const router = useRouter()

  useEffect(() => {
    // If we reach this page, user is authenticated (middleware handles auth)
    // Just redirect to dashboard
    router.push('/player/dashboard')
  }, [router])

  // Return null to prevent any flash of content
  return null
}
