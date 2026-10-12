'use client'

import { useParams } from 'next/navigation'
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader'

export default function PlayerLoading() {
  const params = useParams()
  const locale = params?.locale || 'es'
  return <TennisPreloaderInline text={locale === 'es' ? 'Cargando...' : 'Loading...'} locale={locale} />
}
