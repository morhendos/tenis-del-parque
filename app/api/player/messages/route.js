import { NextResponse } from 'next/server'
import { requirePlayer } from '@/lib/auth/apiAuth'

export async function GET(request) {
  try {
    // Use requirePlayer helper for authentication
    const { session, error } = await requirePlayer(request)
    if (error) return error
    
    // For now, return mock messages
    // In production, this would fetch from database
    const mockMessages = [
      {
        _id: '1',
        type: 'announcement',
        title: 'Bienvenido a la Liga',
        content: 'Tu cuenta ha sido activada correctamente. ¡Ya puedes empezar a jugar!',
        createdAt: new Date().toISOString(),
        seen: false
      },
      {
        _id: '2',
        type: 'announcement',
        title: 'Welcome to the League',
        content: 'Your account has been activated successfully. You can start playing now!',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        seen: true
      }
    ]
    
    return NextResponse.json(mockMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
