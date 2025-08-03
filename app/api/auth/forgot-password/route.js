import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import { sendPasswordResetEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    await dbConnect()

    const { email, locale = 'en' } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    })

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists and is active
    if (user && user.isActive) {
      try {
        // Generate reset token
        const resetToken = user.generatePasswordResetToken()
        await user.save()

        // Determine the best language for the user
        // Priority: 1. User's saved preference, 2. Request locale, 3. Default to Spanish
        const userLanguage = user.preferences?.language || locale || 'es'
        
        console.log(`Sending password reset email to ${user.email} in language: ${userLanguage}`)

        // Send password reset email
        const emailResult = await sendPasswordResetEmail(
          user.email, 
          resetToken, 
          userLanguage
        )

        if (!emailResult.success) {
          console.error('Failed to send password reset email:', emailResult.error)
          // Don't expose email sending failure to client for security
        }
      } catch (error) {
        console.error('Error generating reset token or sending email:', error)
        // Don't expose internal errors to client
      }
    } else {
      // Log attempt for inactive/non-existent user for monitoring
      console.log(`Password reset attempted for non-existent or inactive user: ${email}`)
    }

    // Always return success message regardless of whether user exists
    // This prevents email enumeration attacks
    // Use the same locale as the request for the response message
    return NextResponse.json({
      success: true,
      message: locale === 'es' 
        ? 'Si existe una cuenta con este email, recibirás un enlace para restablecer tu contraseña en unos minutos.'
        : 'If an account with this email exists, you will receive a password reset link within a few minutes.'
    })

  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}