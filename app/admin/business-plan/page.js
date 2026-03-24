'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with recharts
const BusinessPlan = dynamic(
  () => import('@/components/admin/BusinessPlan'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-parque-purple"></div>
          <p className="mt-2 text-gray-600">Loading Business Plan...</p>
        </div>
      </div>
    )
  }
)

export default function BusinessPlanPage() {
  return <BusinessPlan />
}
