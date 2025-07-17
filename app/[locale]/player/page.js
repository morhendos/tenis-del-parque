// app/[locale]/player/page.js
// Redirects to player dashboard
import { redirect } from 'next/navigation'

export default function PlayerPage({ params }) {
  const { locale } = params
  redirect(`/${locale}/player/dashboard`)
}
