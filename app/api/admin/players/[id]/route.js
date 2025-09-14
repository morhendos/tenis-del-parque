import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '../../../../../lib/db/mongoose'
import Player from '../../../../../lib/models/Player'
import League from '../../../../../lib/models/League'
import { requireAdmin } from '../../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const playerId = params.id
    const body = await request.json()
    const { status, level, leagueId } = body

    // Find the player
    const player = await Player.findById(playerId)
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // If updating status and leagueId is provided, update specific league registration
    if (status && leagueId) {
      const registration = player.registrations.find(reg => 
        reg.league.toString() === leagueId.toString()
      )
      
      if (!registration) {
        return NextResponse.json(
          { error: 'Player not registered for this league' },
          { status: 400 }
        )
      }

      const oldStatus = registration.status
      registration.status = status

      // Update league counters when status changes
      if (oldStatus !== status) {
        const league = await League.findById(leagueId)
        
        if (oldStatus === 'waiting') {
          // Moving from waiting list
          if (league.waitingListCount > 0) {
            await League.findByIdAndUpdate(leagueId, {
              $inc: { 'waitingListCount': -1 }
            })
          }
        }
        
        if (status === 'waiting') {
          // Moving to waiting list
          await League.findByIdAndUpdate(leagueId, {
            $inc: { 'waitingListCount': 1 }
          })
        }
        
        // Update active player counts
        if (['pending', 'confirmed', 'active'].includes(status) && !['pending', 'confirmed', 'active'].includes(oldStatus)) {
          await League.findByIdAndUpdate(leagueId, {
            $inc: { 'stats.registeredPlayers': 1 }
          })
        } else if (!['pending', 'confirmed', 'active'].includes(status) && ['pending', 'confirmed', 'active'].includes(oldStatus)) {
          await League.findByIdAndUpdate(leagueId, {
            $inc: { 'stats.registeredPlayers': -1 }
          })
        }
      }
    }

    // If updating level and leagueId is provided, update specific league registration
    if (level && leagueId) {
      const registration = player.registrations.find(reg => 
        reg.league.toString() === leagueId.toString()
      )
      
      if (!registration) {
        return NextResponse.json(
          { error: 'Player not registered for this league' },
          { status: 400 }
        )
      }

      registration.level = level
    }

    // Save the player
    await player.save()

    return NextResponse.json({
      success: true,
      message: 'Player updated successfully',
      player
    })

  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update player',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const playerId = params.id

    // Find and delete the player
    const player = await Player.findByIdAndDelete(playerId)
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Update league counters for all registrations
    for (const registration of player.registrations) {
      const updates = {}
      
      if (registration.status === 'waiting') {
        updates['waitingListCount'] = -1
      }
      
      if (['pending', 'confirmed', 'active'].includes(registration.status)) {
        updates['stats.registeredPlayers'] = -1
      }
      
      if (Object.keys(updates).length > 0) {
        await League.findByIdAndUpdate(registration.league, {
          $inc: updates
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete player',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
