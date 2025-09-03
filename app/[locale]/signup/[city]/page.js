'use client'

import { useParams, redirect } from 'next/navigation'
import CitySignupPageContent from '@/components/pages/CitySignupPageContent'

export default function CitySignupPage() {
  const params = useParams()
  const locale = params.locale || 'en'
  
  // If locale is not English, redirect to Spanish route
  if (locale !== 'en') {
    redirect(`/es/registro/${params.city}`)
  }
  
  return <CitySignupPageContent locale={locale} />
}
