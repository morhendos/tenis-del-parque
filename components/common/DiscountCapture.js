'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { captureDiscountFromUrl } from '@/lib/utils/discountCode'

/**
 * Component that captures discount codes from URL and stores them in sessionStorage
 * Add this to any page layout or component where discount codes should be captured
 */
export default function DiscountCapture({ leagueSlug = null }) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const discount = searchParams.get('discount')
    if (discount) {
      captureDiscountFromUrl(searchParams, leagueSlug)
    }
  }, [searchParams, leagueSlug])
  
  // This component doesn't render anything
  return null
}
