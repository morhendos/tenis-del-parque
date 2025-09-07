import { NextResponse } from 'next/server'
import City from '@/lib/models/City'
import Club from '@/lib/models/Club'
import League from '@/lib/models/League'
import dbConnect from '@/lib/db/mongoose'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all active cities with complete data for frontend display
    const cities = await City.find({ status: 'active' })
      .sort({ displayOrder: 1, 'name.es': 1 })
      .select('slug name clubCount province country coordinates images formattedAddress googlePlaceId googleData')
    
    // Get all active clubs with their GPS-based league assignments
    const clubs = await Club.find({ status: 'active' })
      .select('assignedLeague location.city name')
      .lean()
    
    // Calculate real-time club count based on GPS assignments
    const citiesWithRealCounts = await Promise.all(
      cities.map(async (city) => {
        // Count active leagues in this city
        const leagueCount = await League.countDocuments({
          'location.city': city.slug,
          status: 'active'
        })
        
        // Count clubs assigned to this city via GPS coordinates
        const realClubCount = clubs.filter(club => 
          club.assignedLeague === city.slug || 
          (!club.assignedLeague && club.location?.city === city.slug) // Fallback to old method
        ).length
        
        console.log(`🏙️ ${city.name.es}: Database count: ${city.clubCount}, Real GPS count: ${realClubCount}`)
        
        return {
          ...city.toObject(),
          leagueCount,
          clubCount: realClubCount, // Use real-time GPS-based count
          originalClubCount: city.clubCount, // Keep original for comparison
          displayName: city.name.es || city.name.en,
          hasCoordinates: !!(city.coordinates?.lat && city.coordinates?.lng),
          hasImages: !!(city.images?.main || (city.images?.gallery && city.images.gallery.length > 0)),
          isGoogleEnhanced: city.googlePlaceId && city.googleData
        }
      })
    )
    
    // Log the corrections made
    const corrections = citiesWithRealCounts.filter(city => 
      city.clubCount !== city.originalClubCount
    )
    
    if (corrections.length > 0) {
      console.log('🔧 Club count corrections made:', corrections.map(city => 
        `${city.name.es}: ${city.originalClubCount} → ${city.clubCount}`
      ))
    }
    
    return NextResponse.json({ 
      success: true,
      cities: citiesWithRealCounts,
      total: citiesWithRealCounts.length,
      corrections: corrections.length
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
