import dbConnect from '../../../../../lib/db/mongoose'
import Player from '../../../../../lib/models/Player'
import League from '../../../../../lib/models/League'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await dbConnect()

    // Fetch all players with league info populated
    const players = await Player
      .find()
      .populate('registrations.league', 'name slug season')
      .sort({ 'metadata.firstRegistrationDate': -1 })
      .lean()

    // Create CSV content with headers
    const headers = [
      'name',
      'email', 
      'whatsapp',
      'eloRating',
      'level',
      'status',
      'leagueSlug',
      'leagueName',
      'seasonYear',
      'seasonType',
      'registrationDate'
    ]
    
    // Map players to CSV rows (one row per league registration)
    const rows = []
    
    for (const player of players) {
      if (player.registrations && player.registrations.length > 0) {
        // Create a row for each league registration
        for (const reg of player.registrations) {
          const league = reg.league
          
          rows.push([
            player.name || '',
            player.email || '',
            player.whatsapp || '',
            player.eloRating || 1200,
            reg.level || 'intermediate',
            reg.status || 'pending',
            league?.slug || '',
            league?.name || '',
            league?.season?.year || '',
            league?.season?.type || '',
            reg.registeredAt ? new Date(reg.registeredAt).toISOString().split('T')[0] : ''
          ])
        }
      } else {
        // Player with no registrations - export basic info
        rows.push([
          player.name || '',
          player.email || '',
          player.whatsapp || '',
          player.eloRating || 1200,
          'intermediate', // default level
          'pending', // default status
          '', // no league slug
          '', // no league name
          '', // no season year
          '', // no season type
          player.createdAt ? new Date(player.createdAt).toISOString().split('T')[0] : ''
        ])
      }
    }

    // Build CSV string with proper escaping
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Convert to string and escape quotes
          const str = String(cell)
          // Always wrap in quotes to handle commas and special characters
          return `"${str.replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="players-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    console.error('Error stack:', error.stack)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to export players',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
