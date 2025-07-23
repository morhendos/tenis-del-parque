import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Club from '@/lib/models/Club'
import dbConnect from '@/lib/db/mongoose'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const club = await Club.findById(params.id).lean()

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    return NextResponse.json({ club })
  } catch (error) {
    console.error('Error fetching club:', error)
    return NextResponse.json(
      { error: 'Failed to fetch club' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()
    console.log('Updating club with data:', JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data.name || !data.slug || !data.location?.city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists (excluding current club)
    const existingClub = await Club.findOne({ 
      slug: data.slug,
      _id: { $ne: params.id }
    })
    
    if (existingClub) {
      return NextResponse.json(
        { error: 'A club with this slug already exists' },
        { status: 400 }
      )
    }

    // Ensure courts structure is valid and calculate total
    const indoor = parseInt(data.courts?.indoor) || 0
    const outdoor = parseInt(data.courts?.outdoor) || 0
    const total = indoor + outdoor
    
    if (total < 1) {
      return NextResponse.json(
        { error: 'At least one court (indoor or outdoor) is required' },
        { status: 400 }
      )
    }
    
    data.courts = {
      ...data.courts,
      total,
      indoor,
      outdoor,
      surfaces: data.courts?.surfaces || []
    }

    const club = await Club.findByIdAndUpdate(
      params.id,
      {
        $set: {
          ...data,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    )

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      club: club.toObject() 
    })
  } catch (error) {
    console.error('Error updating club:', error)
    return NextResponse.json(
      { error: 'Failed to update club' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const club = await Club.findByIdAndDelete(params.id)

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Club deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting club:', error)
    return NextResponse.json(
      { error: 'Failed to delete club' },
      { status: 500 }
    )
  }
}