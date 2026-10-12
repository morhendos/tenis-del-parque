import dbConnect from '@/lib/db/mongoose'
import LeaguePost from '@/lib/models/LeaguePost'
import Player from '@/lib/models/Player'
import Match from '@/lib/models/Match'
import '@/lib/models/League'
import { formatPlayerNameForPublic } from '@/lib/utils/playerNameUtils'

export const REACTIONS = ['👏', '🔥', '😂', '🎾']

const playerInfo = (p) => (p ? { _id: String(p._id), name: p.name, avatar: p.avatar || null, country: p.country || null } : null)

export function canAccessLeague(player, leagueId) {
  if (!player || !leagueId) return false
  return (player.registrations || []).some(r =>
    String(r.league?._id || r.league) === String(leagueId) &&
    r.status !== 'waiting' &&
    !(r.status === 'pending' && r.paymentStatus === 'pending')
  )
}

export async function getViewer(session) {
  await dbConnect()
  const isAdmin = session?.user?.role === 'admin'
  let player = null
  if (session?.user?.playerId) player = await Player.findById(session.user.playerId).select('name registrations.league registrations.status registrations.paymentStatus').lean()
  if (!player && session?.user?.email) player = await Player.findOne({ email: session.user.email.toLowerCase() }).select('name registrations.league registrations.status registrations.paymentStatus').lean()
  return { player, isAdmin }
}

export function communityUrl(leagueId) {
  return `/player/league?tab=community&leagueId=${leagueId}`
}

async function upsertAuto(autoKey, fields, update = false) {
  if (update) {
    return LeaguePost.findOneAndUpdate(
      { autoKey },
      { $set: { data: fields.data, deletedAt: null }, $setOnInsert: { league: fields.league, kind: 'auto', autoType: fields.autoType, autoKey } },
      { upsert: true, new: true }
    )
  }
  try {
    return await LeaguePost.create({ ...fields, kind: 'auto', autoKey })
  } catch (error) {
    if (error.code === 11000) return null
    throw error
  }
}

export async function postMatchResult(matchId) {
  try {
    await dbConnect()
    const match = await Match.findById(matchId)
      .populate('players.player1 players.player2', 'name avatar country')
      .lean()
    if (!match || match.isBye || match.status !== 'completed' || !match.result?.winner || !match.league) return
    const p1 = match.players?.player1
    const p2 = match.players?.player2
    if (!p1 || !p2) return
    const winnerIsP1 = String(match.result.winner) === String(p1._id)
    const walkover = !!match.result.score?.walkover
    const sets = walkover ? [] : (match.result.score?.sets || []).map(s => (winnerIsP1 ? [s.player1, s.player2] : [s.player2, s.player1]))
    await upsertAuto(`result:${match._id}`, {
      league: match.league,
      autoType: 'result',
      data: {
        matchId: String(match._id),
        round: match.round,
        playoff: match.matchType === 'playoff',
        winner: playerInfo(winnerIsP1 ? p1 : p2),
        loser: playerInfo(winnerIsP1 ? p2 : p1),
        sets,
        walkover,
        retired: !!match.result.score?.retiredPlayer
      }
    }, true)
  } catch (error) {
    console.error('postMatchResult failed:', error.message)
  }
}

export async function removeMatchResultPost(matchId) {
  try {
    await dbConnect()
    await LeaguePost.updateOne({ autoKey: `result:${matchId}` }, { $set: { deletedAt: new Date() } })
  } catch (error) {
    console.error('removeMatchResultPost failed:', error.message)
  }
}

export async function postNewPlayer(playerId, leagueId) {
  try {
    await dbConnect()
    const player = await Player.findById(playerId).select('name avatar country').lean()
    if (!player) return
    await upsertAuto(`new_player:${leagueId}:${playerId}`, {
      league: leagueId,
      autoType: 'new_player',
      data: { player: playerInfo(player) }
    })
  } catch (error) {
    console.error('postNewPlayer failed:', error.message)
  }
}

export async function postNewRound(leagueId, round) {
  try {
    await dbConnect()
    await upsertAuto(`new_round:${leagueId}:${round}`, {
      league: leagueId,
      autoType: 'new_round',
      data: { round }
    })
  } catch (error) {
    console.error('postNewRound failed:', error.message)
  }
}

export function serializePost(post, viewerId, isAdmin = false) {
  const viewer = viewerId ? String(viewerId) : null
  const counts = {}
  const mine = []
  for (const r of post.reactions || []) {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1
    if (viewer && String(r.player) === viewer) mine.push(r.emoji)
  }
  const authorId = post.author?._id ? String(post.author._id) : post.author ? String(post.author) : null
  return {
    _id: String(post._id),
    kind: post.kind,
    autoType: post.autoType,
    data: post.data,
    text: post.text || '',
    textEn: post.textEn || '',
    pinned: !!post.pinned,
    createdAt: post.createdAt,
    author: post.author?._id ? playerInfo(post.author) : null,
    reactions: REACTIONS.map(e => ({ emoji: e, count: counts[e] || 0, mine: mine.includes(e) })),
    comments: (post.comments || []).filter(c => !c.deletedAt).map(c => {
      const cAuthorId = c.author?._id ? String(c.author._id) : c.author ? String(c.author) : null
      return {
        _id: String(c._id),
        text: c.text,
        isAdmin: !!c.isAdmin,
        createdAt: c.createdAt,
        author: c.author?._id ? playerInfo(c.author) : null,
        canDelete: isAdmin || (!!viewer && cAuthorId === viewer)
      }
    }),
    canDelete: isAdmin || (post.kind === 'player' && !!viewer && authorId === viewer),
    reportedByMe: !!viewer && (post.reports || []).some(r => String(r.player) === viewer),
    reportCount: isAdmin ? (post.reports || []).length : undefined
  }
}

export function populatePost(query) {
  return query
    .populate('author', 'name avatar country')
    .populate('comments.author', 'name avatar country')
}

async function playersByLanguage(playerIds) {
  const players = await Player.find({ _id: { $in: playerIds } }).select('preferences.preferredLanguage').lean()
  const groups = { es: [], en: [] }
  for (const p of players) groups[p.preferences?.preferredLanguage === 'en' ? 'en' : 'es'].push(p._id)
  return groups
}

const clip = (s, n = 110) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s || '')

export async function notifyComment(post, comment, commenterId, commenterName) {
  try {
    const { sendToPlayers } = await import('@/lib/services/pushNotificationService')
    const targets = new Set()
    if (post.kind === 'player' && post.author) targets.add(String(post.author._id || post.author))
    if (post.kind === 'auto' && post.autoType === 'result' && post.data) {
      if (post.data.winner?._id) targets.add(String(post.data.winner._id))
      if (post.data.loser?._id) targets.add(String(post.data.loser._id))
    }
    if (commenterId) targets.delete(String(commenterId))
    if (targets.size === 0) return
    const groups = await playersByLanguage([...targets])
    const who = commenterName ? formatPlayerNameForPublic(commenterName) : 'Tenis del Parque'
    const url = communityUrl(post.league)
    for (const lang of ['es', 'en']) {
      if (groups[lang].length === 0) continue
      await sendToPlayers(groups[lang], {
        title: lang === 'es' ? `💬 ${who} ha comentado` : `💬 ${who} commented`,
        body: clip(comment.text),
        tag: `community-comment-${post._id}`,
        url
      })
    }
  } catch (error) {
    console.error('notifyComment failed:', error.message)
  }
}

export async function notifyAdminPost(post) {
  try {
    const { sendToPlayers } = await import('@/lib/services/pushNotificationService')
    const players = await Player.find({
      registrations: { $elemMatch: { league: post.league, status: { $in: ['active', 'confirmed'] } } }
    }).select('_id').lean()
    if (players.length === 0) return
    const groups = await playersByLanguage(players.map(p => p._id))
    const url = communityUrl(post.league)
    for (const lang of ['es', 'en']) {
      if (groups[lang].length === 0) continue
      const text = lang === 'en' ? (post.textEn || post.text) : (post.text || post.textEn)
      await sendToPlayers(groups[lang], {
        title: '📣 Tenis del Parque',
        body: clip(text),
        tag: `community-admin-${post._id}`,
        url
      }, { preferenceKey: 'announcements' })
    }
  } catch (error) {
    console.error('notifyAdminPost failed:', error.message)
  }
}
