#!/usr/bin/env node

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const readline = require('readline')
const bcrypt = require('bcryptjs')

// Load environment variables
dotenv.config({ path: '.env.local' })

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
    select: false // Don't include password in queries by default
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

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) return next()
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Helper function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

// Helper function to prompt for password (with hidden input)
const promptPassword = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (password) => {
      console.log() // New line after password
      resolve(password)
    })
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.line.length === 0) {
        rl.output.write(stringToWrite)
      } else {
        rl.output.write('*')
      }
    }
  })
}

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables')
    }

    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Check if any admin users already exist
    const existingAdminCount = await User.countDocuments({ role: 'admin' })
    if (existingAdminCount > 0) {
      console.log(`\n⚠️  Warning: ${existingAdminCount} admin user(s) already exist in the database.`)
      const proceed = await prompt('Do you want to create another admin user? (yes/no): ')
      if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
        console.log('Exiting...')
        process.exit(0)
      }
    }

    console.log('\n🎾 Tennis del Parque - Create Admin User')
    console.log('=====================================\n')

    // Prompt for admin details
    const email = await prompt('Admin email: ')
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log('\n❌ Error: A user with this email already exists.')
      process.exit(1)
    }

    const password = await promptPassword('Admin password (min 8 characters): ')
    
    // Validate password
    if (password.length < 8) {
      console.log('\n❌ Error: Password must be at least 8 characters long.')
      process.exit(1)
    }

    const confirmPassword = await promptPassword('Confirm password: ')
    
    if (password !== confirmPassword) {
      console.log('\n❌ Error: Passwords do not match.')
      process.exit(1)
    }

    // Create the admin user
    console.log('\n📝 Creating admin user...')
    
    const adminUser = new User({
      email: email.toLowerCase(),
      password,
      role: 'admin',
      isActive: true,
      emailVerified: true // Auto-verify admin accounts
    })

    await adminUser.save()

    console.log('\n✅ Admin user created successfully!')
    console.log('=====================================')
    console.log(`Email: ${adminUser.email}`)
    console.log(`Role: ${adminUser.role}`)
    console.log(`ID: ${adminUser._id}`)
    console.log('\nYou can now log in to the admin panel at /admin')

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message)
    process.exit(1)
  } finally {
    // Close connections
    rl.close()
    await mongoose.connection.close()
  }
}

// Run the script
createAdminUser()
