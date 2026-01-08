import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
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

    // Handle new court structure
    if (data.courts) {
      // Calculate totals for each court type
      if (data.courts.tennis) {
        const tennisIndoor = parseInt(data.courts.tennis.indoor) || 0
        const tennisOutdoor = parseInt(data.courts.tennis.outdoor) || 0
        data.courts.tennis.total = tennisIndoor + tennisOutdoor
        data.courts.tennis.indoor = tennisIndoor
        data.courts.tennis.outdoor = tennisOutdoor
        data.courts.tennis.surfaces = data.courts.tennis.surfaces || []
      }
      
      if (data.courts.padel) {
        const padelIndoor = parseInt(data.courts.padel.indoor) || 0
        const padelOutdoor = parseInt(data.courts.padel.outdoor) || 0
        data.courts.padel.total = padelIndoor + padelOutdoor
        data.courts.padel.indoor = padelIndoor
        data.courts.padel.outdoor = padelOutdoor
        data.courts.padel.surfaces = data.courts.padel.surfaces || []
      }
      
      if (data.courts.pickleball) {
        const pickleballIndoor = parseInt(data.courts.pickleball.indoor) || 0
        const pickleballOutdoor = parseInt(data.courts.pickleball.outdoor) || 0
        data.courts.pickleball.total = pickleballIndoor + pickleballOutdoor
        data.courts.pickleball.indoor = pickleballIndoor
        data.courts.pickleball.outdoor = pickleballOutdoor
        data.courts.pickleball.surfaces = data.courts.pickleball.surfaces || []
      }
      
      // Handle legacy structure for backward compatibility
      if (data.courts.total !== undefined && !data.courts.tennis && !data.courts.padel && !data.courts.pickleball) {
        const indoor = parseInt(data.courts.indoor) || 0
        const outdoor = parseInt(data.courts.outdoor) || 0
        const total = indoor + outdoor
        
        if (total < 1) {
          return NextResponse.json(
            { error: 'At least one court is required' },
            { status: 400 }
          )
        }
        
        // Convert legacy to tennis courts by default
        data.courts = {
          tennis: {
            total,
            indoor,
            outdoor,
            surfaces: data.courts.surfaces || []
          },
          padel: {
            total: 0,
            indoor: 0,
            outdoor: 0,
            surfaces: []
          },
          pickleball: {
            total: 0,
            indoor: 0,
            outdoor: 0,
            surfaces: []
          },
          // Keep legacy fields for backward compatibility
          total: 0,
          indoor: 0,
          outdoor: 0,
          surfaces: []
        }
      }
      
      // Validate that at least one court exists
      const totalAllCourts = (data.courts.tennis?.total || 0) + 
                           (data.courts.padel?.total || 0) + 
                           (data.courts.pickleball?.total || 0)
      
      if (totalAllCourts < 1) {
        return NextResponse.json(
          { error: 'At least one court (tennis, padel, or pickleball) is required' },
          { status: 400 }
        )
      }
    }

    // Sanitize coordinates - remove if null/invalid to avoid 2dsphere index errors
    if (data.location?.coordinates) {
      const { lat, lng } = data.location.coordinates
      if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
        // Remove invalid coordinates entirely
        delete data.location.coordinates
      }
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

    // Auto-revalidate the club page to clear cache
    try {
      const city = club.location?.city
      const slug = club.slug
      
      if (city && slug) {
        console.log(`🔄 Auto-revalidating club pages: ${city}/${slug}`)
        revalidatePath(`/es/clubs/${city}/${slug}`)
        revalidatePath(`/en/clubs/${city}/${slug}`)
        console.log('✅ Club pages revalidated')
      }
    } catch (revalidateError) {
      console.error('⚠️ Error revalidating club pages:', revalidateError)
      // Don't fail the update if revalidation fails
    }

    return NextResponse.json({ 
      success: true, 
      club: club.toObject(),
      revalidated: true
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
