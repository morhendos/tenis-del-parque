import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import Player from '@/lib/models/Player'
import { requireAdmin } from '@/lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const rows = await Player.aggregate([
      { $unwind: '$registrations' },
      {
        $group: {
          _id: {
            source: { $ifNull: ['$registrations.attribution.source', '(untracked)'] },
            campaign: { $ifNull: ['$registrations.attribution.campaign', ''] }
          },
          registrations: { $sum: 1 },
          paid: {
            $sum: {
              $cond: [
                { $in: ['$registrations.paymentStatus', ['completed', 'waived']] },
                1,
                0
              ]
            }
          },
          lastAt: { $max: '$registrations.registeredAt' }
        }
      },
      {
        $project: {
          _id: 0,
          source: '$_id.source',
          campaign: '$_id.campaign',
          registrations: 1,
          paid: 1,
          lastAt: 1
        }
      },
      { $sort: { registrations: -1 } }
    ])

    return NextResponse.json({ success: true, rows })
  } catch (err) {
    console.error('Attribution stats error:', err)
    return NextResponse.json({ success: false, error: 'Failed to load attribution stats' }, { status: 500 })
  }
}
