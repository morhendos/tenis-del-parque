import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

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
  
  // Link to Player model
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Activation/Invitation
  activationToken: {
    type: String,
    select: false,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when set
  },
  
  activationTokenExpiry: {
    type: Date,
    select: false
  },
  
  // Password reset
  resetPasswordToken: {
    type: String,
    select: false
  },
  
  resetPasswordExpiry: {
    type: Date,
    select: false
  },
  
  // Login tracking
  lastLogin: {
    type: Date,
    default: null
  },
  
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date,
    default: null
  },
  
  // Preferences
  preferences: {
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    },
    hasSeenWelcomeModal: {
      type: Boolean,
      default: false
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      matchReminders: {
        type: Boolean,
        default: true
      },
      resultReminders: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Announcements tracking
  seenAnnouncements: {
    type: [String],
    default: []
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Indexes (email index is created automatically by unique: true)
userSchema.index({ playerId: 1 })
// activationToken index is created automatically by unique: true
userSchema.index({ resetPasswordToken: 1 })

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
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

// Update the updatedAt timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = async function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    })
  }
  
  const updates = { $inc: { loginAttempts: 1 } }
  
  // Lock account after 10 attempts for 15 minutes (more user-friendly)
  const maxAttempts = 10
  const lockTime = 15 * 60 * 1000 // 15 minutes
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + lockTime) }
  }
  
  return this.updateOne(updates)
}

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  })
}

// Method to manually unlock account (for admins)
userSchema.methods.unlockAccount = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  })
}

// Method to get lock status info
userSchema.methods.getLockInfo = function() {
  if (!this.isLocked) {
    return null
  }
  
  const remainingTime = this.lockUntil - Date.now()
  const remainingMinutes = Math.ceil(remainingTime / (60 * 1000))
  
  return {
    isLocked: true,
    lockUntil: this.lockUntil,
    remainingMinutes: remainingMinutes,
    attempts: this.loginAttempts
  }
}

// Method to generate activation token - Simplified for tennis league
userSchema.methods.generateActivationToken = async function() {
  // For a tennis league, we can use a simpler approach
  // Generate a random 6-character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  
  // Keep trying until we get a unique token
  let tokenExists = true
  let attempts = 0
  const maxAttempts = 10
  
  while (tokenExists && attempts < maxAttempts) {
    // Generate a 6-character token
    token = ''
    for (let i = 0; i < 6; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    
    // Check if this token already exists
    const existingUser = await mongoose.models.User.findOne({ 
      activationToken: token,
      _id: { $ne: this._id } // Exclude current user
    })
    
    tokenExists = !!existingUser
    attempts++
  }
  
  if (attempts >= maxAttempts) {
    // Fallback to timestamp-based token if we can't generate unique one
    token = 'T' + Date.now().toString(36).toUpperCase().slice(-5)
  }
  
  // Set token and expiry (7 days)
  this.activationToken = token
  this.activationTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  return token
}

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  // Similar approach for password reset
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = 'R' // Prefix with R for Reset
  
  for (let i = 0; i < 5; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  
  // Set token and expiry (1 hour)
  this.resetPasswordToken = token
  this.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000)
  
  return token
}

// Method to mark announcement as seen
userSchema.methods.markAnnouncementSeen = async function(announcementId) {
  if (!this.seenAnnouncements.includes(announcementId)) {
    this.seenAnnouncements.push(announcementId)
    return this.save()
  }
  return this
}

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password')
}

// Static method to find by activation token
userSchema.statics.findByActivationToken = function(token) {
  return this.findOne({
    activationToken: token,
    activationTokenExpiry: { $gt: Date.now() }
  }).select('+activationToken +activationTokenExpiry')
}

// Static method to find by reset token
userSchema.statics.findByResetToken = function(token) {
  return this.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() }
  }).select('+resetPasswordToken +resetPasswordExpiry')
}

// Avoid model recompilation in development
const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
