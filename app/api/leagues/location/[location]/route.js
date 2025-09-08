import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import City from '../../../../../lib/models/City'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { location } = params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season') // e.g., "summer2025"
    
    console.log('🔍 Looking for league by location:', location, 'season:', season)
    
    // First, find the city by slug
    const city = await City.findOne({ 
      slug: location.toLowerCase(),
      status: 'active'
    })
    
    if (!city) {
      console.log('❌ City not found:', location)
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ City found:', city.name)
    
    // Parse season if provided
    let seasonQuery = {}
    if (season) {
      // Parse season like "summer2025" or "autumn2025"
      const seasonMatch = season.match(/^([a-z]+)(\d{4})$/)
      if (seasonMatch) {
        const [, type, year] = seasonMatch
        seasonQuery = {
          'season.type': type,
          'season.year': parseInt(year)
        }
        console.log('🔍 Parsed season:', seasonQuery)
      }
    }
    
    // Find league by city and optional season
    const query = {
      city: city._id,
      status: { $in: ['active', 'coming_soon', 'registration_open'] },
      ...seasonQuery
    }
    
    console.log('🔍 League query:', query)
    
    const league = await League.findOne(query)
      .populate('city', 'slug name images coordinates googleData province')
      .lean()
    
    if (!league) {
      console.log('❌ League not found with query:', query)
      
      // Try to find any league for this city as fallback
      const fallbackLeague = await League.findOne({
        city: city._id,
        status: { $in: ['active', 'coming_soon', 'registration_open'] }
      })
      .populate('city', 'slug name images coordinates googleData province')
      .lean()
      
      if (fallbackLeague) {
        console.log('✅ Found fallback league:', fallbackLeague.name)
        return NextResponse.json({
          success: true,
          league: fallbackLeague,
          isFallback: true
        })
      }
      
      return NextResponse.json(
        { error: 'No league found for this location' },
        { status: 404 }
      )
    }
    
    console.log('✅ League found:', league.name)
    
    return NextResponse.json({
      success: true,
      league: league
    })

  } catch (error) {
    console.error('❌ Error fetching league by location:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch league', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
