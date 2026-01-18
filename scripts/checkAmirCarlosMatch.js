/**
 * Diagnostic script to check match data in database
 * Run: node scripts/checkAmirCarlosMatch.js
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

async function checkMatch() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB\n')
    
    // Define schemas directly
    const MatchSchema = new mongoose.Schema({}, { strict: false })
    const PlayerSchema = new mongoose.Schema({}, { strict: false })
    const LeagueSchema = new mongoose.Schema({}, { strict: false })
    
    const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema)
    const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema)
    const League = mongoose.models.League || mongoose.model('League', LeagueSchema)
    
    // Find all players with "Amir" or "Carlos" in name
    console.log('=== Searching for Amir and Carlos players ===')
    const amirPlayers = await Player.find({ name: { $regex: /Amir/i } }).lean()
    const carlosPlayers = await Player.find({ name: { $regex: /Carlos/i } }).lean()
    
    console.log('Amir players found:', amirPlayers.map(p => ({ _id: p._id.toString(), name: p.name })))
    console.log('Carlos players found:', carlosPlayers.map(p => ({ _id: p._id.toString(), name: p.name })))
    
    // Get all Round 1 matches
    console.log('\n=== All Round 1 Matches ===')
    const round1Matches = await Match.find({ round: 1 })
      .populate('players.player1', 'name')
      .populate('players.player2', 'name')
      .populate('result.winner', 'name')
      .populate('league', 'name slug')
      .lean()
    
    console.log(`Found ${round1Matches.length} Round 1 matches:\n`)
    
    round1Matches.forEach((m, idx) => {
      const p1Name = m.players?.player1?.name || 'N/A'
      const p2Name = m.players?.player2?.name || 'N/A'
      const hasResult = !!m.result
      const hasWinner = !!m.result?.winner
      const hasSets = !!m.result?.score?.sets && m.result.score.sets.length > 0
      const leagueName = m.league?.name || 'Unknown League'
      
      console.log(`${idx + 1}. ${p1Name} vs ${p2Name}`)
      console.log(`   League: ${leagueName}`)
      console.log(`   Status: ${m.status}`)
      console.log(`   Has result object: ${hasResult}`)
      console.log(`   Has winner: ${hasWinner} ${m.result?.winner?.name || ''}`)
      console.log(`   Has score.sets: ${hasSets}`)
      
      if (hasSets) {
        console.log(`   Sets: ${m.result.score.sets.map(s => `${s.player1}-${s.player2}`).join(', ')}`)
      }
      
      if (p1Name.includes('Amir') || p2Name.includes('Amir') || 
          p1Name.includes('Carlos') || p2Name.includes('Carlos')) {
        console.log(`   *** THIS IS THE AMIR/CARLOS MATCH ***`)
        console.log(`   Full result object:`, JSON.stringify(m.result, null, 2))
      }
      
      console.log('')
    })
    
    // Summary of all matches
    console.log('\n=== Match Status Summary ===')
    const allMatches = await Match.find({}).lean()
    const completed = allMatches.filter(m => m.status === 'completed')
    const withResult = allMatches.filter(m => !!m.result)
    const withSets = allMatches.filter(m => m.result?.score?.sets?.length > 0)
    const withWinner = allMatches.filter(m => !!m.result?.winner)
    
    console.log(`Total matches: ${allMatches.length}`)
    console.log(`Status = completed: ${completed.length}`)
    console.log(`Has result object: ${withResult.length}`)
    console.log(`Has result.winner: ${withWinner.length}`)
    console.log(`Has result.score.sets: ${withSets.length}`)
    
    // Check inconsistencies
    console.log('\n=== Potential Issues ===')
    const completedWithoutSets = completed.filter(m => !m.result?.score?.sets?.length)
    const hasWinnerNotCompleted = allMatches.filter(m => m.result?.winner && m.status !== 'completed')
    
    if (completedWithoutSets.length > 0) {
      console.log(`⚠️  ${completedWithoutSets.length} matches are 'completed' but have no score.sets:`)
      for (const m of completedWithoutSets.slice(0, 5)) {
        const populated = await Match.findById(m._id)
          .populate('players.player1', 'name')
          .populate('players.player2', 'name')
          .lean()
        console.log(`   - Round ${m.round}: ${populated.players?.player1?.name || 'N/A'} vs ${populated.players?.player2?.name || 'N/A'}`)
      }
    }
    
    if (hasWinnerNotCompleted.length > 0) {
      console.log(`⚠️  ${hasWinnerNotCompleted.length} matches have a winner but status != 'completed'`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

checkMatch()
