'use client'

import { useParams, redirect } from 'next/navigation'
import RulesPageContent from '../reglas/RulesPageContent'

export default function RulesPage() {
  const params = useParams()
  const locale = params.locale || 'en'
  
  // If locale is not English, redirect to Spanish rules
  if (locale !== 'en') {
    redirect(`/es/reglas`)
  }
  
  return <RulesPageContent locale={locale} />
}