'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const login = async (email, password) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    
    if (result?.error) {
      throw new Error(result.error)
    }
    
    // Refresh the page to update session
    router.refresh()
    return result
  }
  
  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }
  
  return {
    user: session?.user,
    isAdmin: session?.user?.role === 'admin',
    isPlayer: session?.user?.role === 'player',
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    logout,
    session
  }
}