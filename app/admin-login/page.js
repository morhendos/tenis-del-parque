'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Get locale from cookie or default to 'es'
    const locale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] || 'es'
    
    // Redirect to the locale-based login page
    router.push(`/${locale}/login`)
  }, [router])
  
  return null
}