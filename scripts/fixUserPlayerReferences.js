#!/usr/bin/env node

// scripts/fixUserPlayerReferences.js
// Fix User-Player references after player migration

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function fixUserPlayerReferences() {
  try {
    console.log('🔧 Fixing User-Player references after migration...')
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const db = mongoose.connection.db
    
    // Get all old players (backup)
    const oldPlayers = await db.collection('players_old').find({}).toArray()
    const newPlayers = await db.collection('players').find({}).toArray()
    const users = await db.collection('users').find({}).toArray()
    
    console.log(`📊 Found:`)
    console.log(`   Old players: ${oldPlayers.length}`)
    console.log(`   New players: ${newPlayers.length}`)
    console.log(`   Users: ${users.length}`)
    
    // Create mapping from old player ID to new player ID
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
    
    // Update user references
    let updatedUsers = 0
    let createdUsers = 0
    
    for (const user of users) {
      const oldPlayerId = user.playerId?.toString()
      
      if (oldPlayerId && oldIdToNewId[oldPlayerId]) {
        // Update existing user with new player ID
        await db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { 
              playerId: new mongoose.Types.ObjectId(oldIdToNewId[oldPlayerId]),
              isActive: true // Ensure user is active
            } 
          }
        )
        updatedUsers++
        console.log(`✅ Updated user ${user.email} -> new player ID`)
      }
    }
    
    // Check for players without user accounts
    for (const player of newPlayers) {
      const existingUser = users.find(u => u.email?.toLowerCase() === player.email.toLowerCase())
      
      if (!existingUser) {
        console.log(`⚠️  Creating missing user account for ${player.email}`)
        
        // Create user account
        const newUser = {
          email: player.email.toLowerCase(),
          password: '$2a$12$temp.password.hash.needs.reset', // Temporary - user must reset
          role: 'player',
          playerId: player._id,
          isActive: true,
          emailVerified: false,
          isFirstLogin: true,
          loginAttempts: 0,
          preferences: {
            language: 'en',
            hasSeenWelcomeModal: false,
            notifications: {
              email: true,
              matchReminders: true,
              resultReminders: true
            }
          },
          seenAnnouncements: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        await db.collection('users').insertOne(newUser)
        createdUsers++
      }
    }
    
    console.log('')
    console.log(`✅ Migration completed!`)
    console.log(`   Updated users: ${updatedUsers}`)
    console.log(`   Created users: ${createdUsers}`)
    console.log('')
    console.log('🔐 Users with missing accounts can now reset their passwords!')
    console.log('   They will need to use the "Forgot Password" feature.')
    
    process.exit(0)
  } catch (error) {
    console.error('💥 Fix failed:', error)
    process.exit(1)
  }
}

// Run the fix
if (require.main === module) {
  fixUserPlayerReferences()
}

module.exports = { fixUserPlayerReferences }
