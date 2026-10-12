import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import LeaguePost from '@/lib/models/LeaguePost'
import { requirePlayer } from '@/lib/auth/apiAuth'
import { getViewer, canAccessLeague } from '@/lib/services/leagueFeedService'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { player } = await getViewer(session)
    const post = await LeaguePost.findById(params.id).select('league deletedAt reports').lean()
    if (!post || post.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!player || !canAccessLeague(player, post.league)) {
      return NextResponse.json({ error: 'Not in this league' }, { status: 403 })
    }
    if (!(post.reports || []).some(r => String(r.player) === String(player._id))) {
      await LeaguePost.updateOne({ _id: params.id }, { $push: { reports: { player: player._id, at: new Date() } } })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Community report error:', err)
    return NextResponse.json({ error: 'Failed to report' }, { status: 500 })
  }
}
