import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import Match from '@/lib/models/Match'
import Player from '@/lib/models/Player'
import { requireAdmin } from '@/lib/auth/apiAuth'
import { sendEmail } from '@/lib/email/resend'
import { generateSeasonStartEmail } from '@/lib/email/templates/seasonStartEmail'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/leagues/[id]/season-start-email
 * Preview who will receive season start emails
 */
export async function GET(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { id } = params
    const { searchParams } = new URL(request.url)
    const round = parseInt(searchParams.get('round')) || 1

    // Get league
    const league = await League.findById(id)
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    // Get active players in this league
    const players = await Player.find({
      'registrations.league': id,
      'registrations.status': 'active'
    }).select('name email registrations')

    // Get Round 1 matches for this league
    const matches = await Match.find({
      league: id,
      round: round,
      matchType: 'regular'
    })
    .populate('players.player1', 'name email whatsapp')
    .populate('players.player2', 'name email whatsapp')

    // Build list of recipients with their match info
    const recipients = []
    const playersWithMatches = new Set()

    matches.forEach(match => {
      const player1 = match.players.player1
      const player2 = match.players.player2
      const isBye = match.isBye || !player2

      if (player1) {
        playersWithMatches.add(player1._id.toString())
        recipients.push({
          player: {
            _id: player1._id,
            name: player1.name,
            email: player1.email
          },
          opponent: isBye ? null : {
            name: player2?.name,
            whatsapp: player2?.whatsapp
          },
          isBye,
          matchId: match._id
        })
      }

      if (player2 && !isBye) {
        playersWithMatches.add(player2._id.toString())
        recipients.push({
          player: {
            _id: player2._id,
            name: player2.name,
            email: player2.email
          },
          opponent: {
            name: player1?.name,
            whatsapp: player1?.whatsapp
          },
          isBye: false,
          matchId: match._id
        })
      }
    })

    // Find active players without matches (shouldn't happen but good to know)
    const playersWithoutMatches = players.filter(
      p => !playersWithMatches.has(p._id.toString())
    ).map(p => ({ _id: p._id, name: p.name, email: p.email }))

    return NextResponse.json({
      league: {
        _id: league._id,
        name: league.name
      },
      round,
      recipients,
      playersWithoutMatches,
      summary: {
        totalRecipients: recipients.length,
        regularMatches: recipients.filter(r => !r.isBye).length,
        byeMatches: recipients.filter(r => r.isBye).length,
        playersWithoutMatches: playersWithoutMatches.length
      }
    })

  } catch (error) {
    console.error('Error getting season start email preview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/leagues/[id]/season-start-email
 * Send season start emails to players
 */
export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { id } = params
    const body = await request.json()
    const { 
      round = 1, 
      testEmail = null,  // If provided, send only to this email
      language = 'es' 
    } = body

    // Get league
    const league = await League.findById(id)
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    // Get matches for the specified round
    const matches = await Match.find({
      league: id,
      round: round,
      matchType: 'regular'
    })
    .populate('players.player1', 'name email whatsapp')
    .populate('players.player2', 'name email whatsapp')

    if (matches.length === 0) {
      return NextResponse.json({ 
        error: `No matches found for Round ${round}` 
      }, { status: 400 })
    }

    // Build email list
    const emailsToSend = []

    matches.forEach(match => {
      const player1 = match.players.player1
      const player2 = match.players.player2
      const isBye = match.isBye || !player2

      if (player1?.email) {
        emailsToSend.push({
          player: player1,
          opponent: isBye ? null : player2,
          isBye
        })
      }

      if (player2?.email && !isBye) {
        emailsToSend.push({
          player: player2,
          opponent: player1,
          isBye: false
        })
      }
    })

    // If test email, only send to that address
    if (testEmail) {
      // Find a sample match to use for the test
      const sampleRegular = emailsToSend.find(e => !e.isBye)
      const sampleBye = emailsToSend.find(e => e.isBye)
      
      const results = []
      
      // Calculate deadline (7 days from now for test)
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 7)
      
      // Send test regular match email
      if (sampleRegular) {
        const emailContent = generateSeasonStartEmail({
          playerName: sampleRegular.player.name,
          playerEmail: testEmail,
          opponentName: sampleRegular.opponent?.name,
          opponentWhatsApp: sampleRegular.opponent?.whatsapp,
          leagueName: league.name,
          city: league.location?.city || '',
          season: league.season ? `${league.season.type}-${league.season.year}` : '',
          deadline: deadline.toISOString(),
          isBye: false,
          language
        })
        
        const result = await sendEmail({
          to: testEmail,
          subject: `[TEST] ${emailContent.subject}`,
          html: emailContent.html,
          text: emailContent.text
        })
        
        results.push({
          type: 'regular',
          email: testEmail,
          success: result.success,
          error: result.error
        })
      }
      
      // Send test BYE email
      if (sampleBye) {
        const emailContent = generateSeasonStartEmail({
          playerName: sampleBye.player.name,
          playerEmail: testEmail,
          opponentName: null,
          opponentWhatsApp: null,
          leagueName: league.name,
          city: league.location?.city || '',
          season: league.season ? `${league.season.type}-${league.season.year}` : '',
          deadline: null,
          isBye: true,
          language
        })
        
        const result = await sendEmail({
          to: testEmail,
          subject: `[TEST BYE] ${emailContent.subject}`,
          html: emailContent.html,
          text: emailContent.text
        })
        
        results.push({
          type: 'bye',
          email: testEmail,
          success: result.success,
          error: result.error
        })
      }
      
      return NextResponse.json({
        mode: 'test',
        testEmail,
        results,
        message: `Test email(s) sent to ${testEmail}`
      })
    }

    // Send to all players
    const results = {
      sent: [],
      failed: []
    }

    // Calculate deadline (7 days from now)
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 7)

    for (const emailData of emailsToSend) {
      const emailContent = generateSeasonStartEmail({
        playerName: emailData.player.name,
        playerEmail: emailData.player.email,
        opponentName: emailData.opponent?.name,
        opponentWhatsApp: emailData.opponent?.whatsapp,
        leagueName: league.name,
        city: league.location?.city || '',
        season: league.season ? `${league.season.type}-${league.season.year}` : '',
        deadline: emailData.isBye ? null : deadline.toISOString(),
        isBye: emailData.isBye,
        language
      })

      const result = await sendEmail({
        to: emailData.player.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      })

      if (result.success) {
        results.sent.push({
          email: emailData.player.email,
          name: emailData.player.name,
          isBye: emailData.isBye
        })
      } else {
        results.failed.push({
          email: emailData.player.email,
          name: emailData.player.name,
          error: result.error
        })
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return NextResponse.json({
      mode: 'production',
      round,
      league: league.name,
      summary: {
        total: emailsToSend.length,
        sent: results.sent.length,
        failed: results.failed.length
      },
      results
    })

  } catch (error) {
    console.error('Error sending season start emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
