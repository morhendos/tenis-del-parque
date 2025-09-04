'use client'

import { useParams } from 'next/navigation'
import RulesPageContent from '../../../components/pages/RulesPageContent'

export default function RulesPage() {
  const params = useParams()
  const locale = params.locale || 'en'
  
  return <RulesPageContent locale={locale} />
}