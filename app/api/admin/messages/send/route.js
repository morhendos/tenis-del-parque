import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/apiAuth'
import { sendNotification } from '@/lib/services/notificationService'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/messages/send
 * 
 * Send a message to players via email and/or push notifications.
 * 
 * Body:
 * {
 *   audience: { type: 'all'|'league'|'round_unplayed'|'individual', leagueId?, round?, playerId? },
 *   channels: { email: boolean, push: boolean },
 *   message: { subject: string, body: string, template?: string }
 * }
 */
export async function POST(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { audience, channels, message } = await request.json()

    // Validate
    if (!audience?.type) {
      return NextResponse.json({ error: 'Audience type is required' }, { status: 400 })
    }
    if (!channels?.email && !channels?.push) {
      return NextResponse.json({ error: 'At least one channel must be selected' }, { status: 400 })
    }
    if (!message?.body?.trim()) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
    }
    if (channels.email && !message?.subject?.trim()) {
      return NextResponse.json({ error: 'Subject is required for email' }, { status: 400 })
    }

    const result = await sendNotification({
      audience,
      channels,
      message: {
        subject: message.subject || message.body.substring(0, 60),
        body: message.body,
        template: message.template || 'custom'
      },
      sender: {
        userId: session.user.id,
        name: session.user.name || session.user.email
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Messages API] Send error:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    )
  }
}
