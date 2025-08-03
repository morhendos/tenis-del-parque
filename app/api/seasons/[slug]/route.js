import { NextResponse } from 'next/server'
import { findSeasonBySlug } from '@/lib/utils/seasonUtils'

export async function GET(request, { params }) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'en'
    
    const season = await findSeasonBySlug(slug, language)
    
    if (!season) {
      return NextResponse.json(
        { error: 'Season not found' },
        { status: 404 }
      )
    }
    
    // Return season data in a client-safe format
    return NextResponse.json({
      id: season._id,
      year: season.year,
      type: season.type,
      slug: season.getSlug(language),
      name: season.getName(language),
      status: season.status,
      startDate: season.startDate,
      endDate: season.endDate,
      dbKey: season.dbKey
    })
    
  } catch (error) {
    console.error('Error fetching season:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}