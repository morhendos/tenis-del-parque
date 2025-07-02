'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('return') || null

  const checkAuth = useCallback(async () => {
    try {
      // First check if admin
      const adminRes = await fetch('/api/admin/auth/check')
      if (adminRes.ok) {
        router.push('/admin/dashboard')
        return
      }

      // Then check if player
      const playerRes = await fetch('/api/auth/check')
      if (playerRes.ok) {
        router.push('/player/dashboard')
        return
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setChecking(false)
    }
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // First try admin login
      const adminRes = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (adminRes.ok) {
        const data = await adminRes.json()
        // Admin login successful
        router.push(returnUrl || '/admin/dashboard')
        return
      }

      // If admin login failed, try player login
      const playerRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (playerRes.ok) {
        const data = await playerRes.json()
        // Player login successful
        router.push(returnUrl || '/player/dashboard')
        return
      }

      // Both failed
      const errorData = await playerRes.json()
      setError(errorData.error || 'Invalid email or password')
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎾</div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Tennis del Parque - Sotogrande
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-parque-purple focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-parque-purple hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-parque-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/signup/sotogrande" className="font-medium text-parque-purple hover:text-opacity-80">
                Register for the league
              </a>
            </p>
            <p className="text-sm">
              <a href="/forgot-password" className="font-medium text-gray-600 hover:text-gray-800">
                Forgot your password?
              </a>
            </p>
          </div>

          {/* Footer */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                Dev tip: Run <code className="bg-gray-100 px-1 py-0.5 rounded">npm run create-admin</code> to create an admin user
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
