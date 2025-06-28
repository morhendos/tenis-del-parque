import dbConnect from '../../../../../lib/db/mongoose'
import Player from '../../../../../lib/models/Player'

export async function GET() {
  try {
    await dbConnect()

    // Fetch all players with league info
    const players = await Player
      .find()
      .populate('league', 'name')
      .sort({ registeredAt: -1 })
      .lean()

    // Create CSV content
    const headers = ['Name', 'Email', 'WhatsApp', 'Level', 'League', 'Status', 'Registration Date']
    const rows = players.map(player => [
      player.name,
      player.email,
      player.whatsapp,
      player.level,
      player.league?.name || 'N/A',
      player.status,
      new Date(player.registeredAt).toISOString().split('T')[0]
    ])

    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="players-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to export players' 
      },
      { status: 500 }
    )
  }
}
