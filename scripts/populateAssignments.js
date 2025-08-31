/**
 * Simple script to populate club assignments
 */

const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

// Define Club schema inline
const ClubSchema = new mongoose.Schema({
  name: String,
  assignedLeague: String,
  leagueAssignedAt: Date,
  location: {
    coordinates: {
      lat: Number,
      lng: Number
    }
  }
})

const Club = mongoose.models.Club || mongoose.model('Club', ClubSchema)

// Define Area schema inline  
const AreaSchema = new mongoose.Schema({
  id: String,
  name: String,
  bounds: [{
    lat: Number,
    lng: Number
  }],
  originalLeagueId: String,
  isCustom: Boolean,
  active: Boolean
})

const Area = mongoose.models.Area || mongoose.model('Area', AreaSchema)

// Static league polygons as fallback
const LEAGUE_POLYGONS = {
  marbella: {
    bounds: [
      { lat: 36.6200, lng: -5.1000 },
      { lat: 36.6200, lng: -4.7500 },
      { lat: 36.4300, lng: -4.7500 },
      { lat: 36.4300, lng: -5.1000 }
    ]
  },
  malaga: {
    bounds: [
      { lat: 36.8500, lng: -4.7000 },
      { lat: 36.8500, lng: -4.2000 },
      { lat: 36.5000, lng: -4.2000 },
      { lat: 36.5000, lng: -4.7000 }
    ]
  },
  estepona: {
    bounds: [
      { lat: 36.5500, lng: -5.3500 },
      { lat: 36.5500, lng: -5.0500 },
      { lat: 36.3800, lng: -5.0500 },
      { lat: 36.3800, lng: -5.3500 }
    ]
  },
  sotogrande: {
    bounds: [
      { lat: 36.3500, lng: -5.4000 },
      { lat: 36.3500, lng: -5.1500 },
      { lat: 36.1500, lng: -5.1500 },
      { lat: 36.1500, lng: -5.4000 }
    ]
  }
}

function isPointInPolygon(lat, lng, polygon) {
  let inside = false
  const x = lat
  const y = lng
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat
    const yi = polygon[i].lng
    const xj = polygon[j].lat
    const yj = polygon[j].lng
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}

async function loadAreaBoundaries() {
  try {
    const areas = await Area.find({ active: true })
    const combinedBoundaries = { ...LEAGUE_POLYGONS }
    
    console.log(`🔄 Found ${areas.length} areas in database`)
    
    areas.forEach(area => {
      if (area.originalLeagueId) {
        // Modified league boundary - override the static one
        console.log(`  🔧 Overriding ${area.originalLeagueId} with modified boundary (${area.bounds.length} points)`)
        combinedBoundaries[area.originalLeagueId] = {
          bounds: area.bounds
        }
      } else if (area.isCustom) {
        // Custom area - add as new
        console.log(`  ➕ Adding custom area ${area.id} (${area.bounds.length} points)`)
        combinedBoundaries[area.id] = {
          bounds: area.bounds
        }
      }
    })
    
    return combinedBoundaries
  } catch (error) {
    console.error('Error loading areas, using static boundaries:', error.message)
    return LEAGUE_POLYGONS
  }
}

function determineLeague(lat, lng, boundaries) {
  for (const [league, data] of Object.entries(boundaries)) {
    if (isPointInPolygon(lat, lng, data.bounds)) {
      return league
    }
  }
  return null
}

async function populateAssignments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const boundaries = await loadAreaBoundaries()
    console.log('📍 Loaded area boundaries:', Object.keys(boundaries))
    
    const clubs = await Club.find({
      'location.coordinates.lat': { $exists: true, $ne: null },
      'location.coordinates.lng': { $exists: true, $ne: null }
    })
    
    console.log(`🏢 Found ${clubs.length} clubs with coordinates`)
    
    let updated = 0
    let unchanged = 0
    
    for (const club of clubs) {
      const newAssignment = determineLeague(
        club.location.coordinates.lat,
        club.location.coordinates.lng,
        boundaries
      )
      
      if (newAssignment !== club.assignedLeague) {
        await Club.findByIdAndUpdate(club._id, {
          assignedLeague: newAssignment,
          leagueAssignedAt: new Date()
        })
        
        console.log(`  ✅ ${club.name}: ${club.assignedLeague || 'null'} → ${newAssignment || 'null'}`)
        updated++
      } else {
        unchanged++
      }
    }
    
    console.log('\n🎉 Assignment population complete!')
    console.log(`  ✅ Updated: ${updated} clubs`)
    console.log(`  ➡️  Unchanged: ${unchanged} clubs`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  }
}

populateAssignments()
