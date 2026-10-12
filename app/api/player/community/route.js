import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import LeaguePost from '@/lib/models/LeaguePost'
import { requirePlayer } from '@/lib/auth/apiAuth'
import { getViewer, canAccessLeague, serializePost, populatePost } from '@/lib/services/leagueFeedService'

export const dynamic = 'force-dynamic'

const PAGE = 20

export async function GET(request) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    const before = searchParams.get('before')
    const limit = Math.min(parseInt(searchParams.get('limit')) || PAGE, 50)
    if (!mongoose.Types.ObjectId.isValid(league)) {
      return NextResponse.json({ error: 'League required' }, { status: 400 })
    }

    const { player, isAdmin } = await getViewer(session)
    if (!isAdmin && !canAccessLeague(player, league)) {
      return NextResponse.json({ error: 'Not in this league' }, { status: 403 })
    }

    const base = { league, deletedAt: null }
    const pinned = before ? [] : await populatePost(LeaguePost.find({ ...base, pinned: true }).sort({ createdAt: -1 })).lean()
    const query = { ...base, pinned: { $ne: true } }
    if (before) query.createdAt = { $lt: new Date(before) }
    const posts = await populatePost(LeaguePost.find(query).sort({ createdAt: -1 }).limit(limit + 1)).lean()
    const hasMore = posts.length > limit
    const page = posts.slice(0, limit)

    const latest = await LeaguePost.findOne(base).sort({ createdAt: -1 }).select('createdAt').lean()

    return NextResponse.json({
      pinned: pinned.map(p => serializePost(p, player?._id, isAdmin)),
      posts: page.map(p => serializePost(p, player?._id, isAdmin)),
      nextBefore: hasMore ? page[page.length - 1].createdAt : null,
      latestAt: latest?.createdAt || null,
      me: player ? String(player._id) : null,
      isAdmin
    })
  } catch (err) {
    console.error('Community GET error:', err)
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error
    const { league, text } = await request.json()
    const clean = String(text || '').trim()
    if (!mongoose.Types.ObjectId.isValid(league) || !clean) {
      return NextResponse.json({ error: 'League and text required' }, { status: 400 })
    }
    if (clean.length > 1000) {
      return NextResponse.json({ error: 'Too long' }, { status: 400 })
    }

    const { player } = await getViewer(session)
    if (!player || !canAccessLeague(player, league)) {
      return NextResponse.json({ error: 'Not in this league' }, { status: 403 })
    }

    const recent = await LeaguePost.findOne({ author: player._id, createdAt: { $gt: new Date(Date.now() - 20000) } }).lean()
    if (recent) {
      return NextResponse.json({ error: 'Too fast' }, { status: 429 })
    }

    const post = await LeaguePost.create({ league, kind: 'player', author: player._id, text: clean })
    const full = await populatePost(LeaguePost.findById(post._id)).lean()
    return NextResponse.json({ post: serializePost(full, player._id, false) })
  } catch (err) {
    console.error('Community POST error:', err)
    return NextResponse.json({ error: 'Failed to post' }, { status: 500 })
  }
}
