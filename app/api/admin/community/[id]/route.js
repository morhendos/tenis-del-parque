import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/db/mongoose'
import LeaguePost from '@/lib/models/LeaguePost'
import { requireAdmin } from '@/lib/auth/apiAuth'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = await request.json()
    const update = {}
    if (typeof body.pinned === 'boolean') update.pinned = body.pinned
    if (body.clearReports) update.reports = []
    await dbConnect()
    const post = await LeaguePost.findByIdAndUpdate(params.id, { $set: update }, { new: true }).lean()
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin community PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await dbConnect()
    await LeaguePost.updateOne({ _id: params.id }, { $set: { deletedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin community DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
