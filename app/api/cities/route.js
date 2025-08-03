import { NextResponse } from 'next/server'
import City from '@/lib/models/City'
import dbConnect from '@/lib/db/mongoose'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all active cities, sorted by display order and name
    const cities = await City.find({ status: 'active' })
      .sort({ displayOrder: 1, 'name.es': 1 })
      .select('slug name clubCount province')
    
    return NextResponse.json({ 
      success: true,
      cities: cities 
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
