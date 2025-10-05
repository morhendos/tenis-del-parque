import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import City from '../../../../../lib/models/City'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all cities
    const cities = await City.find({}).sort({ displayOrder: 1, 'name.es': 1 }).lean()
    
    // Prepare CSV headers
    const headers = [
      'slug',
      'nameEs',
      'nameEn',
      'province',
      'country',
      'lat',
      'lng',
      'status',
      'displayOrder',
      'importSource',
      'mainImage',
      'googlePlaceId',
      'formattedAddress',
      'clubCount',
      'createdAt',
      'updatedAt'
    ]
    
    // Convert cities to CSV rows
    const rows = cities.map(city => [
      city.slug || '',
      city.name?.es || '',
      city.name?.en || '',
      city.province || '',
      city.country || '',
      city.coordinates?.lat || '',
      city.coordinates?.lng || '',
      city.status || '',
      city.displayOrder || 0,
      city.importSource || '',
      city.images?.main || '',
      city.googlePlaceId || '',
      city.formattedAddress || '',
      city.clubCount || 0,
      city.createdAt ? new Date(city.createdAt).toISOString() : '',
      city.updatedAt ? new Date(city.updatedAt).toISOString() : ''
    ])
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Handle cells that might contain commas or quotes
        const cellStr = String(cell).replace(/"/g, '""')
        return `"${cellStr}"`
      }).join(','))
    ].join('\n')
    
    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="cities-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export cities', details: error.message },
      { status: 500 }
    )
  }
}
