// Migration script to update existing activation tokens
// This script can be run to regenerate tokens for users who haven't activated yet

const mongoose = require('mongoose')
const crypto = require('crypto')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

// Define User schema inline (CommonJS style for scripts)
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'player'],
    default: 'player'
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  activationToken: {
    type: String,
    select: false,
    unique: true,
    sparse: true
  },
  activationTokenExpiry: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function migrateTokens() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    })
    
    console.log('✅ Connected to MongoDB')
    
    // Find all users with pending activation
    const pendingUsers = await User.find({
      emailVerified: false,
      role: 'player',
      activationToken: { $exists: true }
    }).select('+activationToken +activationTokenExpiry')
    
    console.log(`Found ${pendingUsers.length} users with pending activation`)
    
    let updated = 0
    let errors = 0
    
    for (const user of pendingUsers) {
      try {
        // Check if token is still valid
        if (user.activationTokenExpiry && user.activationTokenExpiry < new Date()) {
          console.log(`⏰ Token expired for ${user.email}, skipping...`)
          continue
        }
        
        // Generate new secure token
        const newToken = crypto.randomBytes(32).toString('base64url')
        
        // Update user with new token
        user.activationToken = newToken
        
        // Extend expiry if needed (7 days from now)
        if (!user.activationTokenExpiry || user.activationTokenExpiry < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
          user.activationTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
        
        await user.save()
        updated++
        
        console.log(`✅ Updated token for ${user.email}`)
      } catch (error) {
        console.error(`❌ Error updating ${user.email}:`, error.message)
        errors++
      }
    }
    
    console.log(`\n📊 Migration Summary:`)
    console.log(`- Total pending users: ${pendingUsers.length}`)
    console.log(`- Successfully updated: ${updated}`)
    console.log(`- Errors: ${errors}`)
    
  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
  }
}

// Run the migration
migrateTokens()
