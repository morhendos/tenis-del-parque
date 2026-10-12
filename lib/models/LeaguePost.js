import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
  isAdmin: { type: Boolean, default: false },
  text: { type: String, required: true, trim: true, maxlength: 500 },
  deletedAt: { type: Date, default: null }
}, { timestamps: true })

const LeaguePostSchema = new mongoose.Schema({
  league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
  kind: { type: String, enum: ['admin', 'player', 'auto'], required: true },
  autoType: { type: String, enum: ['result', 'new_player', 'new_round', null], default: null },
  autoKey: { type: String, default: null },
  data: { type: mongoose.Schema.Types.Mixed, default: null },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
  text: { type: String, trim: true, maxlength: 1000 },
  textEn: { type: String, trim: true, maxlength: 1000 },
  pinned: { type: Boolean, default: false },
  reactions: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    emoji: { type: String, required: true }
  }],
  comments: [CommentSchema],
  reports: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    at: { type: Date, default: Date.now }
  }],
  deletedAt: { type: Date, default: null }
}, { timestamps: true })

LeaguePostSchema.index({ league: 1, createdAt: -1 })
LeaguePostSchema.index({ autoKey: 1 }, { unique: true, partialFilterExpression: { autoKey: { $type: 'string' } } })

const LeaguePost = mongoose.models.LeaguePost || mongoose.model('LeaguePost', LeaguePostSchema)

export default LeaguePost
