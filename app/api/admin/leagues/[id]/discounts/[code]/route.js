import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function PATCH(request, { params }) {
  try {
    // Check admin authentication
    const session = await getServerSession()
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id, code } = params
    
    const league = await League.findById(id)
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    // Find the discount code
    const discountIndex = league.discountCodes?.findIndex(d => d.code === code.toUpperCase())
    
    if (discountIndex === -1 || discountIndex === undefined) {
      return NextResponse.json({ error: 'Discount code not found' }, { status: 404 })
    }
    
    // Toggle the isActive status
    league.discountCodes[discountIndex].isActive = !league.discountCodes[discountIndex].isActive
    
    await league.save()
    
    return NextResponse.json({ 
      success: true,
      message: `Discount code ${league.discountCodes[discountIndex].isActive ? 'activated' : 'deactivated'}`,
      discount: league.discountCodes[discountIndex]
    })
  } catch (error) {
    console.error('Error toggling discount:', error)
    return NextResponse.json({ error: 'Failed to toggle discount' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check admin authentication
    const session = await getServerSession()
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id, code } = params
    
    const league = await League.findById(id)
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    // Find and remove the discount code
    const originalLength = league.discountCodes?.length || 0
    league.discountCodes = league.discountCodes?.filter(d => d.code !== code.toUpperCase()) || []
    
    if (league.discountCodes.length === originalLength) {
      return NextResponse.json({ error: 'Discount code not found' }, { status: 404 })
    }
    
    await league.save()
    
    return NextResponse.json({ 
      success: true,
      message: 'Discount code deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting discount:', error)
    return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 })
  }
}
