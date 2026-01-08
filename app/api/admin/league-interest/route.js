import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db/mongoose'
import LeagueInterest from '@/lib/models/LeagueInterest'

// GET - List all interests with optional city filter
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const status = searchParams.get('status')
    const view = searchParams.get('view') // 'summary' or 'list'

    // Summary view - grouped by city
    if (view === 'summary') {
      const summary = await LeagueInterest.getInterestByCity()
      return NextResponse.json({ summary })
    }

    // List view - individual records
    let query = {}
    if (city && city !== 'all') {
      query.city = city.toLowerCase()
    }
    if (status && status !== 'all') {
      query.status = status
    }

    const interests = await LeagueInterest.find(query)
      .sort({ createdAt: -1 })
      .lean()

    // Also get summary stats
    const summary = await LeagueInterest.getInterestByCity()

    return NextResponse.json({ 
      interests,
      summary,
      total: interests.length
    })

  } catch (error) {
    console.error('Error fetching league interests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch league interests' },
      { status: 500 }
    )
  }
}

// PUT - Update interest status
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()
    const { id, status, notes } = data

    if (!id) {
      return NextResponse.json(
        { error: 'Interest ID is required' },
        { status: 400 }
      )
    }

    const updateData = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (status === 'contacted') updateData.notifiedAt = new Date()

    const interest = await LeagueInterest.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )

    if (!interest) {
      return NextResponse.json(
        { error: 'Interest not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, interest })

  } catch (error) {
    console.error('Error updating league interest:', error)
    return NextResponse.json(
      { error: 'Failed to update league interest' },
      { status: 500 }
    )
  }
}

// DELETE - Remove interest
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Interest ID is required' },
        { status: 400 }
      )
    }

    const interest = await LeagueInterest.findByIdAndDelete(id)

    if (!interest) {
      return NextResponse.json(
        { error: 'Interest not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting league interest:', error)
    return NextResponse.json(
      { error: 'Failed to delete league interest' },
      { status: 500 }
    )
  }
}
