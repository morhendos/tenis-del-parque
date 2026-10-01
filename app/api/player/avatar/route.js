import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import dbConnect from '@/lib/db/mongoose'
import Player from '@/lib/models/Player'
import User from '@/lib/models/User'
import { requirePlayer } from '@/lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 2 * 1024 * 1024
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

async function getPlayer(session) {
  const user = await User.findById(session.user.id)
  if (!user) return null
  return Player.findOne({ email: user.email })
}

async function removeOld(url) {
  if (url && url.includes('.blob.vercel-storage.com')) {
    try { await del(url) } catch (e) { console.error('Avatar delete failed:', e.message) }
  }
}

export async function POST(request) {
  const { session, error } = await requirePlayer(request)
  if (error) return error

  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }
    const ext = TYPES[file.type]
    if (!ext) return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Image too large' }, { status: 400 })

    await dbConnect()
    const player = await getPlayer(session)
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

    const blob = await put(`players/avatars/${player._id}-${Date.now()}.${ext}`, file, {
      access: 'public',
      contentType: file.type
    })

    const old = player.avatar
    player.avatar = blob.url
    await player.save()
    await removeOld(old)

    return NextResponse.json({ success: true, avatar: blob.url })
  } catch (e) {
    console.error('Avatar upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const { session, error } = await requirePlayer(request)
  if (error) return error

  try {
    await dbConnect()
    const player = await getPlayer(session)
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

    const old = player.avatar
    player.avatar = null
    await player.save()
    await removeOld(old)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Avatar delete error:', e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
