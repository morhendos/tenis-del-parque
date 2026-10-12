import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import LeaguePost from '@/lib/models/LeaguePost'
import { requirePlayer } from '@/lib/auth/apiAuth'
import { getViewer, canAccessLeague, serializePost, populatePost, notifyComment } from '@/lib/services/leagueFeedService'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error
    const { text } = await request.json()
    const clean = String(text || '').trim()
    if (!mongoose.Types.ObjectId.isValid(params.id) || !clean || clean.length > 500) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }
    const { player, isAdmin } = await getViewer(session)
    const post = await LeaguePost.findById(params.id)
    if (!post || post.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const asAdmin = !player && isAdmin
    if (!asAdmin && (!player || !canAccessLeague(player, post.league))) {
      return NextResponse.json({ error: 'Not in this league' }, { status: 403 })
    }

    post.comments.push({ author: asAdmin ? null : player._id, isAdmin: asAdmin, text: clean })
    await post.save()
    const comment = post.comments[post.comments.length - 1]

    await notifyComment(post, comment, player?._id, player?.name)

    const full = await populatePost(LeaguePost.findById(post._id)).lean()
    return NextResponse.json({ post: serializePost(full, player?._id, isAdmin) })
  } catch (err) {
    console.error('Community comment error:', err)
    return NextResponse.json({ error: 'Failed to comment' }, { status: 500 })
  }
}
