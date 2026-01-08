import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import LeagueInterest from '@/lib/models/LeagueInterest'

export async function POST(request) {
  try {
    await dbConnect()

    const data = await request.json()
    const { name, email, phone, city, cityDisplayName, skillLevel, message, source } = data

    // Validate required fields
    if (!name || !email || !city) {
      return NextResponse.json(
        { error: 'Name, email, and city are required' },
        { status: 400 }
      )
    }

    // Check if already registered for this city
    const isRegistered = await LeagueInterest.isAlreadyRegistered(email, city)
    if (isRegistered) {
      return NextResponse.json(
        { 
          error: 'already_registered',
          message: 'You are already on the waiting list for this city' 
        },
        { status: 409 }
      )
    }

    // Get IP address for spam prevention
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'

    // Create the interest record
    const interest = new LeagueInterest({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      city: city.toLowerCase(),
      cityDisplayName: cityDisplayName || city,
      skillLevel: skillLevel || 'any',
      message: message?.trim() || '',
      source: source || 'club_page',
      ipAddress
    })

    await interest.save()

    // Get updated count for this city
    const cityCount = await LeagueInterest.countDocuments({ 
      city: city.toLowerCase(),
      status: { $in: ['pending', 'contacted'] }
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waiting list',
      cityCount
    })

  } catch (error) {
    console.error('Error saving league interest:', error)
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          error: 'already_registered',
          message: 'You are already on the waiting list for this city' 
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to join waiting list', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Get interest count for a city (public)
export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      )
    }

    const count = await LeagueInterest.countDocuments({ 
      city: city.toLowerCase(),
      status: { $in: ['pending', 'contacted'] }
    })

    return NextResponse.json({ city, count })

  } catch (error) {
    console.error('Error fetching interest count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interest count' },
      { status: 500 }
    )
  }
}
