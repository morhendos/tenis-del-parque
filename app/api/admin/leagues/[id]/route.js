import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
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