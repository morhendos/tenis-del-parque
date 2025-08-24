'use client'

import { use } from 'react'
import CityEditor from '@/components/admin/cities/CityEditor'

export default function EditCityPage({ params }) {
  const { id } = use(params)
  return <CityEditor cityId={id} />
}