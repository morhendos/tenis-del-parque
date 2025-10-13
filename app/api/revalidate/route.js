import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admins to revalidate
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { path, type } = body

    if (!path) {
      return NextResponse.json({ 
        error: 'Missing path parameter' 
      }, { status: 400 })
    }

    console.log(`🔄 Revalidating: ${path}`)

    // Revalidate the specific path
    revalidatePath(path, type || 'page')

    return NextResponse.json({ 
      success: true, 
      revalidated: true,
      path: path,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error revalidating:', error)
    return NextResponse.json({ 
      error: 'Failed to revalidate',
      details: error.message 
    }, { status: 500 })
  }
}

// Alternative: Revalidate by club slug and city
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { city, slug } = body

    if (!city || !slug) {
      return NextResponse.json({ 
        error: 'Missing city or slug parameter' 
      }, { status: 400 })
    }

    console.log(`🔄 Revalidating club: ${city}/${slug}`)

    // Revalidate both language versions of the club page
    const paths = [
      `/es/clubs/${city}/${slug}`,
      `/en/clubs/${city}/${slug}`
    ]

    for (const path of paths) {
      revalidatePath(path)
    }

    return NextResponse.json({ 
      success: true, 
      revalidated: true,
      paths: paths,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error revalidating club:', error)
    return NextResponse.json({ 
      error: 'Failed to revalidate club',
      details: error.message 
    }, { status: 500 })
  }
}
