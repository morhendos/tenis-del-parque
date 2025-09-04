import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import City from '@/lib/models/City'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { slug } = params
    
    // Find the city first
    const city = await City.findOne({ 
      slug: slug.toLowerCase(),
      status: 'active'
    })
    
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' }, 
        { status: 404 }
      )
    }
    
    // Find the league associated with this city
    const league = await League.findOne({
      city: city._id,
      status: { $in: ['active', 'coming_soon'] }
    }).populate('city', 'slug name')
    
    if (!league) {
      // Try to find by legacy location.city field as fallback
      const legacyLeague = await League.findOne({
        'location.city': city.name.es || city.name.en,
        status: { $in: ['active', 'coming_soon'] }
      }).populate('city', 'slug name')
      
      if (legacyLeague) {
        return NextResponse.json({
          success: true,
          league: {
            slug: legacyLeague.slug,
            name: legacyLeague.name,
            city: legacyLeague.city || { slug: city.slug, name: city.name }
          }
        })
      }
      
      return NextResponse.json({
        success: false,
        message: 'No league found for this city',
        city: {
          slug: city.slug,
          name: city.name
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      league: {
        slug: league.slug,
        name: league.name,
        city: league.city
      }
    })
    
  } catch (error) {
    console.error('Error fetching league for city:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}