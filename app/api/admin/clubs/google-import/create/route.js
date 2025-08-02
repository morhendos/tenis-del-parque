import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Club from '@/lib/models/Club'
import dbConnect from '@/lib/db/mongoose'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { clubs } = await request.json()

    // Validate input
    if (!clubs || !Array.isArray(clubs) || clubs.length === 0) {
      return NextResponse.json(
        { error: 'Clubs data is required' },
        { status: 400 }
      )
    }

    console.log(`Attempting to import ${clubs.length} clubs from Google Maps`)

    const results = {
      created: 0,
      failed: 0,
      duplicates: 0,
      errors: []
    }

    // Process each club
    for (const clubData of clubs) {
      try {
        // Check for duplicates by slug or Google Place ID
        const existingClub = await Club.findOne({
          $or: [
            { slug: clubData.slug },
            { googlePlaceId: clubData.googlePlaceId }
          ]
        })

        if (existingClub) {
          console.log(`Duplicate found: ${clubData.name} (${existingClub.slug})`)
          results.duplicates++
          results.errors.push({
            name: clubData.name,
            error: 'Club already exists',
            existingSlug: existingClub.slug
          })
          continue
        }

        // Validate required fields
        if (!clubData.name || !clubData.slug || !clubData.location?.city) {
          results.failed++
          results.errors.push({
            name: clubData.name || 'Unknown',
            error: 'Missing required fields'
          })
          continue
        }

        // Ensure courts structure is valid
        const indoor = parseInt(clubData.courts?.indoor) || 0
        const outdoor = parseInt(clubData.courts?.outdoor) || 0
        const total = indoor + outdoor
        
        if (total < 1) {
          // For Google imports, we'll allow 0 courts but set a default
          clubData.courts = {
            ...clubData.courts,
            total: 6, // Default estimate
            indoor: 0,
            outdoor: 6,
            surfaces: [{ type: 'clay', count: 6 }]
          }
        } else {
          clubData.courts = {
            ...clubData.courts,
            total,
            indoor,
            outdoor,
            surfaces: clubData.courts?.surfaces || []
          }
        }

        // Create the club
        const club = new Club({
          ...clubData,
          stats: { views: 0, clicks: 0 },
          createdBy: session.user.id,
          importedAt: new Date()
        })

        await club.save()
        console.log(`Successfully imported: ${club.name} (${club.slug})`)
        results.created++

      } catch (error) {
        console.error(`Error importing club ${clubData.name}:`, error)
        results.failed++
        results.errors.push({
          name: clubData.name || 'Unknown',
          error: error.message
        })
      }
    }

    console.log('Import complete:', results)

    // Return results
    return NextResponse.json(results)

  } catch (error) {
    console.error('Error in bulk club import:', error)
    return NextResponse.json(
      { error: 'Failed to import clubs', details: error.message },
      { status: 500 }
    )
  }
}