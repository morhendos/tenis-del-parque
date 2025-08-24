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
        { error: 'Invalid areas data - expected an array' },
        { status: 400 }
      )
    }

    // Validate each area has required fields
    const validationErrors = []
    areas.forEach((area, index) => {
      if (!area.id) {
        validationErrors.push(`Area ${index + 1}: Missing required field 'id'`)
      }
      if (!area.name) {
        validationErrors.push(`Area ${index + 1}: Missing required field 'name'`)
      }
      if (!area.slug) {
        validationErrors.push(`Area ${index + 1}: Missing required field 'slug'`)
      }
      if (!area.center || typeof area.center.lat !== 'number' || typeof area.center.lng !== 'number') {
        validationErrors.push(`Area ${index + 1}: Missing or invalid 'center' coordinates`)
      }
      if (!area.bounds || !Array.isArray(area.bounds) || area.bounds.length < 3) {
        validationErrors.push(`Area ${index + 1}: Invalid bounds - must have at least 3 points`)
      }
      if (!area.color) {
        validationErrors.push(`Area ${index + 1}: Missing required field 'color'`)
      }
    })

    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors)
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors 
        },
        { status: 400 }
      )
    }

    // Delete all existing areas and replace with new ones
    // In production, you might want a more sophisticated approach
    await Area.deleteMany({})

    // Prepare areas with default values
    const preparedAreas = areas.map(area => ({
      ...area,
      active: area.active !== undefined ? area.active : true,
      metadata: area.metadata || {}
    }))

    // Insert all areas
    const savedAreas = await Area.insertMany(preparedAreas)

    // Also update the geographic boundaries file
    // This ensures consistency between database and code
    await updateGeographicBoundariesFile(savedAreas)

    return NextResponse.json({ 
      success: true, 
      areas: savedAreas,
      message: `Successfully saved ${savedAreas.length} areas`
    })
  } catch (error) {
    console.error('Error saving areas:', error)
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      const details = Object.keys(error.errors).map(field => {
        const err = error.errors[field]
        return `${field}: ${err.message}`
      })
      
      return NextResponse.json(
        { 
          error: 'Database validation failed',
          details 
        },
        { status: 400 }
      )
    }

    // Check for duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json(
        { 
          error: `Duplicate value error`,
          details: [`An area with this ${field} already exists`]
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to save areas',
        details: [error.message] 
      },
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
