import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/apiAuth'

export async function POST(request, { params }) {
  try {
    // Check admin authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()
    
    const { id } = params
    const discountData = await request.json()
    
    const league = await League.findById(id)
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    // Validate required fields
    if (!discountData.code || !discountData.code.trim()) {
      return NextResponse.json({ error: 'Discount code is required' }, { status: 400 })
    }
    
    // Check if code already exists
    if (league.discountCodes?.some(d => d.code === discountData.code.toUpperCase())) {
      return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 })
    }
    
    // Add new discount code
    if (!league.discountCodes) {
      league.discountCodes = []
    }
    
    league.discountCodes.push({
      code: discountData.code.toUpperCase(),
      discountPercentage: discountData.discountPercentage || 100,
      description: discountData.description || 'Promotional discount',
      validFrom: discountData.validFrom ? new Date(discountData.validFrom) : new Date(),
      validUntil: discountData.validUntil ? new Date(discountData.validUntil) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      maxUses: discountData.maxUses || null,
      isActive: discountData.isActive !== undefined ? discountData.isActive : true,
      createdAt: new Date(),
      usedCount: 0,
      usedBy: []
    })
    
    await league.save()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Discount code created successfully',
      league: {
        _id: league._id,
        name: league.name,
        discountCodes: league.discountCodes
      }
    })
  } catch (error) {
    console.error('Error adding discount:', error)
    return NextResponse.json({ error: 'Failed to add discount' }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    // Check admin authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()
    
    const { id } = params
    
    const league = await League.findById(id).select('name slug discountCodes')
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true,
      league: {
        _id: league._id,
        name: league.name,
        slug: league.slug,
        discountCodes: league.discountCodes || []
      }
    })
  } catch (error) {
    console.error('Error fetching discounts:', error)
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 })
  }
}
