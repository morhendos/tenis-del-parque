import { NextResponse } from 'next/server'
import { requirePlayer } from '@/lib/auth/apiAuth'

export async function POST(request) {
  try {
    // Use requirePlayer helper for authentication
    const { session, error } = await requirePlayer(request)
    if (error) return error
    
    const { messageIds } = await request.json()
    
    // In production, this would update the database
    // For now, just return success
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as seen:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
