import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'

// PATCH - Update display order for multiple leagues
export async function PATCH(request) {
  try {
    await dbConnect()
    
    const { orders } = await request.json()
    
    // orders should be an array of { leagueId, displayOrder }
    if (!Array.isArray(orders)) {
      return NextResponse.json(
        { error: 'Orders must be an array of { leagueId, displayOrder }' },
        { status: 400 }
      )
    }
    
    // Update each league's display order
    const updatePromises = orders.map(({ leagueId, displayOrder }) => 
      League.findByIdAndUpdate(
        leagueId,
        { displayOrder },
        { new: true }
      )
    )
    
    await Promise.all(updatePromises)
    
    // Trigger revalidation of home page
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tenisdelparque.com'
      await fetch(`${baseUrl}/api/revalidate?path=/es&secret=${process.env.REVALIDATE_SECRET}`)
      await fetch(`${baseUrl}/api/revalidate?path=/en&secret=${process.env.REVALIDATE_SECRET}`)
    } catch (revalidateError) {
      console.warn('Failed to revalidate:', revalidateError)
    }
    
    return NextResponse.json({
      success: true,
      message: `Updated display order for ${orders.length} leagues`,
      updatedCount: orders.length
    })
    
  } catch (error) {
    console.error('Error updating display orders:', error)
    return NextResponse.json(
      { error: 'Failed to update display orders', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Get current display orders for all leagues
export async function GET() {
  try {
    await dbConnect()
    
    const leagues = await League.find({})
      .select('_id name displayOrder location.city')
      .sort({ displayOrder: 1, name: 1 })
      .lean()
    
    return NextResponse.json({
      success: true,
      leagues: leagues.map(l => ({
        _id: l._id.toString(),
        name: l.name,
        city: l.location?.city,
        displayOrder: l.displayOrder || 0
      }))
    })
    
  } catch (error) {
    console.error('Error fetching display orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch display orders' },
      { status: 500 }
    )
  }
}
