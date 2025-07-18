import dbConnect from '../../../../lib/db/mongoose'
import League from '../../../../lib/models/League'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { league: slug } = params
    
    // Find league by ID
    const league = await League.findOne({ 
      _id: slug,
      status: 'active'
    })
    
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