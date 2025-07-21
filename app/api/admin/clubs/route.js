import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Club from '@/lib/models/Club'
import connectDB from '@/lib/db/mongodb'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const status = searchParams.get('status')

    let query = {}
    if (city && city !== 'all') {
      query['location.city'] = city
    }
    if (status) {
      query.status = status
    }

    const clubs = await Club.find(query)
      .sort({ featured: -1, displayOrder: 1, name: 1 })
      .lean()

    return NextResponse.json({ clubs })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.slug || !data.location?.city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingClub = await Club.findOne({ slug: data.slug })
    if (existingClub) {
      return NextResponse.json(
        { error: 'A club with this slug already exists' },
        { status: 400 }
      )
    }

    // Create slug from name if not provided
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
    }

    const club = new Club({
      ...data,
      status: data.status || 'active',
      stats: { views: 0, clicks: 0 }
    })

    await club.save()

    return NextResponse.json({ 
      success: true, 
      club: club.toObject() 
    })
  } catch (error) {
    console.error('Error creating club:', error)
    return NextResponse.json(
      { error: 'Failed to create club' },
      { status: 500 }
    )
  }
}