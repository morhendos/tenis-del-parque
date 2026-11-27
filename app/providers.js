'use client'

import { SessionProvider } from 'next-auth/react'
import { SWRConfig } from 'swr'
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration'
import { swrOptions } from '@/lib/utils/swrConfig'

export function Providers({ children }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <SWRConfig value={swrOptions}>
        <ServiceWorkerRegistration />
        {children}
      </SWRConfig>
    </SessionProvider>
  )
}
