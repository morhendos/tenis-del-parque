import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import { requireAdmin } from '@/lib/auth/apiAuth'
import { getMessageHistory } from '@/lib/services/notificationService'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/messages
 * 
 * Get message history for admin dashboard
 */
export async function GET(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')

    const messages = await getMessageHistory(Math.min(limit, 100))

    return NextResponse.json({
      success: true,
      messages,
      total: messages.length
    })
  } catch (error) {
    console.error('[Messages API] History error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch message history', details: error.message },
      { status: 500 }
    )
  }
}
