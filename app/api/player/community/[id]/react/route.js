import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import LeaguePost from '@/lib/models/LeaguePost'
import { requirePlayer } from '@/lib/auth/apiAuth'
import { getViewer, canAccessLeague, REACTIONS } from '@/lib/services/leagueFeedService'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error
    const { emoji } = await request.json()
    if (!mongoose.Types.ObjectId.isValid(params.id) || !REACTIONS.includes(emoji)) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }
    const { player } = await getViewer(session)
    const post = await LeaguePost.findById(params.id).select('league deletedAt reactions').lean()
    if (!post || post.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!player || !canAccessLeague(player, post.league)) {
      return NextResponse.json({ error: 'Not in this league' }, { status: 403 })
    }
    const has = (post.reactions || []).some(r => String(r.player) === String(player._id) && r.emoji === emoji)
    const update = has
      ? { $pull: { reactions: { player: player._id, emoji } } }
      : { $push: { reactions: { player: player._id, emoji } } }
    const updated = await LeaguePost.findByIdAndUpdate(params.id, update, { new: true }).select('reactions').lean()
    const reactions = REACTIONS.map(e => ({
      emoji: e,
      count: updated.reactions.filter(r => r.emoji === e).length,
      mine: updated.reactions.some(r => r.emoji === e && String(r.player) === String(player._id))
    }))
    return NextResponse.json({ reactions })
  } catch (err) {
    console.error('Community react error:', err)
    return NextResponse.json({ error: 'Failed to react' }, { status: 500 })
  }
}
