import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import City from '@/lib/models/City'

/**
 * GET /api/leagues/siblings
 * Fetch sibling leagues (same city, same season, different skill levels)
 * 
 * Query params:
 * - city: City slug (required)
 * - season: Season type - winter, summer, etc. (required)
 * - year: Season year (required)
 */
export async function GET(request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const citySlug = searchParams.get('city')
    const seasonType = searchParams.get('season')
    const seasonYear = searchParams.get('year')
    
    if (!citySlug || !seasonType || !seasonYear) {
      return NextResponse.json(
        { error: 'Missing required params: city, season, year' },
        { status: 400 }
      )
    }
    
    // Find the city by slug
    const city = await City.findOne({ slug: citySlug })
    if (!city) {
      return NextResponse.json(
        { error: 'City not found', leagues: [] },
        { status: 404 }
      )
    }
    
    // Find all leagues for this city and season
    const leagues = await League.find({
      city: city._id,
      'season.type': seasonType,
      'season.year': parseInt(seasonYear, 10)
    }).select('name slug skillLevel season status').lean()
    
    // Map to simpler format with skill level info
    const mappedLeagues = leagues.map(league => ({
      name: league.name,
      slug: league.slug,
      skillLevel: league.skillLevel || 'intermediate',
      status: league.status
    }))
    
    return NextResponse.json({ 
      leagues: mappedLeagues,
      city: citySlug,
      season: seasonType,
      year: seasonYear
    })
    
  } catch (error) {
    console.error('Error fetching sibling leagues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leagues', leagues: [] },
      { status: 500 }
    )
  }
}
