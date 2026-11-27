import fs from 'fs'
import path from 'path'
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

const SLUG = 'test-league-autumn-2026'
const LOGIN_EMAIL = 'test-player@tenisdp.es'
const RIVAL_EMAIL = 'test-rival@tenisdp.es'

await mongoose.connect(process.env.MONGODB_URI)

const league = await League.findOne({ slug: SLUG })
const me = await Player.findOne({ email: LOGIN_EMAIL })
const rival = await Player.findOne({ email: RIVAL_EMAIL })
if (!league || !me || !rival) {
  console.log('Test league or test players not found')
  await mongoose.disconnect()
  process.exit(1)
}

const open = await Match.findOne({ league: league._id, status: 'scheduled' })
if (open) {
  if (process.argv.includes('--urgent')) {
    open.schedule.deadline = new Date(Date.now() + 36 * 60 * 60 * 1000)
    await open.save()
    console.log(`Deadline of round ${open.round} moved to ${open.schedule.deadline.toISOString()}`)
    await mongoose.disconnect()
    process.exit(0)
  }
  console.log(`Open match already exists: round ${open.round} (${open._id})`)
  await mongoose.disconnect()
  process.exit(0)
}

const last = await Match.findOne({ league: league._id }).sort({ round: -1 }).select('round season')
const round = (last?.round || 0) + 1

const match = await Match.create({
  league: league._id,
  season: last?.season || 'autumn-2026',
  round,
  players: { player1: me._id, player2: rival._id },
  schedule: { deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
  status: 'scheduled'
})

console.log(`Created round ${round} match ${match._id} in ${league.name}`)
await mongoose.disconnect()
