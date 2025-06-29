import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import League from '../../../../lib/models/League'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await dbConnect()

    // DEBUG: Let's see what's happening
    const allPlayersMongoose = await Player.find().lean()
    console.log('All players via Mongoose:', allPlayersMongoose.length)
    
    // Get total player count - both ways
    const totalPlayersMongoose = await Player.countDocuments()
    
    // Use raw MongoDB to ensure we get all documents
    const db = mongoose.connection.db
    const playersCollection = db.collection('players')
    const totalPlayersRaw = await playersCollection.countDocuments()
    
    console.log('Total players - Mongoose:', totalPlayersMongoose)
    console.log('Total players - Raw:', totalPlayersRaw)

    // Get player count by level using raw queries to avoid any schema issues
    const byLevel = {
      beginner: await playersCollection.countDocuments({ level: 'beginner' }),
      intermediate: await playersCollection.countDocuments({ level: 'intermediate' }),
      advanced: await playersCollection.countDocuments({ level: 'advanced' })
    }

    console.log('By level counts:', byLevel)

    // Get player count by league
    const leagues = await League.find({ status: 'active' })
    const byLeague = {}
    
    for (const league of leagues) {
      byLeague[league.slug] = {
        name: league.name,
        count: await playersCollection.countDocuments({ league: league._id })
      }
    }

    // Get recent registrations using raw query to ensure we get all
    const recentPlayersRaw = await playersCollection
      .find()
      .sort({ registeredAt: -1 })
      .limit(10)
      .toArray()

    console.log('Recent players count:', recentPlayersRaw.length)

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
        totalPlayers: totalPlayersRaw, // Use raw count
        byLevel,
        byLeague,
        registrationsByDay
      },
      recentPlayers,
      debug: {
        mongooseCount: totalPlayersMongoose,
        rawCount: totalPlayersRaw,
        discrepancy: totalPlayersRaw !== totalPlayersMongoose
      }
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
