#!/usr/bin/env node

// scripts/fixPlayerIndexes.js
// Quick database migration to fix Player model constraints for multi-league registration

import dbConnect from '../lib/db/mongoose.js'
import Player from '../lib/models/Player.js'

async function fixPlayerIndexes() {
  try {
    console.log('🚀 Starting Player index migration for multi-league registration...')
    
    // Connect to database
    await dbConnect()
    
    // Get the Player collection
    const collection = Player.collection
    
    console.log('📊 Checking current indexes...')
    const existingIndexes = await collection.indexes()
    console.log('Current indexes:')
    existingIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''}`)
    })
    console.log('')
    
    // Step 1: Drop the old unique email index if it exists
    let emailIndexDropped = false
    try {
      console.log('🗑️  Attempting to drop old email unique index...')
      await collection.dropIndex('email_1')
      emailIndexDropped = true
      console.log('✅ Dropped old email unique index')
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('ℹ️  Email unique index not found (already removed or never existed)')
      } else {
        console.error('❌ Error dropping email index:', error.message)
        // Don't throw - continue with creating new index
      }
    }
    
    // Step 2: Check for potential duplicate registrations that would prevent new index
    console.log('🔍 Checking for duplicate registrations...')
    const duplicates = await Player.aggregate([
      {
        $group: {
          _id: {
            email: '$email',
            league: '$league',
            season: '$season'
          },
          count: { $sum: 1 },
          docs: { $push: { _id: '$_id', name: '$name' } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ])
    
    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate registrations that need resolution:')
      duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. Email: ${dup._id.email}, League: ${dup._id.league}, Season: ${dup._id.season}`)
        console.log(`   ${dup.count} duplicates: ${dup.docs.map(d => `${d.name} (${d._id})`).join(', ')}`)
      })
      console.log('')
      console.log('❌ Cannot create unique index with existing duplicates.')
      console.log('Please resolve these duplicates manually and run the script again.')
      console.log('You can remove duplicates or update their league/season values.')
      return
    } else {
      console.log('✅ No duplicate registrations found')
    }
    
    // Step 3: Create the new compound unique index
    let compoundIndexCreated = false
    try {
      console.log('🔧 Creating compound unique index (email + league + season)...')
      await collection.createIndex(
        { email: 1, league: 1, season: 1 }, 
        { 
          unique: true,
          name: 'email_league_season_unique'
        }
      )
      compoundIndexCreated = true
      console.log('✅ Created compound unique index for email + league + season')
    } catch (error) {
      if (error.code === 85 || error.message.includes('already exists')) {
        console.log('ℹ️  Compound unique index already exists')
        compoundIndexCreated = true
      } else {
        console.error('❌ Error creating compound index:', error.message)
        
        // If we dropped the email index but can't create the new one, this is a problem
        if (emailIndexDropped && !compoundIndexCreated) {
          console.log('🚨 WARNING: Email index was dropped but compound index creation failed!')
          console.log('   Database is in inconsistent state - manual intervention required')
        }
        throw error
      }
    }
    
    // Step 4: Verify the changes
    console.log('📊 Final index status:')
    const finalIndexes = await collection.indexes()
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''}`)
    })
    
    // Step 5: Test the new constraints
    console.log('')
    console.log('🧪 Testing new constraint behavior...')
    
    const testEmail = 'test+indexmigration@example.com'
    const testResults = {
      sameLeagueSameSeason: false,
      sameLeagueDifferentSeason: false,
      differentLeague: false
    }
    
    // Get sample data for testing
    const samplePlayer = await Player.findOne().populate('league')
    if (samplePlayer) {
      const leagueId = samplePlayer.league._id
      const season = samplePlayer.season
      const differentSeason = season === 'summer-2025' ? 'winter-2025' : 'summer-2025'
      
      // Test 1: Create first registration
      try {
        const testPlayer1 = new Player({
          name: 'Test Player 1',
          email: testEmail,
          whatsapp: '+34600000000',
          level: 'intermediate',
          league: leagueId,
          season: season
        })
        await testPlayer1.save()
        console.log('✅ Test 1 passed: First registration created successfully')
        
        // Test 2: Try same league, same season (should fail)
        try {
          const testPlayer2 = new Player({
            name: 'Test Player 2',
            email: testEmail,
            whatsapp: '+34600000001',
            level: 'advanced',
            league: leagueId,
            season: season
          })
          await testPlayer2.save()
          console.log('❌ Test 2 failed: Duplicate registration was allowed (this should not happen)')
        } catch (dupError) {
          if (dupError.code === 11000) {
            console.log('✅ Test 2 passed: Duplicate registration correctly blocked')
            testResults.sameLeagueSameSeason = true
          }
        }
        
        // Test 3: Try same league, different season (should work)
        try {
          const testPlayer3 = new Player({
            name: 'Test Player 3',
            email: testEmail,
            whatsapp: '+34600000002',
            level: 'beginner',
            league: leagueId,
            season: differentSeason
          })
          await testPlayer3.save()
          console.log('✅ Test 3 passed: Same email, different season allowed')
          testResults.sameLeagueDifferentSeason = true
          
          // Clean up test 3
          await Player.deleteOne({ _id: testPlayer3._id })
        } catch (error) {
          console.log('❌ Test 3 failed: Same email, different season should be allowed')
        }
        
        // Clean up test 1
        await Player.deleteOne({ _id: testPlayer1._id })
        
      } catch (error) {
        console.log('⚠️  Could not run full test suite:', error.message)
      }
    } else {
      console.log('ℹ️  No existing players found for testing')
    }
    
    console.log('')
    console.log('🎉 Index migration completed successfully!')
    console.log('')
    console.log('✅ What was fixed:')
    console.log('   - Removed global email uniqueness constraint')
    console.log('   - Added compound unique constraint (email + league + season)')
    console.log('   - Existing users can now register for multiple leagues')
    console.log('   - Duplicate registrations within same league/season still prevented')
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Deploy the updated Player.js model')
    console.log('2. Deploy the updated registration API')  
    console.log('3. Test registration with existing users')
    console.log('4. Monitor registration success rates')
    
  } catch (error) {
    console.error('💥 Index migration failed:', error)
    console.log('')
    console.log('🔄 Recovery steps:')
    console.log('1. Check database connection')
    console.log('2. Verify no duplicate registrations exist')
    console.log('3. Run this script again')
    console.log('4. If problems persist, restore from backup and contact support')
    throw error
  }
}

// Rollback function in case we need to revert
async function rollbackIndexes() {
  try {
    console.log('🔄 Rolling back index changes...')
    
    await dbConnect()
    const collection = Player.collection
    
    // Drop compound index
    try {
      await collection.dropIndex('email_league_season_unique')
      console.log('✅ Dropped compound unique index')
    } catch (error) {
      console.log('ℹ️  Compound index not found')
    }
    
    // Recreate email unique index
    try {
      await collection.createIndex({ email: 1 }, { unique: true })
      console.log('✅ Recreated email unique index')
    } catch (error) {
      console.log('❌ Could not recreate email unique index:', error.message)
    }
    
    console.log('🎉 Rollback completed')
    
  } catch (error) {
    console.error('💥 Rollback failed:', error)
    throw error
  }
}

// Command line interface
if (process.argv[1].endsWith('fixPlayerIndexes.js')) {
  const command = process.argv[2]
  
  if (command === 'rollback') {
    rollbackIndexes()
      .then(() => {
        console.log('✅ Rollback completed successfully')
        process.exit(0)
      })
      .catch(() => process.exit(1))
  } else {
    fixPlayerIndexes()
      .then(() => {
        console.log('✅ Index migration completed successfully')
        console.log('Run "node scripts/fixPlayerIndexes.js rollback" if you need to revert')
        process.exit(0)
      })
      .catch(() => process.exit(1))
  }
}

export { fixPlayerIndexes, rollbackIndexes }
