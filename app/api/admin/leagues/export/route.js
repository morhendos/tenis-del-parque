import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all leagues with their seasons
    const leagues = await League.find({}).lean()
    
    // Prepare CSV headers
    const headers = [
      'name',
      'type',
      'location_city',
      'location_region',
      'location_venue',
      'surface',
      'ball_type',
      'match_format',
      'season_name',
      'season_status',
      'created_at',
      'updated_at'
    ]
    
    // Convert leagues to CSV rows
    const rows = []
    
    for (const league of leagues) {
      if (league.seasons && league.seasons.length > 0) {
        // Create a row for each season
        for (const season of league.seasons) {
          rows.push([
            league.name,
            league.type || 'public',
            league.location?.city || '',
            league.location?.region || '',
            league.location?.venue || '',
            league.settings?.surface || 'clay',
            league.settings?.ballType || 'pressurized',
            league.settings?.matchFormat || 'best_of_3',
            season.name || '',
            season.status || 'draft',
            league.createdAt ? new Date(league.createdAt).toISOString() : '',
            league.updatedAt ? new Date(league.updatedAt).toISOString() : ''
          ])
        }
      } else {
        // Create a row for league without seasons
        rows.push([
          league.name,
          league.type || 'public',
          league.location?.city || '',
          league.location?.region || '',
          league.location?.venue || '',
          league.settings?.surface || 'clay',
          league.settings?.ballType || 'pressurized',
          league.settings?.matchFormat || 'best_of_3',
          '',
          '',
          league.createdAt ? new Date(league.createdAt).toISOString() : '',
          league.updatedAt ? new Date(league.updatedAt).toISOString() : ''
        ])
      }
    }
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leagues-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export leagues' },
      { status: 500 }
    )
  }
}
