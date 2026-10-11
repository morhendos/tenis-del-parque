import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.+)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

const League = (await import('../lib/models/League.js')).default
const Player = (await import('../lib/models/Player.js')).default
const Match = (await import('../lib/models/Match.js')).default
const User = (await import('../lib/models/User.js')).default

const SLUG = 'test-league-autumn-2026'
const LOGIN_EMAIL = 'test-player@tenisdp.es'
const RIVAL_EMAIL = 'test-rival@tenisdp.es'

await mongoose.connect(process.env.MONGODB_URI)

const source = await League.findOne({ slug: 'sotogrande-silver-autumn-2026' }).lean()

let league = await League.findOne({ slug: SLUG })
if (!league) {
  const { _id, slug, name, skillLevel, stats, createdAt, updatedAt, __v, discountCodes, displayOrder, ...rest } = source
  league = await League.create({
    ...rest,
    name: 'Test League',
    slug: SLUG,
    skillLevel: 'all',
    status: 'active',
    displayOrder: 999
  })
}

const password = crypto.randomBytes(6).toString('base64url')

async function makePlayer(name, email, whatsapp) {
  let player = await Player.findOne({ email })
  if (!player) {
    player = new Player({ name, email, whatsapp, registrations: [] })
  }
  if (!player.registrations.some(r => String(r.league) === String(league._id))) {
    player.registrations.push({
      league: league._id,
      level: 'intermediate',
      status: 'confirmed',
      paymentStatus: 'waived'
    })
  }
  await player.save()
  return player
}

const me = await makePlayer('Test Player', LOGIN_EMAIL, '+34600000001')
const rival = await makePlayer('Test Rival', RIVAL_EMAIL, '+34600000002')

let user = await User.findOne({ email: LOGIN_EMAIL })
if (!user) {
  user = new User({ email: LOGIN_EMAIL, role: 'player', playerId: me._id, isActive: true, emailVerified: true })
}
user.password = password
await user.save()
if (String(me.userId || '') !== String(user._id)) {
  me.userId = user._id
  await me.save()
}

const existing = await Match.findOne({ league: league._id, round: 1 })
if (!existing) {
  await Match.create({
    league: league._id,
    season: 'autumn-2026',
    round: 1,
    players: { player1: me._id, player2: rival._id },
    schedule: { deadline: new Date('2026-10-25T21:59:59Z') },
    status: 'scheduled',
    createdBy: 'Test setup'
  })
}

fs.writeFileSync(path.join(__dirname, 'test-account.json'), JSON.stringify({ email: LOGIN_EMAIL, password, league: SLUG }, null, 2))
console.log('Test league ready:', SLUG)
console.log('Login saved to scripts/test-account.json')
await mongoose.disconnect()
