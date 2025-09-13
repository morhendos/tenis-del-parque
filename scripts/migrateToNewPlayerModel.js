#!/usr/bin/env node

// scripts/migrateToNewPlayerModel.js
// CRITICAL: This script migrates from old structure (multiple Player docs per email) 
// to new structure (one Player doc with registrations array)

const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Database connection function
async function dbConnect() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env.local')
  }
  
  if (mongoose.connections[0].readyState) {
    return
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

// Define the OLD Player schema for migration purposes
const OldPlayerSchema = new mongoose.Schema({
  name: String,
  email: String,
  whatsapp: String,
  level: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
  season: String,
  registeredAt: Date,
  status: String,
  notes: String,
  metadata: {
    language: String,
    source: String,
    userAgent: String,
    ipAddress: String
  },
  stats: {
    matchesPlayed: Number,
    matchesWon: Number,
    totalPoints: Number,
    eloRating: Number,
    highestElo: Number,
    lowestElo: Number,
    setsWon: Number,
    setsLost: Number,
    gamesWon: Number,
    gamesLost: Number,
    retirements: Number,
    walkovers: Number
  },
  matchHistory: Array,
  wildCards: {
    total: Number,
    used: Number,
    history: Array
  },
  preferences: {
    emailNotifications: Boolean,
    whatsappNotifications: Boolean
  }
}, { collection: 'players' }) // Explicitly use existing collection

const OldPlayer = mongoose.model('OldPlayer', OldPlayerSchema)

// Define a minimal League schema for population purposes
const LeagueSchema = new mongoose.Schema({
  name: String,
  slug: String,
  skillLevel: String,
  season: {
    year: Number,
    type: String,
    number: Number
  },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  location: {
    city: String,
    area: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: String,
  // Add other fields as needed for migration
}, { collection: 'leagues' })

const League = mongoose.model('League', LeagueSchema)

// Define the NEW Player schema
const NewPlayerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  whatsapp: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registrations: [{
    league: { type: mongoose.Schema.Types.ObjectId, ref: 'League' },
    season: String,
    level: String,
    registeredAt: Date,
    status: String,
    stats: {
      matchesPlayed: Number,
      matchesWon: Number,
      totalPoints: Number,
      eloRating: Number,
      highestElo: Number,
      lowestElo: Number,
      setsWon: Number,
      setsLost: Number,
      gamesWon: Number,
      gamesLost: Number,
      retirements: Number,
      walkovers: Number
    },
    matchHistory: Array,
    wildCards: {
      total: Number,
      used: Number,
      history: Array
    },
    notes: String
  }],
  preferences: {
    emailNotifications: Boolean,
    whatsappNotifications: Boolean,
    preferredLanguage: String
  },
  metadata: {
    source: String,
    userAgent: String,
    ipAddress: String,
    firstRegistrationDate: Date
  }
}, { 
  collection: 'players_new',
  timestamps: true 
})

const NewPlayer = mongoose.model('NewPlayer', NewPlayerSchema)

async function migratePlayerModel() {
  try {
    console.log('🚀 Starting Player model migration...')
    console.log('⚠️  IMPORTANT: This will restructure your player data!')
    console.log('   Old: Multiple Player documents per email (one per league)')
    console.log('   New: One Player document per email with registrations array')
    console.log('')
    
    // Connect to database
    await dbConnect()
    
    // Step 1: Analyze current data
    console.log('📊 Analyzing current data structure...')
    const totalOldPlayers = await OldPlayer.countDocuments()
    const uniqueEmails = await OldPlayer.distinct('email')
    const duplicateEmails = await OldPlayer.aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ])
    
    console.log(`   Total player documents: ${totalOldPlayers}`)
    console.log(`   Unique emails: ${uniqueEmails.length}`)
    console.log(`   Emails with multiple registrations: ${duplicateEmails.length}`)
    
    if (duplicateEmails.length > 0) {
      console.log('   Top multi-league players:')
      duplicateEmails.slice(0, 5).forEach(dup => {
        console.log(`     ${dup._id}: ${dup.count} leagues`)
      })
    }
    console.log('')
    
    // Step 2: Create backup
    console.log('💾 Creating backup of original data...')
    const backupCollection = `players_backup_${Date.now()}`
    await OldPlayer.collection.aggregate([
      { $out: backupCollection }
    ]).toArray()
    console.log(`✅ Backup created: ${backupCollection}`)
    console.log('')
    
    // Step 3: Clear new collection if it exists
    console.log('🧹 Preparing new collection...')
    await NewPlayer.deleteMany({})
    console.log('✅ New collection cleared')
    console.log('')
    
    // Step 4: Group players by email and migrate
    console.log('🔄 Migrating players...')
    let migratedCount = 0
    let errorCount = 0
    
    for (const email of uniqueEmails) {
      try {
        // Get all registrations for this email
        const playerRegistrations = await OldPlayer.find({ email }).populate('league')
        
        if (playerRegistrations.length === 0) continue
        
        // Use the first registration as the base player info
        const basePlayer = playerRegistrations[0]
        
        // Create the new player document
        const newPlayerData = {
          name: basePlayer.name,
          email: basePlayer.email.toLowerCase(),
          whatsapp: basePlayer.whatsapp,
          userId: basePlayer.userId,
          registrations: playerRegistrations.map(reg => ({
            league: reg.league._id,
            season: reg.season || 'summer-2025',
            level: reg.level,
            registeredAt: reg.registeredAt || new Date(),
            status: reg.status || 'pending',
            stats: reg.stats || {
              matchesPlayed: 0,
              matchesWon: 0,
              totalPoints: 0,
              eloRating: getInitialEloByLevel(reg.level),
              highestElo: getInitialEloByLevel(reg.level),
              lowestElo: getInitialEloByLevel(reg.level),
              setsWon: 0,
              setsLost: 0,
              gamesWon: 0,
              gamesLost: 0,
              retirements: 0,
              walkovers: 0
            },
            matchHistory: reg.matchHistory || [],
            wildCards: reg.wildCards || { total: 3, used: 0, history: [] },
            notes: reg.notes || ''
          })),
          preferences: {
            emailNotifications: basePlayer.preferences?.emailNotifications ?? true,
            whatsappNotifications: basePlayer.preferences?.whatsappNotifications ?? true,
            preferredLanguage: basePlayer.metadata?.language || 'es'
          },
          metadata: {
            source: basePlayer.metadata?.source || 'web',
            userAgent: basePlayer.metadata?.userAgent || '',
            ipAddress: basePlayer.metadata?.ipAddress || '',
            firstRegistrationDate: basePlayer.registeredAt || new Date()
          }
        }
        
        // Create new player
        const newPlayer = new NewPlayer(newPlayerData)
        await newPlayer.save()
        
        migratedCount++
        
        if (migratedCount % 10 === 0) {
          console.log(`   Migrated ${migratedCount}/${uniqueEmails.length} players...`)
        }
        
      } catch (error) {
        console.error(`❌ Error migrating ${email}:`, error.message)
        errorCount++
      }
    }
    
    console.log('')
    console.log(`✅ Migration completed!`)
    console.log(`   Successfully migrated: ${migratedCount} players`)
    console.log(`   Errors: ${errorCount}`)
    console.log('')
    
    // Step 5: Verify migration
    console.log('🔍 Verifying migration...')
    const newPlayerCount = await NewPlayer.countDocuments()
    const totalRegistrations = await NewPlayer.aggregate([
      { $unwind: '$registrations' },
      { $count: 'total' }
    ])
    
    console.log(`   New player documents: ${newPlayerCount}`)
    console.log(`   Total registrations: ${totalRegistrations[0]?.total || 0}`)
    console.log(`   Expected registrations: ${totalOldPlayers}`)
    
    if (totalRegistrations[0]?.total === totalOldPlayers) {
      console.log('✅ Registration count matches - migration successful!')
    } else {
      console.log('⚠️  Registration count mismatch - please review')
    }
    console.log('')
    
    // Step 6: Test the new structure
    console.log('🧪 Testing new structure...')
    const samplePlayer = await NewPlayer.findOne({ 'registrations.1': { $exists: true } })
    if (samplePlayer) {
      console.log(`   Sample multi-league player: ${samplePlayer.email}`)
      console.log(`   Registered leagues: ${samplePlayer.registrations.length}`)
      samplePlayer.registrations.forEach((reg, i) => {
        console.log(`     ${i + 1}. League: ${reg.league}, Season: ${reg.season}, Level: ${reg.level}`)
      })
    }
    console.log('')
    
    // Step 7: Test new Player model methods
    console.log('🧪 Testing new Player model methods...')
    if (samplePlayer) {
      // Test getLeagueRegistration method
      const firstReg = samplePlayer.registrations[0]
      const foundReg = samplePlayer.getLeagueRegistration(firstReg.league, firstReg.season)
      console.log(`   getLeagueRegistration: ${foundReg ? '✅ Working' : '❌ Failed'}`)
      
      // Test canParticipateInLeague method
      const canParticipate = samplePlayer.canParticipateInLeague(firstReg.league, firstReg.season)
      console.log(`   canParticipateInLeague: ${canParticipate !== undefined ? '✅ Working' : '❌ Failed'}`)
    }
    console.log('')
    
    // Step 8: Instructions for final cutover
    console.log('📋 NEXT STEPS:')
    console.log('1. ✅ Data migrated successfully to players_new collection')
    console.log('2. 🧪 Test the new API endpoints with the migrated data')
    console.log('3. 🔄 Update any other code that queries Player model:')
    console.log('   - Admin panels (player management)')
    console.log('   - Match generation (finding players by league)')
    console.log('   - Standings calculations')
    console.log('   - Player dashboard queries')
    console.log('4. 🚀 When ready, perform cutover:')
    console.log('   Run: node scripts/migrateToNewPlayerModel.js cutover')
    console.log('5. 🧹 Clean up old backup collections when confident')
    console.log('')
    console.log(`💾 Your original data is safely backed up in: ${backupCollection}`)
    console.log('🔄 You can rollback anytime with: node scripts/migrateToNewPlayerModel.js rollback')
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    throw error
  }
}

// Helper function
function getInitialEloByLevel(level) {
  const eloRatings = {
    'beginner': 1180,
    'intermediate': 1200,
    'advanced': 1250
  }
  return eloRatings[level] || 1200
}

// Cutover function to swap collections
async function performCutover() {
  try {
    console.log('🔄 Performing database cutover...')
    
    await dbConnect()
    const db = mongoose.connection.db
    
    // Verify new collection exists and has data
    const newCount = await db.collection('players_new').countDocuments()
    if (newCount === 0) {
      throw new Error('New collection is empty - run migration first')
    }
    
    console.log(`   New collection has ${newCount} players`)
    
    // Rename original collection to backup
    await db.collection('players').rename('players_old')
    console.log('✅ Renamed players → players_old')
    
    // Rename new collection to main
    await db.collection('players_new').rename('players')
    console.log('✅ Renamed players_new → players')
    
    console.log('🎉 Cutover completed! New structure is now active.')
    console.log('')
    console.log('🧪 Please test:')
    console.log('- Player registration for existing users')
    console.log('- Admin player management')
    console.log('- Match generation')
    console.log('- Player dashboard')
    
  } catch (error) {
    console.error('💥 Cutover failed:', error)
    throw error
  }
}

// Rollback function in case we need to revert
async function rollbackMigration() {
  try {
    console.log('🔄 Rolling back to old Player model...')
    
    await dbConnect()
    const db = mongoose.connection.db
    
    // Check if backup exists
    const collections = await db.listCollections().toArray()
    const hasBackup = collections.some(col => col.name === 'players_old')
    
    if (!hasBackup) {
      throw new Error('No backup found (players_old) - cannot rollback')
    }
    
    // Rename current to temporary
    await db.collection('players').rename('players_new_temp')
    console.log('✅ Moved current players → players_new_temp')
    
    // Restore backup to main
    await db.collection('players_old').rename('players')
    console.log('✅ Restored players_old → players')
    
    console.log('🎉 Rollback completed! Old structure is now active.')
    console.log('')
    console.log('⚠️  The new structure data is preserved in players_new_temp')
    console.log('   You can migrate again when ready')
    
  } catch (error) {
    console.error('💥 Rollback failed:', error)
    throw error
  }
}

// Command line interface
if (process.argv[1].endsWith('migrateToNewPlayerModel.js')) {
  const command = process.argv[2]
  
  if (command === 'cutover') {
    performCutover()
      .then(() => {
        console.log('✅ Cutover completed successfully')
        process.exit(0)
      })
      .catch(() => process.exit(1))
  } else if (command === 'rollback') {
    rollbackMigration()
      .then(() => {
        console.log('✅ Rollback completed successfully')
        process.exit(0)
      })
      .catch(() => process.exit(1))
  } else {
    migratePlayerModel()
      .then(() => {
        console.log('✅ Migration completed successfully')
        console.log('Next: Review data, update dependent code, then run cutover')
        process.exit(0)
      })
      .catch(() => process.exit(1))
  }
}

module.exports = { migratePlayerModel, performCutover, rollbackMigration }
