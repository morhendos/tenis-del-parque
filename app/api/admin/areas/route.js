import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Area from '@/lib/models/Area'
import dbConnect from '@/lib/db/mongoose'

// GET all areas
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const areas = await Area.find({ active: true }).sort({ name: 1 })

    return NextResponse.json({ areas })
  } catch (error) {
    console.error('Error fetching areas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch areas' },
      { status: 500 }
    )
  }
}

// POST - Save/update areas
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { areas } = await request.json()

    if (!areas || !Array.isArray(areas)) {
      return NextResponse.json(
        { error: 'Invalid areas data' },
        { status: 400 }
      )
    }

    // Delete all existing areas and replace with new ones
    // In production, you might want a more sophisticated approach
    await Area.deleteMany({})

    // Insert all areas
    const savedAreas = await Area.insertMany(areas)

    // Also update the geographic boundaries file
    // This ensures consistency between database and code
    await updateGeographicBoundariesFile(areas)

    return NextResponse.json({ 
      success: true, 
      areas: savedAreas,
      message: 'Areas saved successfully'
    })
  } catch (error) {
    console.error('Error saving areas:', error)
    return NextResponse.json(
      { error: 'Failed to save areas' },
      { status: 500 }
    )
  }
}

// Helper function to update the geographic boundaries file
async function updateGeographicBoundariesFile(areas) {
  try {
    // Convert areas to the format used by geographicBoundaries.js
    const leaguePolygons = {}
    const leagueNames = {}
    
    areas.forEach(area => {
      leaguePolygons[area.slug] = {
        bounds: area.bounds,
        color: area.color,
        name: area.name,
        center: area.center
      }
      leagueNames[area.slug] = area.name
    })

    // In a real implementation, you would write this to the file system
    // For now, we'll just log it
    console.log('Updated league polygons:', leaguePolygons)
    console.log('Updated league names:', leagueNames)
    
    // You could also emit an event or trigger a rebuild here
    // to ensure the changes are reflected in the application
    
    return true
  } catch (error) {
    console.error('Error updating geographic boundaries file:', error)
    return false
  }
}
