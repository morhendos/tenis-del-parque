import dbConnect from '../../../lib/db/mongoose'
import Player from '../../../lib/models/Player'
import League from '../../../lib/models/League'

export async function GET() {
  try {
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

    return Response.json({
      success: true,
      stats: {
        totalPlayers,
        byLevel,
        byLeague,
        registrationsByDay
      },
      recentPlayers
    })

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
