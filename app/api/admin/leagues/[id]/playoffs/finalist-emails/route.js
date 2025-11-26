import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../../lib/db/mongoose'
import League from '../../../../../../../lib/models/League'
import Match from '../../../../../../../lib/models/Match'
import Player from '../../../../../../../lib/models/Player'
import { requireAdmin } from '../../../../../../../lib/auth/apiAuth'
import { generateFinalistEmail } from '../../../../../../../lib/email/templates/finalistEmail'
import { sendEmail } from '../../../../../../../lib/email/resend'

export const dynamic = 'force-dynamic'

// POST /api/admin/leagues/[id]/playoffs/finalist-emails
export async function POST(request, { params }) {
  try {
    // Check authentication
    const { session, error } = await requireAdmin(request)
    if (error) return error

    const { id } = params
    const body = await request.json()
    const { action, testEmail, group } = body

    // Connect to database
    await dbConnect()

    // Get the league with playoff config
    const league = await League.findById(id).lean()
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    if (!league.playoffConfig || !league.playoffConfig.bracket) {
      return NextResponse.json({ error: 'League does not have playoff configuration' }, { status: 400 })
    }

    // Determine which group to process
    const groups = group ? [group] : ['A', 'B']
    const results = {
      sent: [],
      errors: []
    }

    for (const playoffGroup of groups) {
      const bracket = playoffGroup === 'A' 
        ? league.playoffConfig.bracket.groupA 
        : league.playoffConfig.bracket.groupB

      // Check if final exists and is created
      if (!bracket.final || !bracket.final.matchId) {
        results.errors.push({
          group: playoffGroup,
          error: 'Final match not created yet'
        })
        continue
      }

      // Get the final match
      const finalMatch = await Match.findById(bracket.final.matchId)
        .populate('players.player1', 'name email whatsapp eloRating registrations')
        .populate('players.player2', 'name email whatsapp eloRating registrations')
        .lean()

      if (!finalMatch) {
        results.errors.push({
          group: playoffGroup,
          error: 'Final match not found in database'
        })
        continue
      }

      const player1 = finalMatch.players.player1
      const player2 = finalMatch.players.player2

      if (!player1 || !player2) {
        results.errors.push({
          group: playoffGroup,
          error: 'Players not found for final match'
        })
        continue
      }

      // Get player seeds from qualified players
      const qualifiedPlayers = playoffGroup === 'A' 
        ? (league.playoffConfig.qualifiedPlayers?.groupA || [])
        : (league.playoffConfig.qualifiedPlayers?.groupB || [])
      const player1Qualified = qualifiedPlayers.find(qp => 
        qp.player._id?.toString() === player1._id.toString() || 
        qp.player.toString() === player1._id.toString()
      )
      const player2Qualified = qualifiedPlayers.find(qp => 
        qp.player._id?.toString() === player2._id.toString() || 
        qp.player.toString() === player2._id.toString()
      )

      // Get player stats from their registration
      const player1Reg = player1.registrations?.find(r => r.league.toString() === id)
      const player2Reg = player2.registrations?.find(r => r.league.toString() === id)

      // Find their opponents from QF and SF
      const semifinals = await Match.find({
        league: id,
        matchType: 'playoff',
        'playoffInfo.group': playoffGroup,
        'playoffInfo.stage': 'semifinal'
      }).populate('players.player1 players.player2').lean()

      const quarterfinals = await Match.find({
        league: id,
        matchType: 'playoff',
        'playoffInfo.group': playoffGroup,
        'playoffInfo.stage': 'quarterfinal'
      }).populate('players.player1 players.player2').lean()

      // Helper to find opponent in a match
      const findOpponent = (matches, playerId) => {
        const match = matches.find(m => 
          m.players.player1._id.toString() === playerId || 
          m.players.player2._id.toString() === playerId
        )
        if (!match) return null
        const isPlayer1 = match.players.player1._id.toString() === playerId
        return isPlayer1 ? match.players.player2 : match.players.player1
      }

      const player1SfOpponent = findOpponent(semifinals, player1._id.toString())
      const player2SfOpponent = findOpponent(semifinals, player2._id.toString())
      const player1QfOpponent = findOpponent(quarterfinals, player1._id.toString())
      const player2QfOpponent = findOpponent(quarterfinals, player2._id.toString())

      // Prepare email data for both players
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tenisdp.es'
      const bracketUrl = `${baseUrl}/es/admin/leagues/${id}/playoffs`
      const dashboardUrl = `${baseUrl}/es/player/dashboard`

      const prepareEmailData = (player, opponent, playerQualified, opponentQualified, playerReg, qfOpponent, sfOpponent) => ({
        playerName: player.name,
        playerEmail: action === 'test' && testEmail ? testEmail : player.email,
        language: player.language || 'es',
        leagueName: league.name,
        playoffGroup,
        playerSeed: playerQualified?.seed || '?',
        opponentSeed: opponentQualified?.seed || '?',
        opponentName: opponent.name,
        opponentEmail: opponent.email,
        opponentWhatsApp: opponent.whatsapp,
        regularSeasonPosition: playerQualified?.position || playerReg?.position || '?',
        regularSeasonPoints: playerQualified?.points || playerReg?.points || '?',
        quarterfinalOpponent: qfOpponent?.name || 'TBD',
        semifinalOpponent: sfOpponent?.name || 'TBD',
        playerWins: 2, // They won QF and SF to reach final
        opponentWins: 2,
        playerElo: Math.round(player.eloRating || 1200),
        opponentElo: Math.round(opponent.eloRating || 1200),
        bracketUrl,
        dashboardUrl
      })

      const player1EmailData = prepareEmailData(
        player1, player2, player1Qualified, player2Qualified, 
        player1Reg, player1QfOpponent, player1SfOpponent
      )
      const player2EmailData = prepareEmailData(
        player2, player1, player2Qualified, player1Qualified,
        player2Reg, player2QfOpponent, player2SfOpponent
      )

      // Generate and send emails
      try {
        const player1Email = generateFinalistEmail(player1EmailData)
        const player2Email = generateFinalistEmail(player2EmailData)

        if (action === 'test') {
          // For testing, only send to test email
          if (!testEmail) {
            results.errors.push({
              group: playoffGroup,
              error: 'Test email address is required for testing'
            })
            continue
          }

          await sendEmail({
            to: testEmail,
            subject: `[TEST] ${player1Email.subject}`,
            html: player1Email.html
          })

          results.sent.push({
            group: playoffGroup,
            testEmail,
            message: `Test email sent to ${testEmail} (Player 1 version)`
          })
        } else if (action === 'send') {
          // Send to both finalists
          await Promise.all([
            sendEmail({
              to: player1.email,
              subject: player1Email.subject,
              html: player1Email.html
            }),
            sendEmail({
              to: player2.email,
              subject: player2Email.subject,
              html: player2Email.html
            })
          ])

          results.sent.push({
            group: playoffGroup,
            player1: player1.name,
            player2: player2.name,
            message: `Finalist emails sent to ${player1.name} and ${player2.name}`
          })
        } else {
          results.errors.push({
            group: playoffGroup,
            error: 'Invalid action. Use "test" or "send"'
          })
        }
      } catch (emailError) {
        console.error('Error sending finalist emails:', emailError)
        results.errors.push({
          group: playoffGroup,
          error: `Failed to send emails: ${emailError.message}`
        })
      }
    }

    return NextResponse.json({
      success: results.sent.length > 0,
      results
    })

  } catch (error) {
    console.error('Error in finalist emails endpoint:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process finalist emails' },
      { status: 500 }
    )
  }
}
