import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import City from '../../../../../lib/models/City'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all leagues with populated city information
    const leagues = await League.find({})
      .populate('city')
      .lean()
    
    // Prepare CSV headers matching the import format
    const headers = [
      'name',
      'citySlug',
      'seasonYear',
      'seasonType',
      'startDate',
      'endDate',
      'skillLevel',
      'status',
      'descriptionEs',
      'descriptionEn',
      'registrationStart',
      'registrationEnd',
      'maxPlayers',
      'minPlayers',
      'priceAmount',
      'priceCurrency',
      'isFree',
      'roundsPerSeason',
      'wildCardsPerPlayer',
      'playoffPlayers',
      'expectedLaunchDate',
      'displayOrder',
      'timezone'
    ]
    
    // Convert leagues to CSV rows
    const rows = leagues.map(league => {
      // Get city slug from populated city or try to extract from league slug
      let citySlug = ''
      if (league.city && league.city.slug) {
        citySlug = league.city.slug
      } else if (league.slug) {
        // Try to extract city from slug (e.g., "sotogrande-summer-2025" -> "sotogrande")
        const parts = league.slug.split('-')
        if (parts.length > 0) {
          citySlug = parts[0]
        }
      } else if (league.location?.city) {
        // Fallback to location city name converted to slug
        citySlug = league.location.city.toLowerCase().replace(/\s+/g, '-')
      }
      
      return [
        league.name || '',
        citySlug,
        league.season?.year || league.seasonConfig?.startDate ? new Date(league.seasonConfig.startDate).getFullYear() : '2025',
        league.season?.type || 'summer',
        league.season?.number || 1,
        league.seasonConfig?.startDate ? new Date(league.seasonConfig.startDate).toISOString().split('T')[0] : '',
        league.seasonConfig?.endDate ? new Date(league.seasonConfig.endDate).toISOString().split('T')[0] : '',
        league.skillLevel || 'all',
        league.status || 'coming_soon',
        league.description?.es || '',
        league.description?.en || '',
        league.seasonConfig?.registrationStart ? new Date(league.seasonConfig.registrationStart).toISOString().split('T')[0] : '',
        league.seasonConfig?.registrationEnd ? new Date(league.seasonConfig.registrationEnd).toISOString().split('T')[0] : '',
        league.seasonConfig?.maxPlayers || 20,
        league.seasonConfig?.minPlayers || 8,
        league.seasonConfig?.price?.amount || 0,
        league.seasonConfig?.price?.currency || 'EUR',
        league.seasonConfig?.price?.isFree !== undefined ? league.seasonConfig.price.isFree : true,
        league.config?.roundsPerSeason || 8,
        league.config?.wildCardsPerPlayer || 4,
        league.config?.playoffPlayers || 8,
        league.expectedLaunchDate ? new Date(league.expectedLaunchDate).toISOString().split('T')[0] : '',
        league.displayOrder || 0,
        league.location?.timezone || 'Europe/Madrid'
      ]
    })
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Handle cells that might contain commas or quotes
        const cellStr = String(cell).replace(/"/g, '""')
        // Always wrap in quotes to handle commas and special characters
        return `"${cellStr}"`
      }).join(','))
    ].join('\n')
    
    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leagues-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export leagues', details: error.message },
      { status: 500 }
    )
  }
}
