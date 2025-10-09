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

    // Get player count by level (from registrations)
    const levelCounts = await Player.aggregate([
      { $unwind: '$registrations' },
      { $group: { _id: '$registrations.level', count: { $sum: 1 } } }
    ])
    
    const byLevel = {
      beginner: levelCounts.find(l => l._id === 'beginner')?.count || 0,
      intermediate: levelCounts.find(l => l._id === 'intermediate')?.count || 0,
      advanced: levelCounts.find(l => l._id === 'advanced')?.count || 0
    }

    // Get player count by league
    const leagues = await League.find({ status: 'active' })
    const byLeague = {}
    
    for (const league of leagues) {
      const count = await Player.countDocuments({ 
        'registrations.league': league._id 
      })
      byLeague[league.slug] = {
        name: league.name,
        count: count
      }
    }

    // Get recent registrations (last 10) - using registrations array
    const recentPlayers = await Player.aggregate([
      { $unwind: '$registrations' },
      { $sort: { 'registrations.registeredAt': -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'leagues',
          localField: 'registrations.league',
          foreignField: '_id',
          as: 'league'
        }
      },
      { $unwind: '$league' },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          registeredAt: '$registrations.registeredAt',
          level: '$registrations.level',
          status: '$registrations.status',
          league: {
            _id: '$league._id',
            name: '$league.name',
            slug: '$league.slug'
          }
        }
      }
    ])

    // Get registration trends (last 7 days) - using registrations array
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const registrationsByDay = await Player.aggregate([
      { $unwind: '$registrations' },
      {
        $match: {
          'registrations.registeredAt': { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$registrations.registeredAt" } },
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
