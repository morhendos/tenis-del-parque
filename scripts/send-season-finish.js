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

const { generateSeasonFinishRegistrationEmail } = await import('../lib/email/templates/seasonFinishRegistrationEmail.js')
const { sendEmail } = await import('../lib/email/resend.js')

const args = process.argv.slice(2)
const DO_SEND = args.includes('--send')
const arg = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null }
const SINGLE_TO = arg('--to')
const AS = arg('--as')
const FORCE_LANG = arg('--lang')
const SUBJECT_TAG = arg('--tag')

const SENT_LOG = path.join(__dirname, 'season3-finish-sent.json')
let sentLog = []
try { sentLog = JSON.parse(fs.readFileSync(SENT_LOG, 'utf8')) } catch {}

const BASE = 'https://www.tenisdp.es'
const SEASON_SLUG = /autumn-2026/
const EXCLUDE = /@tenisdp\.es$|tomasz/i
const SKIP = new Set(['dgt.juliya@gmail.com'])
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const LEVEL = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' }

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  const cities = await db.collection('cities').find({}).toArray()
  const leagues = await db.collection('leagues').find({ slug: SEASON_SLUG }).project({ slug: 1, city: 1, cityId: 1 }).toArray()
  const leagueInfo = {}
  for (const l of leagues) {
    const c = cities.find(x => String(x._id) === String(l.city || l.cityId || ''))
    const lvl = Object.keys(LEVEL).find(k => l.slug.includes(k))
    leagueInfo[String(l._id)] = { city: c, level: lvl ? LEVEL[lvl] : '' }
  }

  const players = await db.collection('players').find({ 'registrations.league': { $in: leagues.map(l => l._id) } }).toArray()
  const recipients = []
  for (const p of players) {
    if (EXCLUDE.test(p.email || '') || SKIP.has((p.email || '').toLowerCase())) continue
    if (p.preferences?.emailNotifications === false) continue
    const regs = (p.registrations || []).filter(r => leagueInfo[String(r.league)])
    if (regs.some(r => ['completed', 'waived'].includes(r.paymentStatus) || ['confirmed', 'active'].includes(r.status))) continue
    const reg = regs.find(r => r.paymentStatus === 'pending')
    if (!reg) continue
    const info = leagueInfo[String(reg.league)]
    const language = p.preferences?.preferredLanguage === 'en' ? 'en' : 'es'
    const cityName = info.city ? (info.city.name?.[language] || info.city.name?.es || '') : ''
    recipients.push({ name: p.name, email: p.email.toLowerCase(), language, leagueLabel: [cityName, info.level].filter(Boolean).join(' ') })
  }

  let list = recipients
  if (SINGLE_TO) {
    const base = recipients.find(r => r.email === (AS || '').toLowerCase()) || { name: 'Tom', language: 'es', leagueLabel: 'Sotogrande Silver' }
    list = [{ ...base, email: SINGLE_TO, ...(FORCE_LANG ? { language: FORCE_LANG } : {}) }]
  }
  for (const r of list) r.ctaUrl = `${BASE}/${r.language}/player/dashboard?utm_source=email&utm_medium=email&utm_campaign=season3-finish-registration`

  console.log(`Recipients: ${list.length}${SINGLE_TO ? ' (single --to)' : ''}${DO_SEND || SINGLE_TO ? '' : '  [DRY RUN - nothing sent]'}\n`)

  let ok = 0, fail = 0, skipped = 0, i = 0
  for (const r of list) {
    i++
    if (!DO_SEND && !SINGLE_TO) { console.log(`${r.email.padEnd(40)} ${r.language}  ${r.leagueLabel}`); continue }
    if (DO_SEND && sentLog.includes(r.email)) { skipped++; console.log(`[${i}/${list.length}] SKIP ${r.email}`); continue }
    const { subject, html, text } = generateSeasonFinishRegistrationEmail(r)
    const res = await sendEmail({ to: r.email, subject: SUBJECT_TAG ? `${subject} [${SUBJECT_TAG}]` : subject, html, text })
    if (res.success) {
      ok++
      console.log(`[${i}/${list.length}] SENT ${r.email}`)
      if (DO_SEND) { sentLog.push(r.email); fs.writeFileSync(SENT_LOG, JSON.stringify(sentLog, null, 2)) }
    } else { fail++; console.log(`[${i}/${list.length}] FAILED ${r.email}: ${res.error}`) }
    await sleep(700)
  }
  if (DO_SEND || SINGLE_TO) console.log(`\nSent: ${ok}, failed: ${fail}, skipped: ${skipped}`)
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
