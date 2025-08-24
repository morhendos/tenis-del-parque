'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import { forgotPasswordContent } from '@/lib/content/passwordResetContent'

export default function ForgotPasswordPage() {
  const { locale } = useLocale()
  const router = useRouter()
  const t = forgotPasswordContent[locale]
  
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Client-side validation
    if (!email) {
      setError(t.form.errors.emailRequired)
      setIsLoading(false)
      return
    }

    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      setError(t.form.errors.invalidEmail)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.toLowerCase(),
          locale 
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || t.form.errors.generic)
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err.message || t.form.errors.connection)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    setIsSuccess(false)
    setError('')
  }

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
              
              <p className="text-gray-600 mb-4">
                {t.success.message}
              </p>
              
              <p className="text-sm text-gray-500 mb-8">
                {t.success.checkSpam}
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={handleResend}
                  className="w-full bg-parque-purple text-white py-3 px-4 rounded-lg font-medium hover:bg-parque-purple/90 transition-colors"
                >
                  {t.success.resendLink}
                </button>
                
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-6">
              <Mail className="h-8 w-8 text-parque-purple" />
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.form.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.form.emailPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-parque-purple transition-colors"
                disabled={isLoading}
                autoFocus
              />
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