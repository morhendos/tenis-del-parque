'use client'

import Link from 'next/link'
import { Info } from 'lucide-react'

export default function EloInfoLink({ locale = 'es', variant = 'text', className = '' }) {
  const href = `/${locale}/player/elo`
  const label = locale === 'es' ? '¿Qué es el ELO?' : 'What is ELO?'

  if (variant === 'icon') {
    return (
      <Link
        href={href}
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center justify-center align-middle opacity-80 hover:opacity-100 ${className}`}
      >
        <Info className="w-3.5 h-3.5" />
      </Link>
    )
  }

  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 text-xs font-medium text-parque-purple hover:underline ${className}`}
    >
      <Info className="w-3.5 h-3.5" />
      {label}
    </Link>
  )
}
