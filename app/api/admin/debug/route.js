import dbConnect from '../../../../lib/db/mongoose'
import Player from '../../../../lib/models/Player'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await dbConnect()
    
    // 1. Check with Mongoose
    const mongoosePlayers = await Player.find().lean()
    const mongooseCount = await Player.countDocuments()
    
    // 2. Check with raw MongoDB
    const db = mongoose.connection.db
    const playersCollection = db.collection('players')
    const rawPlayers = await playersCollection.find().toArray()
    const rawCount = await playersCollection.countDocuments()
    
    // 3. Check specific player by email
    const emmanuelMongoose = await Player.findOne({ email: 'frijolsocial@gmail.com' }).lean()
    const emmanuelRaw = await playersCollection.findOne({ email: 'frijolsocial@gmail.com' })
    
    // 4. Check for any differences in document structure
    const differences = []
    if (rawPlayers.length !== mongoosePlayers.length) {
      differences.push(`Count mismatch: Raw=${rawPlayers.length}, Mongoose=${mongoosePlayers.length}`)
    }
    
    // Find which players are missing in Mongoose
    const mongooseEmails = mongoosePlayers.map(p => p.email)
    const missingInMongoose = rawPlayers.filter(p => !mongooseEmails.includes(p.email))
    
    return Response.json({
      success: true,
      diagnostics: {
        mongoose: {
          count: mongooseCount,
          players: mongoosePlayers.length,
          emails: mongoosePlayers.map(p => ({ email: p.email, name: p.name, level: p.level }))
        },
        raw: {
          count: rawCount,
          players: rawPlayers.length,
          emails: rawPlayers.map(p => ({ email: p.email, name: p.name, level: p.level }))
        },
        emmanuel: {
          foundWithMongoose: !!emmanuelMongoose,
          foundWithRaw: !!emmanuelRaw,
          mongooseData: emmanuelMongoose,
          rawData: emmanuelRaw
        },
        missingInMongoose,
        differences
      }
    })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return Response.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}
