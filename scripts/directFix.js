#!/usr/bin/env node

/**
 * Direct fix for specific user-player link issues
 * This script shows exactly what's happening and fixes it
 */

const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load environment variables - prioritize .env.local
dotenv.config({ path: '.env.local' })
dotenv.config() // fallback to .env if .env.local doesn't have the variable

// Define schemas inline to avoid ES6 import issues
const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  role: { type: String, default: 'player' }
}, { timestamps: true })

const Player = mongoose.model('Player', PlayerSchema)
const User = mongoose.model('User', UserSchema)

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL

async function directFix(targetEmail = null) {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB\n')

    // Show the actual state of the database
    const totalUsers = await User.countDocuments()
    const totalPlayers = await Player.countDocuments()
    
    console.log('=== DATABASE STATE ===')
    console.log(`Total Users in DB: ${totalUsers}`)
    console.log(`Total Players in DB: ${totalPlayers}`)
    console.log('')

    // List all users with their linked players
    const allUsers = await User.find()
    console.log('=== ALL USERS ===')
    for (const user of allUsers) {
      console.log(`\nUser: ${user.email}`)
      console.log(`  _id: ${user._id}`)
      console.log(`  role: ${user.role}`)
      console.log(`  playerId: ${user.playerId || 'null'}`)
      
      if (user.playerId) {
        const linkedPlayer = await Player.findById(user.playerId)
        if (linkedPlayer) {
          console.log(`  ✅ Linked to Player: ${linkedPlayer.name} (${linkedPlayer.email})`)
          if (linkedPlayer.email.toLowerCase() !== user.email.toLowerCase()) {
            console.log(`  ⚠️  EMAIL MISMATCH!`)
          }
        } else {
          console.log(`  ❌ BROKEN LINK - Player ${user.playerId} does not exist!`)
        }
      } else {
        console.log(`  ❌ No playerId set`)
      }
    }

    // If specific email provided, fix it
    if (targetEmail) {
      console.log(`\n\n=== FIXING ${targetEmail} ===`)
      
      const user = await User.findOne({ email: targetEmail.toLowerCase() })
      const player = await Player.findOne({ email: targetEmail.toLowerCase() })
      
      if (!user) {
        console.log('❌ No user found with this email')
        return
      }
      
      if (!player) {
        console.log('❌ No player found with this email')
        return
      }
      
      console.log(`\nFound User:`)
      console.log(`  _id: ${user._id}`)
      console.log(`  current playerId: ${user.playerId || 'null'}`)
      
      console.log(`\nFound Player:`)
      console.log(`  _id: ${player._id}`)
      console.log(`  name: ${player.name}`)
      console.log(`  current userId: ${player.userId || 'null'}`)
      
      // Fix the links
      console.log('\n🔧 FIXING LINKS...')
      
      // Update user
      user.playerId = player._id
      await user.save()
      console.log(`✅ Updated user.playerId to ${player._id}`)
      
      // Update player
      player.userId = user._id
      await player.save()
      console.log(`✅ Updated player.userId to ${user._id}`)
      
      console.log('\n✅ LINKS FIXED!')
      
    } else {
      // Fix all broken links
      console.log('\n\n=== FIXING ALL BROKEN LINKS ===')
      
      let fixed = 0
      
      for (const user of allUsers) {
        if (user.playerId) {
          // Check if the linked player exists
          const linkedPlayer = await Player.findById(user.playerId)
          
          if (!linkedPlayer || linkedPlayer.email.toLowerCase() !== user.email.toLowerCase()) {
            // Find the correct player by email
            const correctPlayer = await Player.findOne({ email: user.email.toLowerCase() })
            
            if (correctPlayer) {
              console.log(`\nFixing ${user.email}:`)
              console.log(`  Old playerId: ${user.playerId}`)
              console.log(`  New playerId: ${correctPlayer._id}`)
              
              user.playerId = correctPlayer._id
              await user.save()
              
              correctPlayer.userId = user._id
              await correctPlayer.save()
              
              fixed++
              console.log('  ✅ Fixed!')
            } else {
              console.log(`\n❌ Cannot fix ${user.email} - no matching player found`)
              // Remove the broken link
              user.playerId = null
              await user.save()
              console.log('  Removed broken playerId')
            }
          }
        } else {
          // User has no playerId, try to find matching player
          const player = await Player.findOne({ email: user.email.toLowerCase() })
          if (player && !player.userId) {
            console.log(`\nLinking ${user.email} to player ${player._id}`)
            user.playerId = player._id
            await user.save()
            player.userId = user._id
            await player.save()
            fixed++
            console.log('  ✅ Linked!')
          }
        }
      }
      
      console.log(`\n✅ Fixed ${fixed} user-player pairs`)
    }
    
    // Show final state
    console.log('\n\n=== FINAL STATE ===')
    const finalUsers = await User.find()
    for (const user of finalUsers) {
      console.log(`\nUser: ${user.email}`)
      console.log(`  playerId: ${user.playerId || 'null'}`)
      
      if (user.playerId) {
        const player = await Player.findById(user.playerId)
        if (player) {
          console.log(`  ✅ Linked to: ${player.name} (${player.email})`)
        } else {
          console.log(`  ❌ STILL BROKEN!`)
        }
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n\nDisconnected from MongoDB')
  }
}

// Get email from command line argument
const email = process.argv[2]

if (email) {
  console.log(`Fixing specific email: ${email}`)
} else {
  console.log('No email provided, will show all users and fix broken links')
  console.log('Usage: node scripts/directFix.js [email]')
}

// Run the fix
directFix(email)
