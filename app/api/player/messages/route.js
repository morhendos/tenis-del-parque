import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // For now, return mock messages
    // In production, this would fetch from database
    const mockMessages = [
      {
        _id: '1',
        type: 'announcement',
        title: session.user.language === 'es' ? 'Bienvenido a la Liga' : 'Welcome to the League',
        content: session.user.language === 'es' 
          ? 'Tu cuenta ha sido activada correctamente. ¡Ya puedes empezar a jugar!'
          : 'Your account has been activated successfully. You can start playing now!',
        createdAt: new Date().toISOString(),
        seen: false
      }
    ]
    
    return NextResponse.json(mockMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
