import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import { requireAdmin } from '../../../../../lib/auth/apiAuth'

// GET /api/admin/leagues/[id] - Get single league details
export async function GET(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()
    
    const league = await League.findById(params.id)
    
    // Safely populate city only if it's a valid reference (legacy data may have string slug)
    try {
      if (league?.city && typeof league.city !== 'string') {
        await league.populate('city', 'name slug')
      }
    } catch (populateCityError) {
      console.warn('Warning: Could not populate city for league:', populateCityError.message)
      // Continue without city population
    }
    
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    // Safely populate playoff players if they exist
    if (league.playoffConfig?.qualifiedPlayers) {
      try {
        if (league.playoffConfig.qualifiedPlayers.groupA?.length > 0) {
          await league.populate('playoffConfig.qualifiedPlayers.groupA.player')
        }
        if (league.playoffConfig.qualifiedPlayers.groupB?.length > 0) {
          await league.populate('playoffConfig.qualifiedPlayers.groupB.player')
        }
      } catch (populateError) {
        console.warn('Warning: Could not populate playoff players:', populateError.message)
        // Continue without playoff player population
      }
    }
    
    return NextResponse.json({
      success: true,
      league: league
    })
    
  } catch (error) {
    console.error('Error fetching league:', error)
    return NextResponse.json(
      { error: 'Failed to fetch league' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/leagues/[id] - Update league
export async function PUT(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()
    
    const body = await request.json()
    
    const league = await League.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('city', 'name slug')
    
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'League updated successfully',
      league: league
    })
    
  } catch (error) {
    console.error('Error updating league:', error)
    return NextResponse.json(
      { error: 'Failed to update league' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/leagues/[id] - Delete league
export async function DELETE(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()
    
    const league = await League.findByIdAndDelete(params.id)
    
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
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
