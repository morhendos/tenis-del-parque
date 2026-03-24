import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { sendToPlayer, notificationTemplates } from '@/lib/services/pushNotificationService'

export const dynamic = 'force-dynamic'

/**
 * POST /api/push/test
 * Send a test push notification to the currently logged-in user's devices
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.playerId) {
      return NextResponse.json({ error: 'No player profile linked' }, { status: 400 })
    }

    const result = await sendToPlayer(
      session.user.playerId,
      {
        title: '🎾 Test - Tenis del Parque',
        body: '¡Las notificaciones funcionan! / Notifications are working!',
        tag: 'test',
        url: '/player/dashboard'
      }
    )

    return NextResponse.json({
      success: true,
      ...result,
      message: result.sent > 0 
        ? `Test notification sent to ${result.sent} device(s)` 
        : 'No active subscriptions found for your account'
    })
  } catch (error) {
    console.error('[Push] Test error:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification', details: error.message },
      { status: 500 }
    )
  }
}
