import { redirect } from 'next/navigation'

export default function PlayerPage({ params }) {
  const locale = params.locale || 'es'
  // Redirect to player dashboard
  redirect(`/${locale}/player/dashboard`)
}