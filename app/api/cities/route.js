import { NextResponse } from 'next/server'
import City from '@/lib/models/City'
import League from '@/lib/models/League'
import dbConnect from '@/lib/db/mongoose'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all active cities with complete data for frontend display
    const cities = await City.find({ status: 'active' })
      .sort({ displayOrder: 1, 'name.es': 1 })
      .select('slug name clubCount province country coordinates images formattedAddress googlePlaceId googleData')
    
    // Calculate league count for each city
    const citiesWithLeagueCount = await Promise.all(
      cities.map(async (city) => {
        // Count active leagues in this city
        const leagueCount = await League.countDocuments({
          'location.city': city.slug,
          status: 'active'
        })
        
        return {
          ...city.toObject(),
          leagueCount,
          displayName: city.name.es || city.name.en,
          hasCoordinates: !!(city.coordinates?.lat && city.coordinates?.lng),
          hasImages: !!(city.images?.main || (city.images?.gallery && city.images.gallery.length > 0)),
          isGoogleEnhanced: city.googlePlaceId && city.googleData
        }
      })
    )
    
    return NextResponse.json({ 
      success: true,
      cities: citiesWithLeagueCount,
      total: citiesWithLeagueCount.length
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
