#!/usr/bin/env node

// scripts/fixEloStructure.js
// Move ELO ratings from registration level to player level (global ELO)

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function fixEloStructure() {
  try {
    console.log('🎾 Fixing ELO structure - Moving to global player level...')
    console.log('   ELO should be GLOBAL per player, not per league!')
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const db = mongoose.connection.db
    
    // Get all players
    const players = await db.collection('players').find({}).toArray()
    console.log(`📊 Found ${players.length} players to update`)
    
    let updatedCount = 0
    
    for (const player of players) {
      try {
        // Extract ELO data from registrations
        let globalEloRating = 1200 // Default
        let globalHighestElo = 1200
        let globalLowestElo = 1200
        
        if (player.registrations && player.registrations.length > 0) {
          // Find the highest ELO across all registrations as the current global ELO
          const eloRatings = player.registrations
            .map(reg => reg.stats?.eloRating)
            .filter(elo => elo && elo > 0)
          
          if (eloRatings.length > 0) {
            globalEloRating = Math.max(...eloRatings)
            globalHighestElo = Math.max(...player.registrations.map(reg => reg.stats?.highestElo || 1200))
            globalLowestElo = Math.min(...player.registrations.map(reg => reg.stats?.lowestElo || 1200))
          }
        }
        
        // Create the new player structure
        const updatedPlayer = {
          ...player,
          // GLOBAL ELO at player level
          eloRating: globalEloRating,
          highestElo: globalHighestElo,
          lowestElo: globalLowestElo,
          
          // Clean up registrations - remove ELO from registration stats
          registrations: player.registrations?.map(reg => ({
            ...reg,
            stats: {
              // Keep league-specific stats
              matchesPlayed: reg.stats?.matchesPlayed || 0,
              matchesWon: reg.stats?.matchesWon || 0,
              totalPoints: reg.stats?.totalPoints || 0,
              setsWon: reg.stats?.setsWon || 0,
              setsLost: reg.stats?.setsLost || 0,
              gamesWon: reg.stats?.gamesWon || 0,
              gamesLost: reg.stats?.gamesLost || 0,
              retirements: reg.stats?.retirements || 0,
              walkovers: reg.stats?.walkovers || 0
              // NO ELO HERE - it's now global!
            }
          })) || []
        }
        
        // Update the player
        await db.collection('players').replaceOne(
          { _id: player._id },
          updatedPlayer
        )
        
        updatedCount++
        
        if (updatedCount % 5 === 0) {
          console.log(`   Updated ${updatedCount}/${players.length} players...`)
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${player.email}:`, error.message)
      }
    }
    
    console.log('')
    console.log(`✅ ELO structure fix completed!`)
    console.log(`   Updated players: ${updatedCount}`)
    console.log('')
    console.log('🎾 ELO is now GLOBAL per player:')
    console.log('   ✅ player.eloRating - Global skill rating')
    console.log('   ✅ player.highestElo - Highest ever achieved')
    console.log('   ✅ player.lowestElo - Lowest ever achieved')
    console.log('   ✅ registration.stats - League-specific match stats (no ELO)')
    console.log('')
    console.log('🔧 Next: Update API code to use global ELO instead of registration ELO')
    
    process.exit(0)
  } catch (error) {
    console.error('💥 Fix failed:', error)
    process.exit(1)
  }
}

// Run the fix
if (require.main === module) {
  fixEloStructure()
}

module.exports = { fixEloStructure }
