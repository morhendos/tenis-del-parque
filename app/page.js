import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect all traffic from root to /sotogrande
  redirect('/sotogrande')
}