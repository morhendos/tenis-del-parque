'use client'

import { useEffect } from 'react'
import NextTopLoader from 'nextjs-toploader'

export default function TapFeedback() {
  useEffect(() => {
    const noop = () => {}
    document.addEventListener('touchstart', noop, { passive: true })
    return () => document.removeEventListener('touchstart', noop)
  }, [])

  return <NextTopLoader color="#8FBF60" height={3} showSpinner={false} shadow={false} zIndex={9999} />
}
