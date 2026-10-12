import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/db/mongoose'
import Player from '@/lib/models/Player'
import Match from '@/lib/models/Match'
import '@/lib/models/League'
import { requirePlayer } from '@/lib/auth/apiAuth'
import { calculateLeagueStandings } from '@/lib/services/standingsService'

export const dynamic = 'force-dynamic'

const OPENRANK_MATCHES_REQUIRED = 8

const idOf = (v) => String(v?._id || v || '')

function matchView(m, perspectiveId) {
  const isP1 = idOf(m.players.player1) === String(perspectiveId)
  const opp = isP1 ? m.players.player2 : m.players.player1
  const won = idOf(m.result.winner) === String(perspectiveId)
  const walkover = !!m.result.score?.walkover
  const sets = walkover ? [] : (m.result.score?.sets || []).map(s => ({
    mine: isP1 ? s.player1 : s.player2,
    theirs: isP1 ? s.player2 : s.player1
  }))
  return {
    _id: m._id,
    won,
    walkover,
    retired: !!m.result.score?.retiredPlayer,
    sets,
    round: m.round,
    matchType: m.matchType,
    date: m.result.playedAt || m.schedule?.confirmedDate || m.updatedAt,
    league: m.league ? { name: m.league.name, slug: m.league.slug } : null,
    opponent: opp ? { _id: opp._id, name: opp.name, avatar: opp.avatar || null, country: opp.country || null } : null
  }
}

async function getLeagueSummary(registration, playerId) {
  const league = registration.league
  const players = await Player.find({ 'registrations.league': league._id }).select('name registrations').lean()
  const shaped = players.map(p => {
    const reg = p.registrations.find(r => String(r.league) === String(league._id))
    if (!reg || (reg.status === 'pending' && reg.paymentStatus === 'pending')) return null
    return { _id: p._id, name: p.name, status: reg.status }
  }).filter(Boolean)

  const matches = await Match.find({
    league: league._id,
    status: 'completed',
    matchType: { $ne: 'playoff' }
  }).lean()

  const standings = calculateLeagueStandings(shaped, matches, true)
  const mine = standings.find(s => String(s.player._id) === String(playerId))
  const stats = mine?.stats || {}

  return {
    _id: league._id,
    name: league.name,
    slug: league.slug,
    status: league.status,
    level: registration.level,
    position: mine?.position || null,
    totalPlayers: standings.length,
    stats: {
      matchesPlayed: stats.matchesPlayed || 0,
      matchesWon: stats.matchesWon || 0,
      matchesLost: stats.matchesLost || 0,
      setsWon: stats.setsWon || 0,
      setsLost: stats.setsLost || 0,
      gamesWon: stats.gamesWon || 0,
      gamesLost: stats.gamesLost || 0,
      totalPoints: stats.totalPoints || 0
    }
  }
}

function pickRegistration(player, viewer) {
  const regs = (player.registrations || []).filter(r =>
    r.league && !(r.status === 'pending' && r.paymentStatus === 'pending') && r.status !== 'waiting'
  )
  if (regs.length === 0) return null
  const viewerLeagues = new Set((viewer?.registrations || []).map(r => String(r.league)))
  const shared = regs.find(r => viewerLeagues.has(String(r.league._id)) && r.league.status === 'active')
  if (shared) return shared
  const active = regs.find(r => r.league.status === 'active')
  if (active) return active
  return [...regs].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))[0]
}

async function getOpenRank(playerId) {
  const all = await Player.find({}).select('eloRating registrations.stats.matchesPlayed').lean()
  const rows = all.map(p => ({
    _id: String(p._id),
    elo: p.eloRating || 1200,
    played: (p.registrations || []).reduce((s, r) => s + (r.stats?.matchesPlayed || 0), 0)
  }))
  const me = rows.find(r => r._id === String(playerId))
  if (!me) return { position: null, matchesToQualify: OPENRANK_MATCHES_REQUIRED }
  if (me.played < OPENRANK_MATCHES_REQUIRED) {
    return { position: null, matchesToQualify: OPENRANK_MATCHES_REQUIRED - me.played }
  }
  const qualified = rows.filter(r => r.played >= OPENRANK_MATCHES_REQUIRED).sort((a, b) => b.elo - a.elo)
  return { position: qualified.findIndex(r => r._id === me._id) + 1, matchesToQualify: 0 }
}

export async function GET(request, { params }) {
  try {
    const { session, error } = await requirePlayer(request)
    if (error) return error

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    await dbConnect()

    const player = await Player.findById(id)
      .select('name avatar country tennisProfile eloRating highestElo registrations')
      .populate('registrations.league', 'name slug status season')
      .lean()
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const viewer = session.user.playerId
      ? await Player.findById(session.user.playerId).select('registrations.league').lean()
      : await Player.findOne({ email: session.user.email?.toLowerCase() }).select('registrations.league').lean()
    const isMe = viewer && String(viewer._id) === String(player._id)

    const matches = await Match.find({
      status: 'completed',
      isBye: { $ne: true },
      'result.winner': { $exists: true, $ne: null },
      $or: [{ 'players.player1': player._id }, { 'players.player2': player._id }]
    })
      .populate('players.player1', 'name avatar country')
      .populate('players.player2', 'name avatar country')
      .populate('league', 'name slug')
      .lean()

    const views = matches
      .map(m => matchView(m, player._id))
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    const allTime = { matchesPlayed: 0, matchesWon: 0, matchesLost: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0 }
    const leagueIds = new Set()
    for (const v of views) {
      allTime.matchesPlayed++
      if (v.won) allTime.matchesWon++
      else allTime.matchesLost++
      for (const s of v.sets) {
        if (s.mine > s.theirs) allTime.setsWon++
        else if (s.theirs > s.mine) allTime.setsLost++
        allTime.gamesWon += s.mine || 0
        allTime.gamesLost += s.theirs || 0
      }
    }
    for (const m of matches) if (m.league) leagueIds.add(String(m.league._id))
    for (const r of player.registrations || []) {
      if (r.league && ['confirmed', 'active', 'inactive'].includes(r.status) && r.league.status !== 'registration_open') {
        leagueIds.add(String(r.league._id))
      }
    }
    allTime.leagues = leagueIds.size

    let headToHead = null
    if (viewer && !isMe) {
      const together = matches
        .filter(m => [idOf(m.players.player1), idOf(m.players.player2)].includes(String(viewer._id)))
        .map(m => matchView(m, viewer._id))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      headToHead = {
        myWins: together.filter(v => v.won).length,
        theirWins: together.filter(v => !v.won).length,
        matches: together
      }
    }

    const registration = pickRegistration(player, viewer)
    const [league, openRank] = await Promise.all([
      registration ? getLeagueSummary(registration, player._id) : null,
      getOpenRank(player._id)
    ])

    return NextResponse.json({
      player: {
        _id: player._id,
        name: player.name,
        avatar: player.avatar || null,
        country: player.country || null,
        tennisProfile: player.tennisProfile || {},
        eloRating: player.eloRating || 1200,
        highestElo: player.highestElo || player.eloRating || 1200,
        level: registration?.level || null
      },
      isMe: !!isMe,
      openRank,
      league,
      allTime,
      recentResults: views.slice(0, 5),
      headToHead
    })
  } catch (err) {
    console.error('Error fetching player public profile:', err)
    return NextResponse.json({ error: 'Failed to fetch player profile' }, { status: 500 })
  }
}
