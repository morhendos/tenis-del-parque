#!/usr/bin/env node

// scripts/fixSeenAnnouncements.js
// Fix seen announcements for users created during migration

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function fixSeenAnnouncements() {
  try {
    console.log('🔧 Fixing seen announcements for migrated users...')
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const db = mongoose.connection.db
    
    // Get all users
    const users = await db.collection('users').find({}).toArray()
    console.log(`📊 Found ${users.length} users`)
    
    // Common announcement IDs that should be marked as seen for existing users
    // These are announcements that were likely shown before the migration
    const commonAnnouncementIds = [
      'registration-closed-2025',
      'first-round-delay-2025',
      'first-round-match-2025',
      // Add more IDs as needed
    ]
    
    let updatedUsers = 0
    
    for (const user of users) {
      // Check if user has empty or very few seen announcements
      const currentSeen = user.seenAnnouncements || []
      
      if (currentSeen.length === 0) {
        // User has no seen announcements - likely a migrated user
        console.log(`🔄 Updating seen announcements for ${user.email}`)
        
        await db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { 
              seenAnnouncements: commonAnnouncementIds
            } 
          }
        )
        updatedUsers++
      } else {
        // User already has some seen announcements, just add missing common ones
        const missingCommon = commonAnnouncementIds.filter(id => !currentSeen.includes(id))
        
        if (missingCommon.length > 0) {
          console.log(`➕ Adding ${missingCommon.length} missing announcements for ${user.email}`)
          
          await db.collection('users').updateOne(
            { _id: user._id },
            { 
              $addToSet: { 
                seenAnnouncements: { $each: missingCommon }
              }
            }
          )
          updatedUsers++
        }
      }
    }
    
    console.log('')
    console.log(`✅ Fix completed!`)
    console.log(`   Updated users: ${updatedUsers}`)
    console.log(`   Common announcements marked as seen: ${commonAnnouncementIds.length}`)
    console.log('')
    console.log('🔄 The "new" badge should now be removed from the Messages menu')
    console.log('   Users will only see new announcements going forward')
    
    process.exit(0)
  } catch (error) {
    console.error('💥 Fix failed:', error)
    process.exit(1)
  }
}

// Run the fix
if (require.main === module) {
  fixSeenAnnouncements()
}

module.exports = { fixSeenAnnouncements }
