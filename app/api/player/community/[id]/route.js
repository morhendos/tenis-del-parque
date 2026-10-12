import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import LeaguePost from '@/lib/models/LeaguePost'
import { requirePlayer } from '@/lib/auth/apiAuth'
import { getViewer } from '@/lib/services/leagueFeedService'

export const dynamic = 'force-dynamic'

export async function DELETE(request, { params }) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { player, isAdmin } = await getViewer(session)
    const post = await LeaguePost.findById(params.id)
    if (!post || post.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const isOwner = post.kind === 'player' && player && String(post.author) === String(player._id)
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    post.deletedAt = new Date()
    await post.save()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Community DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
