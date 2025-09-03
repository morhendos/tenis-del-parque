'use client'

import { useParams, redirect } from 'next/navigation'
import CitySignupPageContent from '@/components/pages/CitySignupPageContent'

export default function CitySignupPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  
  // If locale is not Spanish, redirect to English route
  if (locale !== 'es') {
    redirect(`/en/signup/${params.ciudad}`)
  }
  
  return <CitySignupPageContent locale={locale} />
}
