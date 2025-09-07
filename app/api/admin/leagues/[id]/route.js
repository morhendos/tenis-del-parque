import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import City from '../../../../../lib/models/City'
import { requireAdmin } from '../../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function PUT(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params

    // Connect to database
    await dbConnect()

    // Parse request body
    const data = await request.json()

    // Find the league
    const league = await League.findById(id)
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      )
    }

    // Check if slug is being changed and if it already exists
    if (data.slug && data.slug !== league.slug) {
      const existingLeague = await League.findOne({ 
        slug: data.slug,
        _id: { $ne: id }
      })
      if (existingLeague) {
        return NextResponse.json(
          { error: 'A league with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update fields
    if (data.name !== undefined) league.name = data.name
    if (data.slug !== undefined) league.slug = data.slug.toLowerCase()
    if (data.status !== undefined) league.status = data.status
    if (data.displayOrder !== undefined) league.displayOrder = data.displayOrder
    if (data.expectedLaunchDate !== undefined) league.expectedLaunchDate = data.expectedLaunchDate

    // Update location
    if (data.location) {
      league.location = {
        ...league.location,
        ...data.location
      }
    }

    // Update descriptions
    if (data.description) {
      league.description = {
        ...league.description,
        ...data.description
      }
    }

    // Save the updated league
    await league.save()

    return NextResponse.json({
      success: true,
      league
    })

  } catch (error) {
    console.error('Error updating league:', error)
    return NextResponse.json(
      { error: 'Failed to update league: ' + error.message },
      { status: 500 }
    )
  }
}

// NEW: PATCH method for partial updates (specifically for city linking)
export async function PATCH(request, { params }) {
  try {
    console.log('🔍 PATCH league request received for ID:', params.id)
    
    const { session, error } = await requireAdmin(request)
    if (error) {
      console.error('❌ Admin auth failed:', error)
      return error
    }

    const { id } = params
    console.log('🔍 League ID to update:', id)

    // Connect to database
    await dbConnect()
    console.log('✅ Database connected')

    // Parse request body
    const data = await request.json()
    console.log('🔍 Update data received:', data)

    // Find the league
    const league = await League.findById(id)
    if (!league) {
      console.error('❌ League not found with ID:', id)
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      )
    }
    console.log('✅ League found:', league.name)

    // Handle city linking/unlinking
    if (data.hasOwnProperty('city')) {
      console.log('🔍 Processing city update:', data.city)
      if (data.city) {
        // Validate that the city exists
        const city = await City.findById(data.city)
        if (!city) {
          console.error('❌ City not found with ID:', data.city)
          return NextResponse.json(
            { error: 'City not found' },
            { status: 400 }
          )
        }
        console.log('✅ City found:', city.name)
        league.city = data.city
        console.log('✅ League city updated to:', data.city)
      } else {
        // Unlink from city
        console.log('🔗 Unlinking league from city')
        league.city = null
      }
    }

    // Handle other partial updates
    if (data.status !== undefined) league.status = data.status
    if (data.displayOrder !== undefined) league.displayOrder = data.displayOrder

    // Save the updated league (skip validation for partial updates)
    console.log('💾 Saving league...')
    await league.save({ validateBeforeSave: false })
    console.log('✅ League saved successfully')

    // Return the updated league with populated city data
    console.log('🔍 Fetching updated league with populated city...')
    const updatedLeague = await League.findById(id).populate('city', 'slug name')
    console.log('✅ Updated league fetched:', updatedLeague.name, 'with city:', updatedLeague.city?.name)

    return NextResponse.json({
      success: true,
      league: updatedLeague
    })

  } catch (error) {
    console.error('Error patching league:', error)
    return NextResponse.json(
      { error: 'Failed to update league: ' + error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params

    // Connect to database
    await dbConnect()

    // Check if league has players
    const Player = (await import('../../../../../lib/models/Player')).default
    const playerCount = await Player.countDocuments({ league: id })
    
    if (playerCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete league with existing players' },
        { status: 400 }
      )
    }

    // Delete the league
    const result = await League.findByIdAndDelete(id)
    
    if (!result) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'League deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting league:', error)
    return NextResponse.json(
      { error: 'Failed to delete league' },
      { status: 500 }
    )
  }
}