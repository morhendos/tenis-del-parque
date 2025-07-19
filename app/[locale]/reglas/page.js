'use client'

import { useParams, redirect } from 'next/navigation'
import RulesPageContent from './RulesPageContent'

export default function ReglasPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  
  // If locale is not Spanish, redirect to English rules
  if (locale !== 'es') {
    redirect(`/en/rules`)
  }
  
  return <RulesPageContent locale={locale} />
}