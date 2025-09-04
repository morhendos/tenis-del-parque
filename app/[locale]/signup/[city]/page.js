'use client'

import { useParams } from 'next/navigation'
import CitySignupPageContent from '@/components/pages/CitySignupPageContent'

export default function CitySignupPage() {
  const params = useParams()
  const locale = params.locale || 'en'
  
  // Get city parameter - works for both [city] and [ciudad] parameter names
  const city = params.city || params.ciudad
  
  return <CitySignupPageContent locale={locale} city={city} />
}
