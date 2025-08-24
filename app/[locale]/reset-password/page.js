'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import { resetPasswordContent } from '@/lib/content/passwordResetContent'

function ResetPasswordContent() {
  const { locale } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = resetPasswordContent[locale]
  
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(true)

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      setIsTokenValid(false)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Client-side validation
    if (!password) {
      setError(t.form.errors.passwordRequired)
      setIsLoading(false)
      return
    }

    if (!confirmPassword) {
      setError(t.form.errors.confirmPasswordRequired)
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError(t.form.errors.passwordTooShort)
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError(t.form.errors.passwordsMismatch)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password,
          confirmPassword
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.includes('Invalid or expired')) {
          setIsTokenValid(false)
        } else {
          setError(data.error || t.form.errors.generic)
        }
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err.message || t.form.errors.connection)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginRedirect = () => {
    router.push(`/${locale}/login`)
  }

  // Invalid token view
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t.invalidToken.title}
              </h1>
              
              <p className="text-gray-600 mb-8">
                {t.invalidToken.message}
              </p>
              
              <div className="space-y-4">
                <Link
                  href={`/${locale}/forgot-password`}
                  className="block w-full bg-parque-purple text-white py-3 px-4 rounded-lg font-medium hover:bg-parque-purple/90 transition-colors text-center"
                >
                  {t.invalidToken.requestNew}
                </Link>
                
                <Link
                  href={`/${locale}/login`}
                  className="block w-full text-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t.backToLogin}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success view
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-parque-green" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t.success.title}
              </h1>
              
              <p className="text-gray-600 mb-8">
                {t.success.message}
              </p>
              
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-parque-purple text-white py-3 px-4 rounded-lg font-medium hover:bg-parque-purple/90 transition-colors"
              >
                {t.success.loginButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
              <Lock className="h-8 w-8 text-parque-purple" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t.title}
            </h1>
            
            <p className="text-gray-600">
              {t.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.form.passwordPlaceholder}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-parque-purple transition-colors"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.confirmPasswordLabel}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.form.confirmPasswordPlaceholder}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-parque-purple transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-parque-purple text-white py-3 px-4 rounded-lg font-medium hover:bg-parque-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t.form.submitting : t.form.submit}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading component for suspense fallback
function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
              <Lock className="h-8 w-8 text-parque-purple animate-pulse" />
            </div>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  )
}