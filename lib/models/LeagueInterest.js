import mongoose from 'mongoose'

const LeagueInterestSchema = new mongoose.Schema({
  // Contact Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  // City they're interested in
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    lowercase: true
  },
  
  cityDisplayName: {
    type: String,
    trim: true
  },
  
  // Optional: skill level preference
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'any'],
    default: 'any'
  },
  
  // Optional: how they found us
  source: {
    type: String,
    trim: true
  },
  
  // Optional: additional message
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'contacted', 'converted', 'unsubscribed'],
    default: 'pending'
  },
  
  // When they signed up
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Admin notes
  notes: {
    type: String,
    trim: true
  },
  
  // Track if league was created and they were notified
  notifiedAt: {
    type: Date,
    default: null
  },
  
  // IP for spam prevention (optional)
  ipAddress: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
LeagueInterestSchema.index({ city: 1 })
LeagueInterestSchema.index({ email: 1 })
LeagueInterestSchema.index({ status: 1 })
LeagueInterestSchema.index({ createdAt: -1 })
LeagueInterestSchema.index({ city: 1, email: 1 }, { unique: true }) // Prevent duplicate signups per city

// Static method to get interest count by city
LeagueInterestSchema.statics.getInterestByCity = async function() {
  return this.aggregate([
    { $match: { status: { $in: ['pending', 'contacted'] } } },
    { 
      $group: { 
        _id: '$city',
        count: { $sum: 1 },
        cityDisplayName: { $first: '$cityDisplayName' },
        latestSignup: { $max: '$createdAt' }
      } 
    },
    { $sort: { count: -1 } }
  ])
}

// Static method to check if email already registered for city
LeagueInterestSchema.statics.isAlreadyRegistered = async function(email, city) {
  const existing = await this.findOne({ 
    email: email.toLowerCase(), 
    city: city.toLowerCase() 
  })
  return !!existing
}

const LeagueInterest = mongoose.models.LeagueInterest || mongoose.model('LeagueInterest', LeagueInterestSchema)

export default LeagueInterest
