'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { captureAttribution } from '@/lib/utils/attribution'
import { storeDiscountCode } from '@/lib/utils/discountCode'

export default function AttributionTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    captureAttribution()
    const code = searchParams.get('code')
    if (code) storeDiscountCode(code)
  }, [pathname, searchParams])

  return null
}
