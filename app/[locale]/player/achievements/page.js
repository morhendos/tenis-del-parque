'use client'

import { useParams } from 'next/navigation'
import TrophyRoom from '@/components/player/TrophyRoom'

export default function AchievementsPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const language = locale

  return (
    <div className="max-w-4xl mx-auto">
      <TrophyRoom language={language} locale={locale} compact={false} />
    </div>
  )
}
