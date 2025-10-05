import dbConnect from '../../../../../lib/db/mongoose'
import Player from '../../../../../lib/models/Player'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await dbConnect()

    // Fetch all players with league info populated
    const players = await Player
      .find()
      .populate('registrations.league', 'name')
      .sort({ 'metadata.firstRegistrationDate': -1 })
      .lean()

    // Create CSV content with headers
    const headers = ['Name', 'Email', 'WhatsApp', 'ELO Rating', 'Leagues', 'Registration Date']
    
    // Map players to CSV rows
    const rows = players.map(player => {
      // Get all league names
      const leagues = player.registrations
        ?.map(reg => reg.league?.name || 'N/A')
        .join('; ') || 'N/A'
      
      // Get earliest registration date
      const earliestDate = player.registrations
        ?.reduce((earliest, reg) => {
          const regDate = reg.registeredAt
          return !earliest || regDate < earliest ? regDate : earliest
        }, null) || player.metadata?.firstRegistrationDate || player.createdAt
      
      return [
        player.name || '',
        player.email || '',
        player.whatsapp || '',
        player.eloRating || 1200,
        leagues,
        earliestDate ? new Date(earliestDate).toISOString().split('T')[0] : ''
      ]
    })

    // Build CSV string with proper escaping
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Convert to string and escape quotes
          const str = String(cell)
          // If cell contains comma, newline, or quote, wrap in quotes and escape internal quotes
          if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
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
