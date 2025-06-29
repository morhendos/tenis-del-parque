import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import League from '../../../../lib/models/League'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await dbConnect()

    // WORKAROUND: Use raw MongoDB queries to handle documents with incorrect version fields
    // Some documents have '_v' instead of '__v' which causes Mongoose to not recognize them
    // This is a temporary fix until the database is corrected
    
    const db = mongoose.connection.db
    const playersCollection = db.collection('players')
    
    // Get total player count using raw query
    const totalPlayers = await playersCollection.countDocuments()

    // Get player count by level using raw queries
    const byLevel = {
      beginner: await playersCollection.countDocuments({ level: 'beginner' }),
      intermediate: await playersCollection.countDocuments({ level: 'intermediate' }),
      advanced: await playersCollection.countDocuments({ level: 'advanced' })
    }

    // Get player count by league
    const leagues = await League.find({ status: 'active' })
    const byLeague = {}
    
    for (const league of leagues) {
      byLeague[league.slug] = {
        name: league.name,
        count: await playersCollection.countDocuments({ league: league._id })
      }
    }

    // Get recent registrations using raw query then convert to Mongoose documents
    const recentPlayersRaw = await playersCollection
      .find()
      .sort({ registeredAt: -1 })
      .limit(10)
      .toArray()

    // Populate league info manually
    const recentPlayers = []
    for (const playerRaw of recentPlayersRaw) {
      const league = await League.findById(playerRaw.league).lean()
      recentPlayers.push({
        ...playerRaw,
        league: league ? { name: league.name, slug: league.slug } : null
      })
    }

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
