import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { slug } = params
    console.log('🔍 Debug: Fetching full league data for slug:', slug)
    
    // Find league by slug and get ALL data
    const league = await League.findOne({ slug: slug })
      .populate('city')
      .lean()

    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      )
    }

    console.log('🔍 COMPLETE LEAGUE DATA:')
    console.log('- Name:', league.name)
    console.log('- Slug:', league.slug)
    console.log('- Status:', league.status)
    console.log('- Season:', league.season)
    console.log('- Seasons array:', league.seasons)
    console.log('- Location:', league.location)
    console.log('- City:', league.city)
    console.log('- Config:', league.config)
    console.log('- Created:', league.createdAt)

    return NextResponse.json({
      success: true,
      league: {
        _id: league._id,
        name: league.name,
        slug: league.slug,
        status: league.status,
        season: league.season,
        seasons: league.seasons,
        location: league.location,
        city: league.city,
        config: league.config,
        createdAt: league.createdAt,
        updatedAt: league.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    )
  }
}
