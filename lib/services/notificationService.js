/**
 * Unified Notification Service for Tenis del Parque
 * 
 * Orchestrates sending messages via multiple channels (email + push).
 * Handles audience resolution (all players, league, round, individual).
 * Logs all messages to MessageLog for history.
 */

import mongoose from 'mongoose'
import dbConnect from '@/lib/db/mongoose'
import Player from '@/lib/models/Player'
import Match from '@/lib/models/Match'
import League from '@/lib/models/League'
import MessageLog from '@/lib/models/MessageLog'
import { sendToPlayer } from '@/lib/services/pushNotificationService'
import { sendEmail } from '@/lib/email/resend'

// ============================================================
// AUDIENCE RESOLUTION
// ============================================================

/**
 * Resolve audience to a list of players with their details.
 * Returns: [{ _id, name, email, preferredLanguage }]
 */
async function resolveAudience(audience) {
  await dbConnect()
  
  switch (audience.type) {
    case 'all': {
      // All active/confirmed players across all leagues
      const players = await Player.find({
        'registrations.status': { $in: ['active', 'confirmed'] }
      }, 'name email preferences').lean()
      
      return deduplicatePlayers(players)
    }
    
    case 'league': {
      if (!audience.leagueId) throw new Error('leagueId required for league audience')
      
      const leagueObjectId = new mongoose.Types.ObjectId(audience.leagueId)
      const players = await Player.find({
        registrations: {
          $elemMatch: {
            league: leagueObjectId,
            status: { $in: ['active', 'confirmed'] }
          }
        }
      }, 'name email preferences').lean()
      
      return deduplicatePlayers(players)
    }
    
    case 'round_unplayed': {
      if (!audience.leagueId || !audience.round) {
        throw new Error('leagueId and round required for round_unplayed audience')
      }
      
      // Find scheduled (unplayed) matches in this round
      const matches = await Match.find({
        league: audience.leagueId,
        round: audience.round,
        status: 'scheduled',
        isBye: { $ne: true }
      }).lean()
      
      // Collect player IDs from these matches
      const playerIds = new Set()
      matches.forEach(m => {
        if (m.players?.player1) playerIds.add(m.players.player1.toString())
        if (m.players?.player2) playerIds.add(m.players.player2.toString())
      })
      
      if (playerIds.size === 0) return []
      
      const players = await Player.find({
        _id: { $in: [...playerIds].map(id => new mongoose.Types.ObjectId(id)) }
      }, 'name email preferences').lean()
      
      return deduplicatePlayers(players)
    }
    
    case 'individual': {
      if (!audience.playerId) throw new Error('playerId required for individual audience')
      
      const player = await Player.findById(audience.playerId, 'name email preferences').lean()
      if (!player) throw new Error('Player not found')
      
      return [formatPlayer(player)]
    }
    
    default:
      throw new Error(`Unknown audience type: ${audience.type}`)
  }
}

function formatPlayer(player) {
  return {
    _id: player._id,
    name: player.name,
    email: player.email,
    preferredLanguage: player.preferences?.preferredLanguage || 'es'
  }
}

function deduplicatePlayers(players) {
  const seen = new Set()
  return players.filter(p => {
    const id = p._id.toString()
    if (seen.has(id)) return false
    seen.add(id)
    return true
  }).map(formatPlayer)
}

// ============================================================
// EMAIL BUILDER
// ============================================================

function buildEmailHtml(subject, body, locale = 'es') {
  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #563380 0%, #7c3aed 100%); padding: 24px 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">
                🎾 Tenis del Parque
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">
                ${subject}
              </h2>
              <div style="color: #4b5563; font-size: 15px; line-height: 1.7;">
                ${body.replace(/\n/g, '<br>')}
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 28px;">
                <a href="${process.env.NEXTAUTH_URL || 'https://www.tenisdp.es'}/${locale}/player/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #563380, #7c3aed); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  ${locale === 'es' ? 'Ir a mi Dashboard' : 'Go to Dashboard'}
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Tenis del Parque — Liga de Tenis Amateur Costa del Sol
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ============================================================
// MAIN SEND FUNCTION
// ============================================================

/**
 * Send a notification to a resolved audience via selected channels.
 * 
 * @param {Object} params
 * @param {Object} params.audience - { type, leagueId?, round?, playerId? }
 * @param {Object} params.channels - { email: boolean, push: boolean }
 * @param {Object} params.message - { subject, body, template? }
 * @param {Object} params.sender - { userId, name }
 * @returns {Object} - { success, stats, details, logId }
 */
export async function sendNotification({ audience, channels, message, sender }) {
  await dbConnect()
  
  // 1. Resolve audience to player list
  const players = await resolveAudience(audience)
  
  if (players.length === 0) {
    return {
      success: true,
      stats: { targetedPlayers: 0, emailsSent: 0, pushSent: 0 },
      details: [],
      message: 'No players found matching the audience criteria'
    }
  }
  
  console.log(`[MessageCenter] Sending to ${players.length} players via ${Object.entries(channels).filter(([,v]) => v).map(([k]) => k).join(' + ')}`)
  
  // 2. Resolve league name for logging
  let leagueName = null
  if (audience.leagueId) {
    const league = await League.findById(audience.leagueId, 'name').lean()
    leagueName = league?.name || null
  }
  
  // 3. Send to each player
  const stats = {
    targetedPlayers: players.length,
    emailsSent: 0,
    emailsFailed: 0,
    pushSent: 0,
    pushFailed: 0
  }
  const deliveryDetails = []
  
  for (const player of players) {
    const detail = {
      playerName: player.name,
      playerId: player._id,
      emailSent: false,
      pushSent: false
    }
    
    // Send email
    if (channels.email && player.email) {
      try {
        const html = buildEmailHtml(message.subject, message.body, player.preferredLanguage)
        const result = await sendEmail({
          to: player.email,
          subject: `🎾 ${message.subject}`,
          html,
          text: `${message.subject}\n\n${message.body}`
        })
        if (result.success) {
          stats.emailsSent++
          detail.emailSent = true
        } else {
          stats.emailsFailed++
        }
      } catch (err) {
        console.error(`[MessageCenter] Email failed for ${player.name}:`, err.message)
        stats.emailsFailed++
      }
    }
    
    // Send push
    if (channels.push) {
      try {
        const result = await sendToPlayer(player._id, {
          title: `🎾 ${message.subject}`,
          body: message.body.length > 200 ? message.body.substring(0, 197) + '...' : message.body,
          tag: `admin-message-${Date.now()}`,
          url: '/player/dashboard'
        })
        if (result.sent > 0) {
          stats.pushSent++
          detail.pushSent = true
        } else {
          stats.pushFailed++
        }
      } catch (err) {
        console.error(`[MessageCenter] Push failed for ${player.name}:`, err.message)
        stats.pushFailed++
      }
    }
    
    deliveryDetails.push(detail)
  }
  
  // 4. Log the message
  const log = await MessageLog.create({
    sentBy: sender.userId,
    sentByName: sender.name,
    audience: {
      type: audience.type,
      leagueId: audience.leagueId || undefined,
      leagueName,
      round: audience.round || undefined,
      playerId: audience.playerId || undefined,
      playerName: audience.type === 'individual' ? players[0]?.name : undefined
    },
    channels,
    message: {
      subject: message.subject,
      body: message.body,
      template: message.template || 'custom'
    },
    stats,
    deliveryDetails
  })
  
  console.log(`[MessageCenter] Done: ${stats.emailsSent} emails, ${stats.pushSent} push, logged as ${log._id}`)
  
  return {
    success: true,
    stats,
    details: deliveryDetails,
    logId: log._id
  }
}

/**
 * Get message history for admin dashboard
 */
export async function getMessageHistory(limit = 20) {
  await dbConnect()
  
  return MessageLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
}
