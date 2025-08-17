import mongoose from 'mongoose'

const AreaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  bounds: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  center: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  color: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  // Track if this is a custom area or a modified league
  isCustom: {
    type: Boolean,
    default: false
  },
  isModified: {
    type: Boolean,
    default: false
  },
  // For modified leagues, track which original league this modifies
  originalLeagueId: {
    type: String,
    required: false
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
})

// Index for faster queries
AreaSchema.index({ slug: 1 })
AreaSchema.index({ active: 1 })
AreaSchema.index({ originalLeagueId: 1 })

const Area = mongoose.models.Area || mongoose.model('Area', AreaSchema)

export default Area
