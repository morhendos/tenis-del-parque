import dbConnect from '../../../../lib/db/mongoose'
import League from '../../../../lib/models/League'
import mongoose from 'mongoose'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { league: identifier } = params
    
    // Build query to support both ID and slug
    // Include both active and coming_soon leagues
    let query = { status: { $in: ['active', 'coming_soon'] } }
    
    // Check if identifier is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query._id = identifier
    } else {
      // Otherwise, treat it as a slug
      query.slug = identifier
    }
    
    // Find league by ID or slug
    const league = await League.findOne(query)
    
    if (!league) {
      return Response.json(
        { 
          success: false, 
          error: 'League not found' 
        },
        { status: 404 }
      )
    }
    
    // Check if registration is open
    const isRegistrationOpen = league.isRegistrationOpen
    
    return Response.json({
      success: true,
      league: {
        _id: league._id,
        name: league.name,
        slug: league.slug,
        location: league.location,
        description: league.description,
        seasons: league.seasons,
        config: league.config,
        contact: league.contact,
        status: league.status,
        expectedLaunchDate: league.expectedLaunchDate,
        waitingListCount: league.waitingListCount,
        isRegistrationOpen
      }
    })
    
  } catch (error) {
    console.error('League fetch error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
