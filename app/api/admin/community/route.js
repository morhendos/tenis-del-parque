import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/db/mongoose'
import LeaguePost from '@/lib/models/LeaguePost'
import { requireAdmin } from '@/lib/auth/apiAuth'
import { serializePost, populatePost, notifyAdminPost } from '@/lib/services/leagueFeedService'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    const { league, text, textEn, pinned = false, push = false } = await request.json()
    const es = String(text || '').trim()
    const en = String(textEn || '').trim()
    if (!mongoose.Types.ObjectId.isValid(league) || (!es && !en)) {
      return NextResponse.json({ error: 'League and text required' }, { status: 400 })
    }
    await dbConnect()
    const post = await LeaguePost.create({ league, kind: 'admin', text: es || en, textEn: en || es, pinned: !!pinned })
    if (push) await notifyAdminPost(post)
    const full = await populatePost(LeaguePost.findById(post._id)).lean()
    return NextResponse.json({ post: serializePost(full, null, true) })
  } catch (err) {
    console.error('Admin community POST error:', err)
    return NextResponse.json({ error: 'Failed to post' }, { status: 500 })
  }
}
