#!/usr/bin/env node

// scripts/fixProdMatchReferences.js
// Fix match player references in production after migration

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function fixProdMatchReferences() {
  try {
    console.log('🔧 Fixing production match references...')
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to production MongoDB')
    
    const db = mongoose.connection.db
    
    // Get old and new players
    const oldPlayers = await db.collection('players_old').find({}).toArray()
    const newPlayers = await db.collection('players').find({}).toArray()
    
    console.log(`📊 Found:`)
    console.log(`   Old players: ${oldPlayers.length}`)
    console.log(`   New players: ${newPlayers.length}`)
    
    // Create mapping from old player ID to new player ID based on email
    const emailToNewPlayerId = {}
    newPlayers.forEach(player => {
      emailToNewPlayerId[player.email.toLowerCase()] = player._id
    })
    
    const oldIdToNewId = {}
    oldPlayers.forEach(oldPlayer => {
      const email = oldPlayer.email.toLowerCase()
      if (emailToNewPlayerId[email]) {
        oldIdToNewId[oldPlayer._id.toString()] = emailToNewPlayerId[email]
      }
    })
    
    console.log(`🔗 Created mapping for ${Object.keys(oldIdToNewId).length} players`)
    
    // Check sample match first
    const sampleMatch = await db.collection('matches').findOne({})
    if (sampleMatch) {
      const oldPlayer1Id = sampleMatch.players.player1?.toString()
      const needsUpdate = oldPlayer1Id && !await db.collection('players').findOne({ _id: sampleMatch.players.player1 })
      
      console.log(`🔍 Sample match analysis:`)
      console.log(`   Player1 ID: ${oldPlayer1Id}`)
      console.log(`   Needs update: ${needsUpdate ? '✅ Yes' : '❌ No'}`)
      
      if (!needsUpdate) {
        console.log('✅ Match references appear to be already correct!')
        process.exit(0)
      }
    }
    
    // Update matches
    const matches = await db.collection('matches').find({}).toArray()
    let updatedCount = 0
    let skippedCount = 0
    
    console.log(`🔄 Processing ${matches.length} matches...`)
    
    for (const match of matches) {
      const oldPlayer1Id = match.players.player1?.toString()
      const oldPlayer2Id = match.players.player2?.toString()
      
      const newPlayer1Id = oldIdToNewId[oldPlayer1Id]
      const newPlayer2Id = oldIdToNewId[oldPlayer2Id]
      
      if (newPlayer1Id && newPlayer2Id) {
        const updateData = {
          'players.player1': new mongoose.Types.ObjectId(newPlayer1Id),
          'players.player2': new mongoose.Types.ObjectId(newPlayer2Id)
        }
        
        // Update winner reference if it exists
        if (match.result?.winner) {
          const oldWinnerId = match.result.winner.toString()
          if (oldWinnerId === oldPlayer1Id) {
            updateData['result.winner'] = new mongoose.Types.ObjectId(newPlayer1Id)
          } else if (oldWinnerId === oldPlayer2Id) {
            updateData['result.winner'] = new mongoose.Types.ObjectId(newPlayer2Id)
          }
        }
        
        await db.collection('matches').updateOne(
          { _id: match._id },
          { $set: updateData }
        )
        updatedCount++
        
        if (updatedCount % 10 === 0) {
          console.log(`   Updated ${updatedCount}/${matches.length} matches...`)
        }
      } else {
        skippedCount++
        console.log(`⚠️  Skipped match ${match._id}: Could not map players`)
      }
    }
    
    console.log('')
    console.log(`✅ Match reference fix completed!`)
    console.log(`   Updated matches: ${updatedCount}`)
    console.log(`   Skipped matches: ${skippedCount}`)
    console.log('')
    console.log('🎾 Player stats should now be calculated correctly!')
    console.log('   Check your league standings page for points and stats.')
    
    process.exit(0)
  } catch (error) {
    console.error('💥 Fix failed:', error)
    process.exit(1)
  }
}

// Run the fix
if (require.main === module) {
  fixProdMatchReferences()
}

module.exports = { fixProdMatchReferences }
