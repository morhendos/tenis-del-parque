#!/usr/bin/env node

/**
 * Script to fix mismatched Player-User links
 * This handles cases where Users have playerId pointing to wrong/non-existent Players
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Player from '../lib/models/Player.js'
import User from '../lib/models/User.js'

// Load environment variables
dotenv.config()

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL

async function fixMismatchedLinks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find all users with playerIds
    const usersWithPlayerIds = await User.find({ 
      playerId: { $exists: true, $ne: null }
    })
    
    console.log(`Found ${usersWithPlayerIds.length} users with playerIds`)
    
    let fixed = 0
    let alreadyCorrect = 0
    let orphaned = 0

    for (const user of usersWithPlayerIds) {
      console.log(`\nChecking user: ${user.email}`)
      
      // Check if the linked player exists
      const linkedPlayer = await Player.findById(user.playerId)
      
      if (!linkedPlayer) {
        console.log(`  ❌ Linked player ${user.playerId} not found!`)
        orphaned++
        
        // Find the correct player by email
        const correctPlayer = await Player.findOne({ email: user.email.toLowerCase() })
        
        if (correctPlayer) {
          console.log(`  ✅ Found correct player by email: ${correctPlayer._id}`)
          
          // Update user to point to correct player
          user.playerId = correctPlayer._id
          await user.save()
          console.log(`  ✅ Updated user.playerId to ${correctPlayer._id}`)
          
          // Update player to point to user
          correctPlayer.userId = user._id
          await correctPlayer.save()
          console.log(`  ✅ Updated player.userId to ${user._id}`)
          
          fixed++
        } else {
          console.log(`  ❌ No player found with email ${user.email}`)
          // Remove the invalid playerId
          user.playerId = null
          await user.save()
          console.log(`  ⚠️  Removed invalid playerId from user`)
        }
      } else {
        // Player exists, check if emails match
        if (linkedPlayer.email.toLowerCase() !== user.email.toLowerCase()) {
          console.log(`  ⚠️  Email mismatch! User: ${user.email}, Player: ${linkedPlayer.email}`)
          
          // Find the correct player by email
          const correctPlayer = await Player.findOne({ email: user.email.toLowerCase() })
          
          if (correctPlayer && !correctPlayer._id.equals(linkedPlayer._id)) {
            console.log(`  ✅ Found correct player by email: ${correctPlayer._id}`)
            
            // Update user to point to correct player
            user.playerId = correctPlayer._id
            await user.save()
            console.log(`  ✅ Updated user.playerId to ${correctPlayer._id}`)
            
            // Update player to point to user
            correctPlayer.userId = user._id
            await correctPlayer.save()
            console.log(`  ✅ Updated player.userId to ${user._id}`)
            
            // Clear the old player's userId if it points to this user
            if (linkedPlayer.userId && linkedPlayer.userId.equals(user._id)) {
              linkedPlayer.userId = null
              await linkedPlayer.save()
              console.log(`  ✅ Cleared userId from old player ${linkedPlayer._id}`)
            }
            
            fixed++
          }
        } else {
          // Emails match, ensure bidirectional link
          if (!linkedPlayer.userId || !linkedPlayer.userId.equals(user._id)) {
            linkedPlayer.userId = user._id
            await linkedPlayer.save()
            console.log(`  ✅ Fixed missing userId on player`)
            fixed++
          } else {
            console.log(`  ✅ Link is correct`)
            alreadyCorrect++
          }
        }
      }
    }

    // Also check for players without users
    console.log('\n\nChecking for players without linked users...')
    const playersWithoutUsers = await Player.find({ 
      $or: [
        { userId: null },
        { userId: { $exists: false } }
      ]
    })

    console.log(`Found ${playersWithoutUsers.length} players without users`)

    for (const player of playersWithoutUsers) {
      const user = await User.findOne({ email: player.email.toLowerCase() })
      
      if (user) {
        console.log(`\nFound user for player ${player.name} (${player.email})`)
        
        // Check if user already has a different player
        if (user.playerId && !user.playerId.equals(player._id)) {
          const existingPlayer = await Player.findById(user.playerId)
          if (existingPlayer) {
            console.log(`  ⚠️  User already linked to different player: ${existingPlayer.name}`)
            continue
          }
        }
        
        // Link them
        user.playerId = player._id
        await user.save()
        player.userId = user._id
        await player.save()
        console.log(`  ✅ Linked player and user`)
        fixed++
      }
    }

    console.log('\n=== Summary ===')
    console.log(`✅ Fixed: ${fixed} player-user pairs`)
    console.log(`✅ Already correct: ${alreadyCorrect} pairs`)
    console.log(`❌ Orphaned playerIds removed: ${orphaned}`)
    
    // Final verification
    console.log('\n=== Final Verification ===')
    const totalUsers = await User.countDocuments({ role: 'player' })
    const linkedUsers = await User.countDocuments({ playerId: { $ne: null }, role: 'player' })
    const totalPlayers = await Player.countDocuments()
    const linkedPlayers = await Player.countDocuments({ userId: { $ne: null } })
    
    console.log(`Users: ${linkedUsers}/${totalUsers} linked`)
    console.log(`Players: ${linkedPlayers}/${totalPlayers} linked`)

    // Show any remaining issues
    const remainingIssues = await User.aggregate([
      {
        $match: { 
          role: 'player',
          playerId: { $ne: null }
        }
      },
      {
        $lookup: {
          from: 'players',
          localField: 'playerId',
          foreignField: '_id',
          as: 'player'
        }
      },
      {
        $match: {
          $or: [
            { player: { $size: 0 } },
            { $expr: { $ne: ['$email', { $arrayElemAt: ['$player.email', 0] }] } }
          ]
        }
      }
    ])
    
    if (remainingIssues.length > 0) {
      console.log(`\n⚠️  Found ${remainingIssues.length} remaining issues:`)
      for (const issue of remainingIssues) {
        console.log(`  - User ${issue.email} has issues with playerId ${issue.playerId}`)
      }
    }

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the fix
fixMismatchedLinks()
