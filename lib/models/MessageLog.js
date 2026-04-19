import mongoose from 'mongoose'

const MessageLogSchema = new mongoose.Schema({
  // Who sent it
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentByName: String,
  
  // Audience targeting
  audience: {
    type: {
      type: String,
      enum: ['all', 'league', 'league_non_playoff', 'round_unplayed', 'individual'],
      required: true
    },
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League'
    },
    leagueName: String,
    round: Number,
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    playerName: String
  },
  
  // Channels used
  channels: {
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  
  // Message content
  message: {
    subject: String, // for email
    body: { type: String, required: true },
    template: String // 'custom', 'round_reminder', 'playoff_announcement', 'season_update'
  },
  
  // Delivery stats
  stats: {
    targetedPlayers: { type: Number, default: 0 },
    emailsSent: { type: Number, default: 0 },
    emailsFailed: { type: Number, default: 0 },
    pushSent: { type: Number, default: 0 },
    pushFailed: { type: Number, default: 0 }
  },
  
  // Per-player delivery details (kept small — just name + success/fail)
  deliveryDetails: [{
    playerName: String,
    playerId: mongoose.Schema.Types.ObjectId,
    emailSent: Boolean,
    pushSent: Boolean
  }]
}, {
  timestamps: true
})

MessageLogSchema.index({ createdAt: -1 })
MessageLogSchema.index({ 'audience.leagueId': 1 })

const MessageLog = mongoose.models.MessageLog || mongoose.model('MessageLog', MessageLogSchema)

export default MessageLog
