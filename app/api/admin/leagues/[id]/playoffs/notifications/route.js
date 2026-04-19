import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../../lib/db/mongoose'
import League from '../../../../../../../lib/models/League'
import Player from '../../../../../../../lib/models/Player'
import User from '../../../../../../../lib/models/User'
import Match from '../../../../../../../lib/models/Match'
import { requireAdmin } from '../../../../../../../lib/auth/apiAuth'
import { generatePlayoffEmail } from '../../../../../../../lib/email/templates/playoffEmail'
import { Resend } from 'resend'
import { normalizePhoneForWhatsApp, createWhatsAppLink } from '../../../../../../../lib/utils/phoneUtils'
import { sendToPlayer } from '../../../../../../../lib/services/pushNotificationService'

// Delay helper to avoid Resend rate limits (2/sec free tier)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const EMAIL_DELAY_MS = 600

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request, { params }) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()
    
    const body = await request.json()
    const { action, group = 'A', playerId } = body
    
    const league = await League.findById(params.id)
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }
    
    // Check if playoffs are initialized
    if (!league.playoffConfig?.enabled || !league.playoffConfig?.qualifiedPlayers) {
      return NextResponse.json({ error: 'Playoffs not initialized' }, { status: 400 })
    }
    
    // Player/user lookups and match pairing done below
    
    // Get scheduled playoff matches to find actual pairings (works for any stage)
    const playoffMatches = await Match.find({
      league: params.id,
      matchType: 'playoff',
      status: 'scheduled',
      'playoffInfo.group': group
    }).lean()
    
    console.log('[Playoff Notifications] Found', playoffMatches.length, 'scheduled playoff matches for group', group)
    
    // Build notifications from actual match pairings
    const notifications = []
    const errors = []
    
    // Get ALL player IDs from matches
    const matchPlayerIds = new Set()
    playoffMatches.forEach(m => {
      if (m.players?.player1) matchPlayerIds.add(m.players.player1.toString())
      if (m.players?.player2) matchPlayerIds.add(m.players.player2.toString())
    })
    
    // Fetch player + user data
    const allPlayerIds = [...matchPlayerIds]
    const matchPlayers = await Player.find({ _id: { $in: allPlayerIds } })
    const matchUsers = await User.find({ email: { $in: matchPlayers.map(p => p.email).filter(Boolean) } })
    
    const playerMap = new Map()
    matchPlayers.forEach(p => playerMap.set(p._id.toString(), p))
    const userByEmail = new Map()
    matchUsers.forEach(u => userByEmail.set(u.email, u))
    
    // Find seed info from qualified players config
    const qualifiedPlayers = league.playoffConfig.qualifiedPlayers[`group${group}`] || []
    const seedMap = new Map()
    qualifiedPlayers.forEach(qp => seedMap.set(qp.player.toString(), qp))
    
    for (const match of playoffMatches) {
      const stage = match.playoffInfo?.stage || 'quarterfinal'
      const p1Id = match.players.player1.toString()
      const p2Id = match.players.player2.toString()
      const player1 = playerMap.get(p1Id)
      const player2 = playerMap.get(p2Id)
      
      if (!player1 || !player2) {
        errors.push(`Match ${match._id}: missing player data`)
        continue
      }
      
      // Create notification for player 1
      const user1 = userByEmail.get(player1.email)
      const seed1 = seedMap.get(p1Id)
      notifications.push({
        player: player1,
        user: user1,
        data: {
          playerName: player1.name,
          playerEmail: player1.email,
          playerWhatsApp: player1.whatsapp,
          language: user1?.preferences?.language || 'es',
          position: seed1?.regularSeasonPosition || 0,
          points: seed1?.qualificationStats?.totalPoints || 0,
          seed: seed1?.seed || 0,
          playoffGroup: group,
          topPlayers: group === 'A' ? 8 : 16,
          leagueName: league.name,
          opponentName: player2.name,
          opponentSeed: seedMap.get(p2Id)?.seed || 0,
          opponentWhatsApp: player2.whatsapp || '',
          opponentMatches: seedMap.get(p2Id)?.qualificationStats?.matchesPlayed || 0,
          opponentPoints: seedMap.get(p2Id)?.qualificationStats?.totalPoints || 0,
          semifinalMatchup: '',
          bracketUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'}/${league.slug}/playoffs`,
          dashboardUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'}/player/dashboard`,
          stage
        },
        hasEmail: !!player1.email,
        hasWhatsApp: !!player1.whatsapp,
        playerId: p1Id
      })
      
      // Create notification for player 2
      const user2 = userByEmail.get(player2.email)
      const seed2 = seedMap.get(p2Id)
      notifications.push({
        player: player2,
        user: user2,
        data: {
          playerName: player2.name,
          playerEmail: player2.email,
          playerWhatsApp: player2.whatsapp,
          language: user2?.preferences?.language || 'es',
          position: seed2?.regularSeasonPosition || 0,
          points: seed2?.qualificationStats?.totalPoints || 0,
          seed: seed2?.seed || 0,
          playoffGroup: group,
          topPlayers: group === 'A' ? 8 : 16,
          leagueName: league.name,
          opponentName: player1.name,
          opponentSeed: seed1?.seed || 0,
          opponentWhatsApp: player1.whatsapp || '',
          opponentMatches: seed1?.qualificationStats?.matchesPlayed || 0,
          opponentPoints: seed1?.qualificationStats?.totalPoints || 0,
          semifinalMatchup: '',
          bracketUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'}/${league.slug}/playoffs`,
          dashboardUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'}/player/dashboard`,
          stage
        },
        hasEmail: !!player2.email,
        hasWhatsApp: !!player2.whatsapp,
        playerId: p2Id
      })
    }
    
    if (notifications.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No scheduled playoff matches found for Group ' + group + '. Create the next round matches first.'
      }, { status: 400 })
    }
    
    console.log('[Playoff Notifications] Built', notifications.length, 'notifications for stage:', playoffMatches[0]?.playoffInfo?.stage)

    // Process based on action
    if (action === 'sendIndividualEmail') {
      // INDIVIDUAL EMAIL FEATURE: Send email to a specific player for testing
      if (!resend) {
        return NextResponse.json({ 
          error: 'Email service not configured. Please set RESEND_API_KEY in environment variables.' 
        }, { status: 503 })
      }
      
      if (!playerId) {
        return NextResponse.json({ error: 'Player ID is required for individual email' }, { status: 400 })
      }
      
      const notification = notifications.find(n => n.playerId === playerId)
      if (!notification) {
        return NextResponse.json({ error: 'Player not found in qualified players' }, { status: 404 })
      }
      
      if (!notification.hasEmail) {
        return NextResponse.json({ error: `No email address for ${notification.player.name}` }, { status: 400 })
      }
      
      try {
        const emailContent = generatePlayoffEmail(notification.data)
        
        const { data, error } = await resend.emails.send({
          from: 'Tenis del Parque <noreply@tenisdp.es>',
          to: notification.data.playerEmail,
          subject: emailContent.subject,
          html: emailContent.html
        })
        
        if (error) {
          return NextResponse.json({ 
            success: false, 
            error: `Failed to send: ${error.message}` 
          }, { status: 500 })
        }
        
        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${notification.player.name} (${notification.data.playerEmail})`,
          player: notification.player.name,
          email: notification.data.playerEmail,
          emailId: data?.id
        })
      } catch (err) {
        return NextResponse.json({ 
          success: false, 
          error: `Error sending email: ${err.message}` 
        }, { status: 500 })
      }
      
    } else if (action === 'sendEmails') {
      // BULK EMAIL + PUSH: Send to all qualified players
      if (!resend) {
        return NextResponse.json({ 
          error: 'Email service not configured. Please set RESEND_API_KEY in environment variables.' 
        }, { status: 503 })
      }
      
      const emailResults = []
      let pushSent = 0
      
      for (const notification of notifications) {
        // Send email
        if (notification.hasEmail) {
          // Throttle: wait between emails to avoid Resend rate limits
          if (emailResults.length > 0 || errors.length > 0) {
            await sleep(EMAIL_DELAY_MS)
          }
          try {
            const emailContent = generatePlayoffEmail(notification.data)
            
            const { data, error } = await resend.emails.send({
              from: 'Tenis del Parque <noreply@tenisdp.es>',
              to: notification.data.playerEmail,
              subject: emailContent.subject,
              html: emailContent.html
            })
            
            if (error) {
              errors.push(`Failed to send to ${notification.player.name}: ${error.message}`)
            } else {
              emailResults.push({
                player: notification.player.name,
                email: notification.data.playerEmail,
                success: true,
                emailId: data?.id
              })
            }
          } catch (err) {
            errors.push(`Error sending to ${notification.player.name}: ${err.message}`)
          }
        } else {
          errors.push(`No email for ${notification.player.name}`)
        }
        
        // Send push notification
        try {
          const { language, playerName, seed, opponentName, opponentSeed, leagueName } = notification.data
          const pushTitle = language === 'es'
            ? `Playoffs ${leagueName}`
            : `${leagueName} Playoffs`
          const pushBody = language === 'es'
            ? `Seed #${seed} \u2014 ${notification.data.stage === "semifinal" ? (language === "es" ? "Semifinal" : "Semifinal") : notification.data.stage === "final" ? "Final" : notification.data.stage === "third_place" ? (language === "es" ? "3er Puesto" : "3rd Place") : (language === "es" ? "Cuartos de Final" : "Quarterfinal")} vs ${opponentName} (Seed #${opponentSeed})`
            : `Seed #${seed} \u2014 Quarterfinal vs ${opponentName} (Seed #${opponentSeed})`
          
          const result = await sendToPlayer(notification.player._id, {
            title: pushTitle,
            body: pushBody,
            tag: 'playoff-pairing',
            url: '/' + (language || 'es') + '/player/matches'
          })
          if (result.sent > 0) pushSent++
        } catch (err) {
          console.error(`Push error for ${notification.player.name}:`, err.message)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Emails sent to ${emailResults.length} players, ${pushSent} push notifications delivered`,
        results: emailResults,
        pushSent,
        errors: errors.length > 0 ? errors : undefined
      })
      
    } else if (action === 'generateWhatsApp') {
      // WHATSAPP MESSAGES: Generate messages and links
      const whatsappMessages = []
      
      for (const notification of notifications) {
        if (!notification.hasWhatsApp) {
          errors.push(`No WhatsApp for ${notification.player.name}`)
          continue
        }
        
        const { language, playerName, seed, opponentName, opponentSeed } = notification.data
        
        const message = language === 'es' 
          ? `🏆 ¡Felicidades ${playerName}!\n\nHas clasificado para los PLAYOFFS como cabeza de serie #${seed} 🎾\n\nTu primer partido (cuartos de final):\n👤 Rival: ${opponentName} (Seed #${opponentSeed})\n\n📱 Ponte en contacto con tu rival para programar el partido.\n\n🔗 Ver cuadro completo: ${notification.data.bracketUrl}\n\n¡Mucha suerte! 💪`
          : `🏆 Congratulations ${playerName}!\n\nYou've qualified for the PLAYOFFS as seed #${seed} 🎾\n\nYour first match (quarterfinals):\n👤 Opponent: ${opponentName} (Seed #${opponentSeed})\n\n📱 Contact your opponent to schedule the match.\n\n🔗 View full bracket: ${notification.data.bracketUrl}\n\nGood luck! 💪`
        
        const normalizedPhone = normalizePhoneForWhatsApp(notification.player.whatsapp)
        const whatsappLink = createWhatsAppLink(normalizedPhone, message)
        
        whatsappMessages.push({
          player: notification.player.name,
          phone: notification.player.whatsapp,
          seed: notification.data.seed,
          opponent: notification.data.opponentName,
          link: whatsappLink,
          message
        })
      }
      
      return NextResponse.json({
        success: true,
        message: `Generated WhatsApp messages for ${whatsappMessages.length} players`,
        whatsappMessages,
        errors: errors.length > 0 ? errors : undefined
      })
      
    } else if (action === 'preview') {
      // PREVIEW: Show what will be sent without actually sending
      const previews = []
      
      for (const notification of notifications) {
        const emailContent = generatePlayoffEmail(notification.data)
        
        previews.push({
          player: notification.player.name,
          playerId: notification.playerId,
          seed: notification.data.seed,
          email: notification.data.playerEmail,
          whatsapp: notification.player.whatsapp,
          hasEmail: notification.hasEmail,
          hasWhatsApp: notification.hasWhatsApp,
          emailSubject: emailContent.subject,
          opponent: notification.data.opponentName,
          language: notification.data.language
        })
      }
      
      return NextResponse.json({
        success: true,
        previews,
        group,
        totalPlayers: previews.length,
        actions: {
          sendIndividualEmail: 'Send test email to one player',
          sendEmails: 'Send emails to all players',
          generateWhatsApp: 'Generate WhatsApp messages'
        }
      })
      
    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Valid actions: preview, sendIndividualEmail, sendEmails, generateWhatsApp' 
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error in playoff notifications:', error)
    return NextResponse.json(
      { error: 'Failed to process notifications', details: error.message },
      { status: 500 }
    )
  }
}
