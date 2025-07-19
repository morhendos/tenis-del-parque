#!/usr/bin/env node

/**
 * Diagnostic script to check Player-User link integrity
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Player from '../lib/models/Player.js'
import User from '../lib/models/User.js'

// Load environment variables
dotenv.config()

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL

async function diagnoseLinkIssues(email = null) {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')
    
    if (email) {
      // Check specific email
      console.log(`\n=== Checking ${email} ===`)
      
      const user = await User.findOne({ email: email.toLowerCase() })
      const player = await Player.findOne({ email: email.toLowerCase() })
      
      console.log('\nUser Document:')
      if (user) {
        console.log(`  _id: ${user._id}`)
        console.log(`  email: ${user.email}`)
        console.log(`  playerId: ${user.playerId || 'null'}`)
        console.log(`  role: ${user.role}`)
        
        if (user.playerId) {
          const linkedPlayer = await Player.findById(user.playerId)
          if (linkedPlayer) {
            console.log(`  Linked Player exists: ✅`)
            console.log(`    Player email: ${linkedPlayer.email}`)
            console.log(`    Emails match: ${linkedPlayer.email === user.email ? '✅' : '❌'}`)
          } else {
            console.log(`  Linked Player exists: ❌ (playerId points to non-existent player)`)
          }
        }
      } else {
        console.log('  No user found with this email')
      }
      
      console.log('\nPlayer Document:')
      if (player) {
        console.log(`  _id: ${player._id}`)
        console.log(`  name: ${player.name}`)
        console.log(`  email: ${player.email}`)
        console.log(`  userId: ${player.userId || 'null'}`)
        console.log(`  league: ${player.league}`)
        console.log(`  status: ${player.status}`)
        
        if (player.userId) {
          const linkedUser = await User.findById(player.userId)
          if (linkedUser) {
            console.log(`  Linked User exists: ✅`)
            console.log(`    User email: ${linkedUser.email}`)
            console.log(`    Emails match: ${linkedUser.email === player.email ? '✅' : '❌'}`)
          } else {
            console.log(`  Linked User exists: ❌ (userId points to non-existent user)`)
          }
        }
      } else {
        console.log('  No player found with this email')
      }
      
      // Check if they should be linked
      if (user && player) {
        console.log('\n=== Link Status ===')
        if (user.playerId && user.playerId.equals(player._id)) {
          console.log('  User -> Player: ✅ Correct')
        } else if (user.playerId) {
          console.log('  User -> Player: ❌ Points to different player')
        } else {
          console.log('  User -> Player: ❌ Not linked')
        }
        
        if (player.userId && player.userId.equals(user._id)) {
          console.log('  Player -> User: ✅ Correct')
        } else if (player.userId) {
          console.log('  Player -> User: ❌ Points to different user')
        } else {
          console.log('  Player -> User: ❌ Not linked')
        }
      }
      
    } else {
      // General diagnostics
      console.log('\n=== General Link Diagnostics ===')
      
      // Users with invalid playerIds
      const usersWithPlayerIds = await User.find({ 
        playerId: { $exists: true, $ne: null },
        role: 'player'
      })
      
      let invalidLinks = 0
      let emailMismatches = 0
      
      for (const user of usersWithPlayerIds) {
        const player = await Player.findById(user.playerId)
        if (!player) {
          invalidLinks++
          console.log(`\n❌ User ${user.email} has invalid playerId: ${user.playerId}`)
        } else if (player.email.toLowerCase() !== user.email.toLowerCase()) {
          emailMismatches++
          console.log(`\n⚠️  Email mismatch: User ${user.email} linked to Player ${player.email}`)
        }
      }
      
      // Players without users
      const playersWithoutUsers = await Player.countDocuments({ 
        $or: [{ userId: null }, { userId: { $exists: false } }]
      })
      
      // Summary
      console.log('\n=== Summary ===')
      console.log(`Total Users (players): ${await User.countDocuments({ role: 'player' })}`)
      console.log(`Total Players: ${await Player.countDocuments()}`)
      console.log(`Users with invalid playerIds: ${invalidLinks}`)
      console.log(`Email mismatches: ${emailMismatches}`)
      console.log(`Players without linked users: ${playersWithoutUsers}`)
    }

  } catch (error) {
    console.error('Diagnostic failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

// Get email from command line argument
const email = process.argv[2]

// Run diagnostics
diagnoseLinkIssues(email)
