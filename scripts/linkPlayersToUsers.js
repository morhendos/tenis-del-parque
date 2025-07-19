#!/usr/bin/env node

/**
 * Migration script to link existing Players with Users
 * This script finds Players and Users with matching emails and creates the bidirectional link
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Player from '../lib/models/Player.js'
import User from '../lib/models/User.js'

// Load environment variables
dotenv.config()

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL

async function linkPlayersToUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find all players without a userId
    const playersWithoutUsers = await Player.find({ 
      $or: [
        { userId: null },
        { userId: { $exists: false } }
      ]
    })
    
    console.log(`Found ${playersWithoutUsers.length} players without linked users`)

    let linked = 0
    let notFound = 0
    let alreadyLinked = 0

    for (const player of playersWithoutUsers) {
      console.log(`\nProcessing player: ${player.name} (${player.email})`)
      
      // Find user with matching email
      const user = await User.findOne({ email: player.email.toLowerCase() })
      
      if (!user) {
        console.log(`  ❌ No user found with email: ${player.email}`)
        notFound++
        continue
      }

      // Check if user already has a different player linked
      if (user.playerId && !user.playerId.equals(player._id)) {
        console.log(`  ⚠️  User already linked to different player: ${user.playerId}`)
        alreadyLinked++
        continue
      }

      // Link player to user
      player.userId = user._id
      await player.save()
      console.log(`  ✅ Linked player to user: ${user._id}`)

      // Link user to player
      if (!user.playerId || !user.playerId.equals(player._id)) {
        user.playerId = player._id
        await user.save()
        console.log(`  ✅ Linked user to player: ${player._id}`)
      }

      linked++
    }

    // Also check for users without players
    console.log('\nChecking for users without linked players...')
    const usersWithoutPlayers = await User.find({ 
      $or: [
        { playerId: null },
        { playerId: { $exists: false } }
      ],
      role: 'player' // Only check player role users
    })

    console.log(`Found ${usersWithoutPlayers.length} users without linked players`)

    for (const user of usersWithoutPlayers) {
      console.log(`\nProcessing user: ${user.email}`)
      
      // Find player with matching email
      const player = await Player.findOne({ email: user.email.toLowerCase() })
      
      if (!player) {
        console.log(`  ❌ No player found with email: ${user.email}`)
        continue
      }

      // Link user to player
      user.playerId = player._id
      await user.save()
      console.log(`  ✅ Linked user to player: ${player._id}`)

      // Link player to user if not already linked
      if (!player.userId || !player.userId.equals(user._id)) {
        player.userId = user._id
        await player.save()
        console.log(`  ✅ Linked player to user: ${user._id}`)
      }

      linked++
    }

    console.log('\n=== Migration Summary ===')
    console.log(`✅ Successfully linked: ${linked} player-user pairs`)
    console.log(`❌ Users not found: ${notFound}`)
    console.log(`⚠️  Already linked to different player: ${alreadyLinked}`)
    
    // Verify the links
    console.log('\n=== Verification ===')
    const totalPlayers = await Player.countDocuments()
    const linkedPlayers = await Player.countDocuments({ userId: { $ne: null } })
    const totalUsers = await User.countDocuments({ role: 'player' })
    const linkedUsers = await User.countDocuments({ playerId: { $ne: null }, role: 'player' })
    
    console.log(`Players: ${linkedPlayers}/${totalPlayers} linked`)
    console.log(`Users: ${linkedUsers}/${totalUsers} linked`)

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the migration
linkPlayersToUsers()
