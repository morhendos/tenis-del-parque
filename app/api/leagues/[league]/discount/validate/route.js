import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    await dbConnect()
    
    const { code } = await request.json()
    const { league: leagueSlug } = params
    
    if (!code) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Discount code is required' 
      }, { status: 400 })
    }
    
    const league = await League.findOne({ slug: leagueSlug })
    
    if (!league) {
      return NextResponse.json({ 
        valid: false, 
        error: 'League not found' 
      }, { status: 404 })
    }
    
    // Check if discount code exists and is valid
    const discount = league.discountCodes?.find(d => {
      return d.code === code.toUpperCase() &&
             d.isActive &&
             new Date() >= new Date(d.validFrom) &&
             new Date() <= new Date(d.validUntil) &&
             (d.maxUses === null || d.usedCount < d.maxUses)
    })
    
    if (!discount) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired discount code' 
      })
    }
    
    // Calculate discounted price
    const originalPrice = league.seasonConfig?.price?.amount || 0
    const discountAmount = (originalPrice * discount.discountPercentage) / 100
    const finalPrice = originalPrice - discountAmount
    
    return NextResponse.json({
      valid: true,
      code: discount.code,
      discountPercentage: discount.discountPercentage,
      originalPrice,
      discountAmount,
      finalPrice,
      description: discount.description
    })
    
  } catch (error) {
    console.error('Discount validation error:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Failed to validate discount code' 
    }, { status: 500 })
  }
}
