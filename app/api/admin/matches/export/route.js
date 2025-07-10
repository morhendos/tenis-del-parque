import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    await dbConnect()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('league')
    const season = searchParams.get('season')
    const status = searchParams.get('status')
    
    // Build query
    const query = {}
    if (leagueId) query.league = leagueId
    if (season) query.season = season
    if (status) query.status = status

    // Fetch matches with player and league info
    const matches = await Match
      .find(query)
      .populate('players.player1 players.player2', 'name email level')
      .populate('league', 'name slug')
      .sort({ round: 1, 'schedule.confirmedDate': 1 })
      .lean()

    // Create CSV content
    const headers = [
      'Round',
      'League',
      'Season',
      'Player 1 Name',
      'Player 1 Email',
      'Player 1 Level',
      'Player 2 Name', 
      'Player 2 Email',
      'Player 2 Level',
      'Status',
      'Date Played',
      'Winner',
      'Score',
      'Player 1 ELO Before',
      'Player 1 ELO After',
      'Player 1 ELO Change',
      'Player 2 ELO Before',
      'Player 2 ELO After',
      'Player 2 ELO Change',
      'Court',
      'Notes'
    ]
    
    const rows = matches.map(match => {
      const player1 = match.players?.player1 || {}
      const player2 = match.players?.player2 || {}
      const winner = match.result?.winner?.toString()
      const winnerName = winner === player1._id?.toString() ? player1.name : 
                         winner === player2._id?.toString() ? player2.name : ''
      
      // Format score
      let score = ''
      if (match.result?.score?.walkover) {
        score = 'Walkover'
      } else if (match.result?.score?.sets) {
        score = match.result.score.sets
          .map(set => `${set.player1}-${set.player2}`)
          .join(', ')
      }
      
      return [
        match.round,
        match.league?.name || '',
        match.season || '',
        player1.name || '',
        player1.email || '',
        player1.level || '',
        player2.name || '',
        player2.email || '',
        player2.level || '',
        match.status || '',
        match.result?.playedAt ? new Date(match.result.playedAt).toISOString().split('T')[0] : '',
        winnerName,
        score,
        match.eloChanges?.player1?.before || '',
        match.eloChanges?.player1?.after || '',
        match.eloChanges?.player1?.change || '',
        match.eloChanges?.player2?.before || '',
        match.eloChanges?.player2?.after || '',
        match.eloChanges?.player2?.change || '',
        match.schedule?.court || '',
        match.notes || ''
      ]
    })

    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="matches-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to export matches' 
      },
      { status: 500 }
    )
  }
}