import { NextResponse } from 'next/server'
import Club from '@/lib/models/Club'
import dbConnect from '@/lib/db/mongoose'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const { city, slug } = params

    const club = await Club.findBySlugAndCity(slug, city)

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await Club.findByIdAndUpdate(club._id, {
      $inc: { 'stats.views': 1 }
    })

    // Find nearby clubs (same city, excluding current)
    const nearbyClubs = await Club.find({
      'location.city': city.toLowerCase(),
      _id: { $ne: club._id },
      status: 'active'
    })
      .limit(3)
      .select({
        name: 1,
        slug: 1,
        'location.address': 1,
        'courts.total': 1,
        'courts.surfaces': 1,
        featured: 1
      })
      .sort({ featured: -1, displayOrder: 1 })
      .lean()

    return NextResponse.json({
      club: club.toObject(),
      nearbyClubs
    })
  } catch (error) {
    console.error('Error fetching club:', error)
    return NextResponse.json(
      { error: 'Failed to fetch club' },
      { status: 500 }
    )
  }
}