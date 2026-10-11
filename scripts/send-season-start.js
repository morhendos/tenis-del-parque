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

const { generateSeasonStartEmail } = await import('../lib/email/templates/seasonStartEmail.js')
const { sendEmail } = await import('../lib/email/resend.js')

const args = process.argv.slice(2)
const arg = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null }
const SLUG = arg('--league')
const DO_SEND = args.includes('--send')
const SINGLE_TO = arg('--to')
const ES_ONLY = (arg('--es-only') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
if (!SLUG) { console.log('Usage: node scripts/send-season-start.js --league <slug> [--to email] [--send]'); process.exit(1) }

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

await mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection.db

const league = await db.collection('leagues').findOne({ slug: SLUG })
const matches = await db.collection('matches').find({ league: league._id, round: 1 }).toArray()
const ids = matches.flatMap(m => [m.players.player1, m.players.player2]).filter(Boolean)
const players = await db.collection('players').find({ _id: { $in: ids } }).toArray()
const users = await db.collection('users').find({ email: { $in: players.map(p => p.email) } }).project({ email: 1, 'preferences.language': 1 }).toArray()
const byId = (id) => players.find(p => String(p._id) === String(id))
const langOf = (p) => {
  if (ES_ONLY.length) return ES_ONLY.includes(p.email.toLowerCase()) ? 'es' : 'en'
  return users.find(u => u.email === p.email)?.preferences?.language || p.preferences?.preferredLanguage || 'es'
}

const recipients = []
for (const m of matches) {
  const p1 = byId(m.players.player1)
  const p2 = m.players.player2 ? byId(m.players.player2) : null
  const isBye = m.isBye === true || !p2
  const deadline = isBye ? null : m.schedule?.deadline
  if (p1) recipients.push({ player: p1, opponent: p2, isBye, deadline })
  if (p2) recipients.push({ player: p2, opponent: p1, isBye: false, deadline })
}

const SENT_LOG = path.join(__dirname, `season-start-sent-${SLUG}.json`)
let sentLog = []
try { sentLog = JSON.parse(fs.readFileSync(SENT_LOG, 'utf8')) } catch {}

let list = recipients
if (SINGLE_TO) list = recipients.slice(0, 1).map(r => ({ ...r, testTo: SINGLE_TO }))

console.log(`Recipients: ${list.length}${DO_SEND || SINGLE_TO ? '' : '  [DRY RUN]'}`)
let ok = 0, fail = 0
for (const r of list) {
  const language = langOf(r.player)
  const to = r.testTo || r.player.email
  if (!DO_SEND && !SINGLE_TO) {
    console.log(`${r.player.email.padEnd(36)} ${language}  ${r.isBye ? 'BYE' : 'vs ' + r.opponent?.name}`)
    continue
  }
  if (DO_SEND && sentLog.includes(to)) { console.log(`SKIP ${to}`); continue }
  const { subject, html, text } = generateSeasonStartEmail({
    playerName: r.player.name,
    opponentName: r.opponent?.name || null,
    opponentWhatsApp: r.opponent?.whatsapp || null,
    leagueName: league.name,
    city: league.location?.city || '',
    season: league.season ? `${league.season.type}-${league.season.year}` : '',
    deadline: r.deadline ? new Date(r.deadline).toISOString() : null,
    isBye: r.isBye,
    language
  })
  const res = await sendEmail({ to, subject, html, text })
  if (res.success) {
    ok++
    console.log(`SENT ${to}`)
    if (DO_SEND) { sentLog.push(to); fs.writeFileSync(SENT_LOG, JSON.stringify(sentLog, null, 2)) }
  } else {
    fail++
    console.log(`FAILED ${to}: ${res.error}`)
  }
  await sleep(700)
}
if (DO_SEND || SINGLE_TO) console.log(`Sent: ${ok}, failed: ${fail}`)
await mongoose.disconnect()
