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

    // Handle city linking/unlinking
    if (data.hasOwnProperty('city')) {
      if (data.city) {
        // Validate that the city exists
        const city = await City.findById(data.city)
        if (!city) {
          return NextResponse.json(
            { error: 'City not found' },
            { status: 400 }
          )
        }
        league.city = data.city
      } else {
        // Unlink from city
        league.city = null
      }
    }

    // Handle other partial updates
    if (data.status !== undefined) league.status = data.status
    if (data.displayOrder !== undefined) league.displayOrder = data.displayOrder
    if (data.season !== undefined) league.season = data.season
    if (data.seasonConfig !== undefined) league.seasonConfig = data.seasonConfig

    // Save the updated league (skip validation for partial updates)
    await league.save({ validateBeforeSave: false })

    // Return the updated league with populated city data
    const updatedLeague = await League.findById(id).populate('city', 'slug name')

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