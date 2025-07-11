const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Define User schema (since we can't import the model directly in CommonJS)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
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
  
  lastLogin: {
    type: Date,
    default: null
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date,
    default: null
  },
  
  preferences: {
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    }
  }
}, {
  timestamps: true
})

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Method to unlock account
userSchema.methods.unlockAccount = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  })
}

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function unlockAllAccounts() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tenis-del-parque')
    
    console.log('Connected to database')
    
    // Find all locked accounts
    const lockedUsers = await User.find({
      lockUntil: { $exists: true, $ne: null }
    })
    
    console.log(`Found ${lockedUsers.length} locked accounts`)
    
    if (lockedUsers.length === 0) {
      console.log('No locked accounts found')
      return
    }
    
    // Unlock all accounts
    let unlockedCount = 0
    for (const user of lockedUsers) {
      try {
        await user.unlockAccount()
        console.log(`✓ Unlocked account: ${user.email}`)
        unlockedCount++
      } catch (error) {
        console.error(`✗ Failed to unlock ${user.email}:`, error.message)
      }
    }
    
    console.log(`\nSuccessfully unlocked ${unlockedCount} out of ${lockedUsers.length} accounts`)
    
  } catch (error) {
    console.error('Error unlocking accounts:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Database connection closed')
  }
}

async function unlockSpecificAccount(email) {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tenis-del-parque')
    
    console.log('Connected to database')
    
    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.log(`User not found: ${email}`)
      return
    }
    
    if (!user.isLocked) {
      console.log(`Account is not locked: ${email}`)
      return
    }
    
    // Unlock the account
    await user.unlockAccount()
    console.log(`✓ Successfully unlocked account: ${email}`)
    
  } catch (error) {
    console.error('Error unlocking account:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Database connection closed')
  }
}

// Check command line arguments
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('Usage:')
  console.log('  npm run unlock-accounts         # Unlock all locked accounts')
  console.log('  npm run unlock-accounts <email> # Unlock specific account')
  process.exit(1)
}

if (args[0] === 'all' || args.length === 0) {
  unlockAllAccounts()
} else {
  unlockSpecificAccount(args[0])
} 