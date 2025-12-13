'use client'

import { SessionProvider } from 'next-auth/react'
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration'

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ServiceWorkerRegistration />
      {children}
    </SessionProvider>
  )
}
