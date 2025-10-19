import dbConnect from '@/lib/db/mongoose'
import City from '@/lib/models/City'
import League from '@/lib/models/League'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const citySlug = params.slug
    
    // Find city by slug
    const city = await City.findOne({ slug: citySlug, status: 'active' })
    
    if (!city) {
      return Response.json({ error: 'City not found' }, { status: 404 })
    }
    
    // Find all leagues for this city
    const leagues = await League.find({ 
      city: city._id,
      status: { $in: ['active', 'coming_soon', 'registration_open', 'completed'] }
    })
    .populate('city', 'slug name images')
    .sort({ 
      'season.year': -1,           // Newest season first
      'season.type': 1,            // Spring > Summer > Autumn > Winter
      displayOrder: 1,             // Then by display order
      skillLevel: 1                // Then by skill level
    })
    .lean()
    
    // Group by season status
    const now = new Date()
    const grouped = {
      current: [],
      upcoming: [],
      past: []
    }
    
    leagues.forEach(league => {
      const start = league.seasonConfig?.startDate ? new Date(league.seasonConfig.startDate) : null
      const end = league.seasonConfig?.endDate ? new Date(league.seasonConfig.endDate) : null
      
      if (!start || !end) {
        // If no dates, treat as upcoming if coming_soon, otherwise current
        if (league.status === 'coming_soon') {
          grouped.upcoming.push(league)
        } else {
          grouped.current.push(league)
        }
      } else if (now >= start && now <= end) {
        grouped.current.push(league)
      } else if (now < start) {
        grouped.upcoming.push(league)
      } else {
        grouped.past.push(league)
      }
    })
    
    return Response.json({
      success: true,
      city: {
        _id: city._id,
        slug: city.slug,
        name: city.name,
        images: city.images,
        displayOrder: city.displayOrder
      },
      leagues: grouped,
      total: leagues.length,
      counts: {
        current: grouped.current.length,
        upcoming: grouped.upcoming.length,
        past: grouped.past.length
      }
    })
    
  } catch (error) {
    console.error('Error fetching city leagues:', error)
    return Response.json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 })
  }
}
