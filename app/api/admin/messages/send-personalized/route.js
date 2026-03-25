import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/db/mongoose'
import Match from '@/lib/models/Match'
import Player from '@/lib/models/Player'
import League from '@/lib/models/League'
import MessageLog from '@/lib/models/MessageLog'
import { requireAdmin } from '@/lib/auth/apiAuth'
import { sendToPlayer } from '@/lib/services/pushNotificationService'
import { sendEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/messages/send-personalized
 * 
 * Send personalized messages to each player with their specific pending matches.
 * Each player receives a unique email/push listing their unplayed matches + opponents.
 * 
 * Body:
 * {
 *   leagueId: string,
 *   subject: { es: string, en: string },
 *   intro: { es: string, en: string },       // text before match list
 *   outro: { es: string, en: string },        // text after match list
 *   deadlineDate: string,                     // e.g. "2025-08-10" - shown in message
 *   channels: { email: boolean, push: boolean }
 * }
 */
export async function POST(request) {
  try {
    const { session, error } = await requireAdmin(request)
    if (error) return error

    await dbConnect()

    const { leagueId, subject, intro, outro, deadlineDate, channels, testPlayerId } = await request.json()

    if (!leagueId) {
      return NextResponse.json({ error: 'leagueId is required' }, { status: 400 })
    }
    if (!channels?.email && !channels?.push) {
      return NextResponse.json({ error: 'At least one channel required' }, { status: 400 })
    }

    // 1. Get league info
    const league = await League.findById(leagueId, 'name').lean()
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    // 2. Get all scheduled (unplayed, non-bye) matches
    const matches = await Match.find({
      league: leagueId,
      status: 'scheduled',
      isBye: { $ne: true }
    })
      .populate('players.player1', 'name email preferences')
      .populate('players.player2', 'name email preferences')
      .lean()

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled matches found in this league',
        stats: { targetedPlayers: 0 }
      })
    }

    // 3. Group matches by player
    const playerMatchMap = new Map() // playerId -> { player, matches: [{ round, opponent }] }

    for (const match of matches) {
      const p1 = match.players?.player1
      const p2 = match.players?.player2
      if (!p1 || !p2) continue

      // Add match for player 1
      const p1Id = p1._id.toString()
      if (!playerMatchMap.has(p1Id)) {
        playerMatchMap.set(p1Id, {
          player: { _id: p1._id, name: p1.name, email: p1.email, lang: p1.preferences?.preferredLanguage || 'es' },
          matches: []
        })
      }
      playerMatchMap.get(p1Id).matches.push({ round: match.round, opponent: p2.name })

      // Add match for player 2
      const p2Id = p2._id.toString()
      if (!playerMatchMap.has(p2Id)) {
        playerMatchMap.set(p2Id, {
          player: { _id: p2._id, name: p2.name, email: p2.email, lang: p2.preferences?.preferredLanguage || 'es' },
          matches: []
        })
      }
      playerMatchMap.get(p2Id).matches.push({ round: match.round, opponent: p1.name })
    }

    // 4. Filter to test player if specified
    if (testPlayerId) {
      const testId = testPlayerId.toString()
      if (!playerMatchMap.has(testId)) {
        return NextResponse.json({
          success: false,
          error: 'Test player has no scheduled matches in this league'
        }, { status: 400 })
      }
      // Keep only the test player
      const testData = playerMatchMap.get(testId)
      playerMatchMap.clear()
      playerMatchMap.set(testId, testData)
      console.log('[Personalized] TEST MODE: sending only to ' + testData.player.name)
    }

    // 5. Send personalized message to each player
    const stats = {
      targetedPlayers: playerMatchMap.size,
      emailsSent: 0,
      emailsFailed: 0,
      pushSent: 0,
      pushFailed: 0
    }
    const deliveryDetails = []

    for (const [playerId, data] of playerMatchMap) {
      const { player, matches: playerMatches } = data
      const lang = player.lang
      const detail = { playerName: player.name, playerId: player._id, emailSent: false, pushSent: false, pendingMatches: playerMatches.length }

      // Sort matches by round
      playerMatches.sort((a, b) => a.round - b.round)

      // Build the match list text
      const matchListText = playerMatches
        .map(m => '  \u2022 Ronda ' + m.round + ': vs ' + m.opponent)
        .join('\n')

      const matchListHtml = playerMatches
        .map(m => '<tr><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #7c3aed;">Ronda ' + m.round + '</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">vs <strong>' + m.opponent + '</strong></td></tr>')
        .join('')

      // Pick language-specific content
      const subjectText = (lang === 'en' && subject?.en) ? subject.en : (subject?.es || subject || '')
      const introText = (lang === 'en' && intro?.en) ? intro.en : (intro?.es || intro || '')
      const outroText = (lang === 'en' && outro?.en) ? outro.en : (outro?.es || outro || '')

      const deadlineFormatted = deadlineDate 
        ? new Date(deadlineDate + 'T23:59:59').toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
        : null

      // Build email HTML
      const dashboardUrl = (process.env.NEXTAUTH_URL || 'https://www.tenisdp.es') + '/' + lang + '/player/matches'
      const ctaLabel = lang === 'es' ? 'Ver mis partidos' : 'View my matches'
      const matchCountLabel = lang === 'es' 
        ? playerMatches.length + ' partido' + (playerMatches.length > 1 ? 's' : '') + ' pendiente' + (playerMatches.length > 1 ? 's' : '')
        : playerMatches.length + ' pending match' + (playerMatches.length > 1 ? 'es' : '')

      const emailHtml = buildPersonalizedEmail({
        playerName: player.name.split(' ')[0], // first name
        subjectText,
        introText,
        outroText,
        matchListHtml,
        matchCountLabel,
        deadlineFormatted,
        dashboardUrl,
        ctaLabel,
        lang
      })

      // Plain text version
      const plainText = [
        subjectText,
        '',
        (lang === 'es' ? 'Hola ' : 'Hi ') + player.name.split(' ')[0] + '!',
        '',
        introText,
        '',
        (lang === 'es' ? 'Tus partidos pendientes:' : 'Your pending matches:'),
        matchListText,
        '',
        deadlineFormatted ? ((lang === 'es' ? 'Fecha l\u00edmite: ' : 'Deadline: ') + deadlineFormatted) : '',
        '',
        outroText,
        '',
        dashboardUrl
      ].filter(Boolean).join('\n')

      // Push body
      const pushBody = lang === 'es'
        ? 'Tienes ' + matchCountLabel + '. ' + (deadlineFormatted ? 'Plazo: ' + deadlineFormatted : '')
        : 'You have ' + matchCountLabel + '. ' + (deadlineFormatted ? 'Deadline: ' + deadlineFormatted : '')

      // Send email
      if (channels.email && player.email) {
        try {
          const result = await sendEmail({
            to: player.email,
            subject: subjectText,
            html: emailHtml,
            text: plainText
          })
          if (result.success) {
            stats.emailsSent++
            detail.emailSent = true
          } else {
            console.error('[Personalized] Email failed for ' + player.name + ':', result.error)
            stats.emailsFailed++
          }
        } catch (err) {
          console.error('[Personalized] Email error for ' + player.name + ':', err.message)
          stats.emailsFailed++
        }
      }

      // Send push
      if (channels.push) {
        try {
          const result = await sendToPlayer(player._id, {
            title: subjectText,
            body: pushBody,
            tag: 'personalized-last-chance',
            url: '/' + lang + '/player/matches'
          })
          if (result.sent > 0) {
            stats.pushSent++
            detail.pushSent = true
          } else {
            stats.pushFailed++
          }
        } catch (err) {
          console.error('[Personalized] Push error for ' + player.name + ':', err.message)
          stats.pushFailed++
        }
      }

      deliveryDetails.push(detail)
    }

    // 5. Log
    await MessageLog.create({
      sentBy: session.user.id,
      sentByName: session.user.name || session.user.email,
      audience: { type: 'league', leagueId, leagueName: league.name },
      channels,
      message: {
        subject: subject?.es || subject,
        body: '[Personalized] ' + (intro?.es || intro || '') + ' (' + matches.length + ' matches, ' + playerMatchMap.size + ' players)',
        template: 'personalized_last_chance'
      },
      stats,
      deliveryDetails
    })

    console.log('[Personalized] Done: ' + stats.emailsSent + ' emails, ' + stats.pushSent + ' push to ' + playerMatchMap.size + ' players')

    return NextResponse.json({
      success: true,
      stats,
      details: deliveryDetails,
      totalScheduledMatches: matches.length
    })
  } catch (error) {
    console.error('[Personalized] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send personalized messages', details: error.message },
      { status: 500 }
    )
  }
}


function buildPersonalizedEmail({ playerName, subjectText, introText, outroText, matchListHtml, matchCountLabel, deadlineFormatted, dashboardUrl, ctaLabel, lang }) {
  const deadlineSection = deadlineFormatted
    ? '<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 20px 0;">'
      + '<strong style="color: #92400e;">' + (lang === 'es' ? 'Fecha l\u00edmite' : 'Deadline') + ':</strong> '
      + '<span style="color: #78350f;">' + deadlineFormatted + '</span>'
      + '</div>'
    : ''

  return [
    '<!DOCTYPE html>',
    '<html lang="' + lang + '">',
    '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>',
    '<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Helvetica Neue\', Arial, sans-serif;">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">',
    '<tr><td align="center" style="padding: 20px;">',
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">',
    
    // Header
    '<tr><td style="background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); padding: 24px 32px; text-align: center;">',
    '<h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">&#127934; Tenis del Parque</h1>',
    '</td></tr>',
    
    // Content
    '<tr><td style="padding: 32px;">',
    
    // Greeting
    '<h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 20px;">' + (lang === 'es' ? '\u00a1Hola ' : 'Hi ') + playerName + '!</h2>',
    
    // Intro
    '<div style="color: #4b5563; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">' + introText.replace(/\n/g, '<br>') + '</div>',
    
    // Match count badge
    '<div style="background: #f3e8ff; border-radius: 8px; padding: 12px 16px; text-align: center; margin-bottom: 16px;">',
    '<span style="color: #7c3aed; font-weight: 700; font-size: 16px;">' + matchCountLabel + '</span>',
    '</div>',
    
    // Match table
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">',
    '<tr style="background: #f9fafb;">',
    '<th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">' + (lang === 'es' ? 'Ronda' : 'Round') + '</th>',
    '<th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">' + (lang === 'es' ? 'Rival' : 'Opponent') + '</th>',
    '</tr>',
    matchListHtml,
    '</table>',
    
    // Deadline
    deadlineSection,
    
    // Outro
    '<div style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 20px 0;">' + outroText.replace(/\n/g, '<br>') + '</div>',
    
    // CTA Button
    '<div style="text-align: center; margin-top: 24px;">',
    '<a href="' + dashboardUrl + '" style="display: inline-block; background: linear-gradient(135deg, #563380, #7c3aed); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">' + ctaLabel + '</a>',
    '</div>',
    
    '</td></tr>',
    
    // Footer
    '<tr><td style="padding: 20px 32px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">',
    '<p style="color: #9ca3af; font-size: 12px; margin: 0;">Tenis del Parque &mdash; Liga de Tenis Amateur Costa del Sol</p>',
    '</td></tr>',
    
    '</table>',
    '</td></tr></table>',
    '</body></html>'
  ].join('\n')
}
