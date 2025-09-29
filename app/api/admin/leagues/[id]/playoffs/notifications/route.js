import { NextResponse } from 'next/server'
import dbConnect from '../../../../../../../lib/db/mongoose'
import League from '../../../../../../../lib/models/League'
import Player from '../../../../../../../lib/models/Player'
import User from '../../../../../../../lib/models/User'
import { requireAdmin } from '../../../../../../../lib/auth/apiAuth'
import { generatePlayoffEmail } from '../../../../../../../lib/email/templates/playoffEmail'
import { Resend } from 'resend'
import { normalizePhoneForWhatsApp, createWhatsAppLink } from '../../../../../../../lib/utils/phoneUtils'

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
    
    const qualifiedPlayers = league.playoffConfig.qualifiedPlayers[`group${group}`] || []
    if (qualifiedPlayers.length === 0) {
      return NextResponse.json({ error: `No qualified players in Group ${group}` }, { status: 400 })
    }
    
    // Get full player and user data
    const playerIds = qualifiedPlayers.map(qp => qp.player)
    const players = await Player.find({ _id: { $in: playerIds } })
    const users = await User.find({ playerId: { $in: playerIds } })
    
    // Create a map for quick lookups
    const playerMap = new Map()
    players.forEach(p => playerMap.set(p._id.toString(), p))
    
    const userMap = new Map()
    users.forEach(u => userMap.set(u.playerId?.toString(), u))
    
    // Prepare notification data for each qualified player
    const notifications = []
    const errors = []
    const topPlayers = group === 'A' ? 8 : 16
    
    for (const qualified of qualifiedPlayers) {
      const player = playerMap.get(qualified.player.toString())
      const user = userMap.get(qualified.player.toString())
      
      if (!player) {
        errors.push(`Player ${qualified.player} not found`)
        continue
      }
      
      // Find opponent based on seeding
      const seed = qualified.seed
      let opponentSeed, opponent, opponentQualified
      
      // Standard tournament pairing: 1v8, 4v5, 3v6, 2v7
      if (seed === 1) opponentSeed = 8
      else if (seed === 8) opponentSeed = 1
      else if (seed === 4) opponentSeed = 5
      else if (seed === 5) opponentSeed = 4
      else if (seed === 3) opponentSeed = 6
      else if (seed === 6) opponentSeed = 3
      else if (seed === 2) opponentSeed = 7
      else if (seed === 7) opponentSeed = 2
      
      opponentQualified = qualifiedPlayers.find(q => q.seed === opponentSeed)
      if (opponentQualified) {
        opponent = playerMap.get(opponentQualified.player.toString())
      }
      
      // Determine semifinal matchup text
      let semifinalMatchup = ''
      if (seed === 1 || seed === 8) {
        semifinalMatchup = '4/5'
      } else if (seed === 4 || seed === 5) {
        semifinalMatchup = '1/8'
      } else if (seed === 3 || seed === 6) {
        semifinalMatchup = '2/7'
      } else if (seed === 2 || seed === 7) {
        semifinalMatchup = '3/6'
      }
      
      // Prepare notification data
      const notificationData = {
        playerName: player.name,
        playerEmail: player.email || user?.email,
        playerWhatsApp: player.whatsapp,
        language: user?.preferences?.language || 'es',
        position: qualified.regularSeasonPosition,
        points: qualified.qualificationStats?.totalPoints || 0,
        seed: qualified.seed,
        playoffGroup: group,
        topPlayers,
        leagueName: league.name,
        opponentName: opponent?.name || 'Por determinar',
        opponentSeed: opponentSeed,
        opponentWhatsApp: opponent?.whatsapp || '',
        opponentMatches: opponentQualified?.qualificationStats?.matchesPlayed || 0,
        opponentPoints: opponentQualified?.qualificationStats?.totalPoints || 0,
        semifinalMatchup: `Partido ${semifinalMatchup}`,
        bracketUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'}/${league.slug}/playoffs`,
        dashboardUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdp.es'}/player/dashboard`
      }
      
      notifications.push({
        player,
        user,
        data: notificationData,
        hasEmail: !!(player.email || user?.email),
        hasWhatsApp: !!player.whatsapp,
        playerId: player._id.toString()
      })
    }
    
    // Process based on action
    if (action === 'sendIndividualEmail') {
      // NEW ACTION: Send email to a specific player
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
          email: notification.data.playerEmail
        })
      } catch (err) {
        return NextResponse.json({ 
          success: false, 
          error: `Error sending email: ${err.message}` 
        }, { status: 500 })
      }
      
    } else if (action === 'sendEmails') {
      if (!resend) {
        return NextResponse.json({ 
          error: 'Email service not configured. Please set RESEND_API_KEY in environment variables.' 
        }, { status: 503 })
      }
      
      const emailResults = []
      
      for (const notification of notifications) {
        if (!notification.hasEmail) {
          errors.push(`No email for ${notification.player.name}`)
          continue
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
              success: true
            })
          }
        } catch (err) {
          errors.push(`Error sending to ${notification.player.name}: ${err.message}`)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Emails sent to ${emailResults.length} players`,
        results: emailResults,
        errors: errors.length > 0 ? errors : undefined
      })
      
    } else if (action === 'generateWhatsApp') {
      // Generate WhatsApp messages and links
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
      // Generate preview of notifications
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
          opponent: notification.data.opponentName
        })
      }
      
      return NextResponse.json({
        success: true,
        previews,
        group,
        totalPlayers: previews.length
      })
      
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error sending playoff notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications', details: error.message },
      { status: 500 }
    )
  }
}
