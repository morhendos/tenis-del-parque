import { NextResponse } from 'next/server'
import Club from '@/lib/models/Club'
import dbConnect from '@/lib/db/mongoose'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = { status: 'active' }

    if (city && city !== 'all') {
      query['location.city'] = city.toLowerCase()
    }

    if (featured === 'true') {
      query.featured = true
    }

    const clubs = await Club.find(query)
      .sort({ featured: -1, displayOrder: 1, name: 1 })
      .limit(limit)
      .skip(offset)
      .select({
        name: 1,
        slug: 1,
        description: 1,
        location: 1,
        courts: 1,
        amenities: 1,
        services: 1,
        contact: 1,
        pricing: 1,
        tags: 1,
        featured: 1,
        images: 1
      })
      .lean()

    // Get total count for pagination
    const total = await Club.countDocuments(query)

    // Get counts by city for filters
    const cityCounts = await Club.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } }
    ])

    const cityStats = cityCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count
      return acc
    }, {})

    return NextResponse.json({
      clubs,
      total,
      cityStats,
      pagination: {
        limit,
        offset,
        hasMore: offset + clubs.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}