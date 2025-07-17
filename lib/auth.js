import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

export async function isPlayer() {
  const user = await getCurrentUser()
  return user?.role === 'player'
}