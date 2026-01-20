import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import League from '@/lib/models/League'
import Match from '@/lib/models/Match'
import Player from '@/lib/models/Player'
import User from '@/lib/models/User'
import { requireAdmin } from '@/lib/auth/apiAuth'
import { sendEmail } from '@/lib/email/resend'
import { generateSeasonStartEmail } from '@/lib/email/templates/seasonStartEmail'

export const dynamic = 'force-dynamic'

/**
 * Get user's language preference by email
 * @param {string} email - Player's email
 * @returns {string} - 'es' or 'en'
 */
async function getUserLanguage(email) {
  if (!email) return 'es'
  
  try {
    const user = await User.findOne({ email }).select('preferences.language').lean()
    return user?.preferences?.language || 'es'
  } catch (error) {
    console.error('Error fetching user language:', error)
    return 'es'
  }
}

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

    // Get Round matches for this league
    const matches = await Match.find({
      league: id,
      round: round,
      matchType: 'regular'
    })
    .populate('players.player1', 'name email whatsapp')
    .populate('players.player2', 'name email whatsapp')

    // Get all player emails to fetch their language preferences
    const playerEmails = new Set()
    matches.forEach(match => {
      if (match.players.player1?.email) playerEmails.add(match.players.player1.email)
      if (match.players.player2?.email) playerEmails.add(match.players.player2.email)
    })

    // Fetch all user language preferences in one query
    const users = await User.find({ 
      email: { $in: Array.from(playerEmails) } 
    }).select('email preferences.language').lean()
    
    const languageMap = {}
    users.forEach(user => {
      languageMap[user.email] = user.preferences?.language || 'es'
    })

    // Build list of recipients with their match info and language
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
            email: player1.email,
            language: languageMap[player1.email] || 'es'
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
            email: player2.email,
            language: languageMap[player2.email] || 'es'
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

    // Count languages
    const spanishCount = recipients.filter(r => r.player.language === 'es').length
    const englishCount = recipients.filter(r => r.player.language === 'en').length

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
        playersWithoutMatches: playersWithoutMatches.length,
        spanishEmails: spanishCount,
        englishEmails: englishCount
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
      testLanguage = 'es', // Language for test emails
      languageOverrides = {}, // { email: 'es' | 'en' } - manual overrides from admin
      singlePlayerEmail = null // If provided, send only to this specific player
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

    // Get all player emails to fetch their language preferences
    const playerEmails = new Set()
    matches.forEach(match => {
      if (match.players.player1?.email) playerEmails.add(match.players.player1.email)
      if (match.players.player2?.email) playerEmails.add(match.players.player2.email)
    })

    // Fetch all user language preferences in one query
    const users = await User.find({ 
      email: { $in: Array.from(playerEmails) } 
    }).select('email preferences.language').lean()
    
    const languageMap = {}
    users.forEach(user => {
      languageMap[user.email] = user.preferences?.language || 'es'
    })

    // Build email list with language preferences
    const emailsToSend = []

    matches.forEach(match => {
      const player1 = match.players.player1
      const player2 = match.players.player2
      const isBye = match.isBye || !player2

      if (player1?.email) {
        // Check for admin override first, then user preference, then default to 'es'
        const language = languageOverrides[player1.email] || languageMap[player1.email] || 'es'
        emailsToSend.push({
          player: player1,
          opponent: isBye ? null : player2,
          isBye,
          language
        })
      }

      if (player2?.email && !isBye) {
        const language = languageOverrides[player2.email] || languageMap[player2.email] || 'es'
        emailsToSend.push({
          player: player2,
          opponent: player1,
          isBye: false,
          language
        })
      }
    })

    // Calculate deadline (7 days from now)
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 7)

    // If test email, only send to that address
    if (testEmail) {
      // Find a sample match to use for the test
      const sampleRegular = emailsToSend.find(e => !e.isBye)
      const sampleBye = emailsToSend.find(e => e.isBye)
      
      const results = []
      
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
          language: testLanguage
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
          language: testLanguage,
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
          language: testLanguage
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
          language: testLanguage,
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

    // If single player email, filter to just that player
    if (singlePlayerEmail) {
      const singlePlayerData = emailsToSend.find(e => e.player.email === singlePlayerEmail)
      
      if (!singlePlayerData) {
        return NextResponse.json({ 
          error: `Player with email ${singlePlayerEmail} not found in Round ${round}` 
        }, { status: 404 })
      }

      const emailContent = generateSeasonStartEmail({
        playerName: singlePlayerData.player.name,
        playerEmail: singlePlayerData.player.email,
        opponentName: singlePlayerData.opponent?.name,
        opponentWhatsApp: singlePlayerData.opponent?.whatsapp,
        leagueName: league.name,
        city: league.location?.city || '',
        season: league.season ? `${league.season.type}-${league.season.year}` : '',
        deadline: singlePlayerData.isBye ? null : deadline.toISOString(),
        isBye: singlePlayerData.isBye,
        language: singlePlayerData.language
      })

      const result = await sendEmail({
        to: singlePlayerData.player.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      })

      return NextResponse.json({
        mode: 'single',
        round,
        league: league.name,
        summary: {
          total: 1,
          sent: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
          spanishSent: result.success && singlePlayerData.language === 'es' ? 1 : 0,
          englishSent: result.success && singlePlayerData.language === 'en' ? 1 : 0
        },
        results: {
          sent: result.success ? [{
            email: singlePlayerData.player.email,
            name: singlePlayerData.player.name,
            isBye: singlePlayerData.isBye,
            language: singlePlayerData.language
          }] : [],
          failed: result.success ? [] : [{
            email: singlePlayerData.player.email,
            name: singlePlayerData.player.name,
            error: result.error
          }]
        }
      })
    }

    // Send to all players with their preferred language
    const results = {
      sent: [],
      failed: []
    }

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
        language: emailData.language // Use player's preferred language
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
          isBye: emailData.isBye,
          language: emailData.language
        })
      } else {
        results.failed.push({
          email: emailData.player.email,
          name: emailData.player.name,
          error: result.error
        })
      }

      // Delay between emails to avoid rate limiting (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // Count by language
    const spanishSent = results.sent.filter(r => r.language === 'es').length
    const englishSent = results.sent.filter(r => r.language === 'en').length

    return NextResponse.json({
      mode: 'production',
      round,
      league: league.name,
      summary: {
        total: emailsToSend.length,
        sent: results.sent.length,
        failed: results.failed.length,
        spanishSent,
        englishSent
      },
      results
    })

  } catch (error) {
    console.error('Error sending season start emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
