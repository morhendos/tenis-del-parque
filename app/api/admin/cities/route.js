import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import City from '@/lib/models/City'
import dbConnect from '@/lib/db/mongoose'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const withCounts = searchParams.get('withCounts') === 'true'

    // If ID is provided, fetch single city
    if (id) {
      const city = await City.findById(id).lean()
      
      if (!city) {
        return NextResponse.json(
          { error: 'City not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ city })
    }

    // Otherwise, fetch all cities with optional filtering
    let query = {}
    if (status) {
      query.status = status
    }

    const cities = await City.find(query)
      .sort({ displayOrder: 1, 'name.es': 1 })
      .lean()

    // Update club counts if requested
    if (withCounts) {
      const Club = await import('@/lib/models/Club').then(m => m.default)
      
      // Get club counts for all cities in one query
      const clubCounts = await Club.aggregate([
        { $match: { status: 'active' } },
        { $group: { 
          _id: '$location.city', 
          count: { $sum: 1 } 
        }}
      ])
      
      // Create a map for quick lookup
      const countsMap = clubCounts.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {})
      
      // Add counts to cities
      cities.forEach(city => {
        city.clubCount = countsMap[city.slug] || 0
      })
    }

    return NextResponse.json({ cities })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()

    // Validate required fields
    if (!data.slug || !data.name?.es || !data.name?.en) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, name.es, and name.en' },
        { status: 400 }
      )
    }

    // Check if city already exists
    const existingCity = await City.findOne({ slug: data.slug })
    if (existingCity) {
      return NextResponse.json(
        { error: 'A city with this slug already exists' },
        { status: 400 }
      )
    }

    // Create the city
    const city = new City({
      ...data,
      status: data.status || 'active',
      importSource: data.importSource || 'manual'
    })

    await city.save()

    return NextResponse.json({ 
      success: true, 
      city: city.toObject() 
    })
  } catch (error) {
    console.error('Error creating city:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }))
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create city', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: 'City ID is required' },
        { status: 400 }
      )
    }

    // Update the city
    const city = await City.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }

    // Update club count if requested
    if (data.updateClubCount) {
      await city.updateClubCount()
    }

    return NextResponse.json({ 
      success: true, 
      city: city.toObject() 
    })
  } catch (error) {
    console.error('Error updating city:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }))
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update city', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

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
        { error: 'City ID is required' },
        { status: 400 }
      )
    }

    // Check if there are any clubs in this city
    const Club = await import('@/lib/models/Club').then(m => m.default)
    const clubCount = await Club.countDocuments({ 'location.city': id })
    
    if (clubCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete city with ${clubCount} associated clubs` },
        { status: 400 }
      )
    }

    // Delete the city
    const city = await City.findByIdAndDelete(id)

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'City deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting city:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete city', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}