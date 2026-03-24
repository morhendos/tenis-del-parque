import mongoose from 'mongoose'

const PushSubscriptionSchema = new mongoose.Schema({
  // Link to user/player
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    index: true
  },
  
  // The push subscription object from browser
  subscription: {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true }
    }
  },
  
  // Device info
  deviceInfo: {
    userAgent: String,
    platform: String,  // 'android', 'ios', 'desktop'
    browser: String
  },
  
  // Notification preferences
  preferences: {
    newMatch: { type: Boolean, default: true },
    matchResult: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true }
  },
  
  // Status tracking
  isActive: { type: Boolean, default: true },
  lastUsed: { type: Date, default: Date.now },
  failedAttempts: { type: Number, default: 0 }
}, {
  timestamps: true
})

PushSubscriptionSchema.index({ 'subscription.endpoint': 1 })
PushSubscriptionSchema.index({ playerId: 1, isActive: 1 })
PushSubscriptionSchema.index({ userId: 1, isActive: 1 })

const PushSubscription = mongoose.models.PushSubscription || 
  mongoose.model('PushSubscription', PushSubscriptionSchema)

export default PushSubscription
