'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

export function usePlayerProfileHref() {
  const params = useParams()
  const pathname = usePathname() || ''
  const locale = params?.locale || 'es'
  const inPlayerArea = pathname.startsWith(`/${locale}/player`)
  return (id) => (inPlayerArea && id ? `/${locale}/player/players/${id}` : null)
}

export default function PlayerLink({ playerId, className = '', stretch = false, children }) {
  const hrefFor = usePlayerProfileHref()
  const href = hrefFor(playerId)
  if (!href) return <span className={className}>{children}</span>
  return (
    <Link href={href} onClick={(e) => e.stopPropagation()} className={`hover:underline underline-offset-2 ${stretch ? "after:content-[''] after:absolute after:inset-0" : ''} ${className}`}>
      {children}
    </Link>
  )
}
