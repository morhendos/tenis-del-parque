import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import League from '../../../../lib/models/League'
import { requireAdmin } from '../../../../lib/auth/apiAuth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    // Get total player count
    const totalPlayers = await Player.countDocuments()

    // Get player count by level
    const byLevel = {
      beginner: await Player.countDocuments({ level: 'beginner' }),
      intermediate: await Player.countDocuments({ level: 'intermediate' }),
      advanced: await Player.countDocuments({ level: 'advanced' })
    }

    // Get player count by league
    const leagues = await League.find({ status: 'active' })
    const byLeague = {}
    
    for (const league of leagues) {
      byLeague[league.slug] = {
        name: league.name,
        count: await Player.countDocuments({ league: league._id })
      }
    }

    // Get recent registrations (last 10)
    const recentPlayers = await Player
      .find()
      .sort({ registeredAt: -1 })
      .limit(10)
      .populate('league', 'name slug')
      .lean()

    // Get registration trends (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const registrationsByDay = await Player.aggregate([
      {
        $match: {
          registeredAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$registeredAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Create response
    const response = Response.json({
      success: true,
      stats: {
        totalPlayers,
        byLevel,
        byLeague,
        registrationsByDay
      },
      recentPlayers,
      timestamp: new Date().toISOString() // Add timestamp to verify freshness
    })

    // Set headers to prevent ANY caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response

  } catch (error) {
    console.error('Dashboard API error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data' 
      },
      { status: 500 }
    )
  }
}
