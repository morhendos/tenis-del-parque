/**
 * Push Notification Service for Tenis del Parque
 * 
 * Handles sending web push notifications to players.
 * Uses the web-push library with VAPID authentication.
 */

import webpush from 'web-push'
import dbConnect from '@/lib/db/mongoose'
import PushSubscription from '@/lib/models/PushSubscription'

// Configure VAPID — only once
let vapidConfigured = false

function ensureVapidConfigured() {
  if (vapidConfigured) return
  
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:info@tenisdelparque.com'
  
  if (!publicKey || !privateKey) {
    console.error('VAPID keys not configured. Push notifications will not work.')
    return
  }
  
  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
}

/**
 * Send push notification to a specific player (all their devices)
 */
export async function sendToPlayer(playerId, notification) {
  ensureVapidConfigured()
  await dbConnect()
  
  const subscriptions = await PushSubscription.find({
    playerId,
    isActive: true
  }).lean()

  if (subscriptions.length === 0) {
    console.log(`No active push subscriptions for player ${playerId}`)
    return { sent: 0, failed: 0 }
  }

  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPush(sub, notification))
  )

  const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.length - sent
  
  console.log(`Push to player ${playerId}: ${sent} sent, ${failed} failed`)
  return { sent, failed }
}

/**
 * Send push notification to multiple players
 */
export async function sendToPlayers(playerIds, notification) {
  ensureVapidConfigured()
  await dbConnect()
  
  const subscriptions = await PushSubscription.find({
    playerId: { $in: playerIds },
    isActive: true
  }).lean()

  if (subscriptions.length === 0) {
    console.log(`No active push subscriptions for ${playerIds.length} players`)
    return { sent: 0, failed: 0, noSubscription: playerIds.length }
  }

  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPush(sub, notification))
  )

  const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.length - sent
  
  // Find which players had subscriptions
  const subscribedPlayerIds = new Set(subscriptions.map(s => s.playerId.toString()))
  const noSubscription = playerIds.filter(id => !subscribedPlayerIds.has(id.toString())).length
  
  console.log(`Push to ${playerIds.length} players: ${sent} sent, ${failed} failed, ${noSubscription} without subscriptions`)
  return { sent, failed, noSubscription }
}

/**
 * Send push notification to all active subscribers in a league
 */
export async function sendToLeague(leagueId, notification) {
  ensureVapidConfigured()
  await dbConnect()
  
  // Find all players in the league
  const Player = (await import('@/lib/models/Player')).default
  const mongoose = (await import('mongoose')).default
  const leagueObjectId = new mongoose.Types.ObjectId(leagueId)
  
  const players = await Player.find({
    registrations: {
      $elemMatch: {
        league: leagueObjectId,
        status: { $in: ['active', 'confirmed'] }
      }
    }
  }, '_id').lean()

  const playerIds = players.map(p => p._id)
  
  if (playerIds.length === 0) {
    console.log(`No active players found in league ${leagueId}`)
    return { sent: 0, failed: 0, noSubscription: 0 }
  }

  return sendToPlayers(playerIds, notification)
}

/**
 * Send push to a single subscription document
 */
async function sendPush(subscriptionDoc, notification) {
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: notification.icon || '/web-app-manifest-192x192.png',
    badge: '/apple-touch-icon.png',
    tag: notification.tag || 'general',
    data: {
      url: notification.url || '/player/dashboard',
      ...notification.data
    },
    actions: notification.actions || [],
    requireInteraction: notification.requireInteraction || false
  })

  try {
    await webpush.sendNotification(subscriptionDoc.subscription, payload)
    
    // Update last used timestamp
    await PushSubscription.findByIdAndUpdate(subscriptionDoc._id, {
      lastUsed: new Date(),
      failedAttempts: 0
    })
    
    return { success: true }
  } catch (error) {
    console.error(`Push failed for ${subscriptionDoc.subscription.endpoint.slice(-20)}:`, error.statusCode || error.message)
    
    // Handle expired/invalid subscriptions (gone or not found)
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log('Subscription expired, marking as inactive')
      await PushSubscription.findByIdAndUpdate(subscriptionDoc._id, {
        isActive: false
      })
    } else {
      // Increment failed attempts, deactivate after 5 consecutive failures
      const updated = await PushSubscription.findByIdAndUpdate(
        subscriptionDoc._id,
        { $inc: { failedAttempts: 1 } },
        { new: true }
      )
      if (updated && updated.failedAttempts >= 5) {
        await PushSubscription.findByIdAndUpdate(subscriptionDoc._id, {
          isActive: false
        })
        console.log('Subscription deactivated after 5 failed attempts')
      }
    }
    
    return { success: false, error: error.message }
  }
}

/**
 * Get push subscription stats for admin dashboard
 */
export async function getSubscriptionStats() {
  await dbConnect()
  
  const total = await PushSubscription.countDocuments()
  const active = await PushSubscription.countDocuments({ isActive: true })
  const byPlatform = await PushSubscription.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$deviceInfo.platform', count: { $sum: 1 } } }
  ])
  
  return {
    total,
    active,
    inactive: total - active,
    byPlatform: Object.fromEntries(byPlatform.map(p => [p._id || 'unknown', p.count]))
  }
}

// ============================================================
// NOTIFICATION TEMPLATES (bilingual)
// ============================================================

export const notificationTemplates = {
  newMatch: (opponent, round, locale = 'es') => ({
    title: locale === 'es' ? '🎾 ¡Nuevo Partido!' : '🎾 New Match!',
    body: locale === 'es' 
      ? `Ronda ${round}: Te toca jugar contra ${opponent}`
      : `Round ${round}: You've been paired with ${opponent}`,
    tag: `new-match-round-${round}`,
    url: '/player/matches'
  }),
  
  resultSubmitted: (playerName, locale = 'es') => ({
    title: locale === 'es' ? '📝 Resultado Enviado' : '📝 Result Submitted',
    body: locale === 'es'
      ? `${playerName} ha enviado el resultado. Por favor, confírmalo.`
      : `${playerName} submitted the result. Please confirm.`,
    tag: 'result-submitted',
    url: '/player/matches',
    requireInteraction: true
  }),
  
  resultConfirmed: (opponent, result, locale = 'es') => ({
    title: locale === 'es' ? '✅ Resultado Confirmado' : '✅ Result Confirmed',
    body: locale === 'es'
      ? `${result} vs ${opponent}`
      : `${result} vs ${opponent}`,
    tag: 'result-confirmed',
    url: '/player/matches'
  }),
  
  matchReminder: (opponent, daysLeft, round, locale = 'es') => ({
    title: locale === 'es' ? '⏰ Recordatorio de Partido' : '⏰ Match Reminder',
    body: locale === 'es'
      ? `Te quedan ${daysLeft} día${daysLeft !== 1 ? 's' : ''} para jugar contra ${opponent} (Ronda ${round})`
      : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left to play against ${opponent} (Round ${round})`,
    tag: `reminder-round-${round}`,
    url: '/player/matches',
    requireInteraction: true
  }),
  
  newRound: (round, locale = 'es') => ({
    title: locale === 'es' ? '🚀 ¡Nueva Ronda!' : '🚀 New Round!',
    body: locale === 'es'
      ? `La Ronda ${round} ha comenzado. ¡Revisa tu rival!`
      : `Round ${round} has started. Check your opponent!`,
    tag: `new-round-${round}`,
    url: '/player/matches'
  }),
  
  playoffsQualified: (locale = 'es') => ({
    title: locale === 'es' ? '🏆 ¡Has Clasificado!' : '🏆 You Qualified!',
    body: locale === 'es'
      ? '¡Felicidades! Te has clasificado para los playoffs'
      : 'Congratulations! You\'ve qualified for the playoffs',
    tag: 'playoffs-qualified',
    url: '/player/league'
  }),
  
  custom: (title, body, url = '/player/dashboard') => ({
    title,
    body,
    tag: 'custom',
    url
  })
}
