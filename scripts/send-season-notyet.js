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

const { generateSeasonNotYetEmail } = await import('../lib/email/templates/seasonNotYetEmail.js')
const { sendEmail } = await import('../lib/email/resend.js')

const args = process.argv.slice(2)
const DO_SEND = args.includes('--send')
const arg = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null }
const SINGLE_TO = arg('--to')
const FORCE_LANG = arg('--lang')
const TEST_CITY = arg('--city')

const CITY_SLUGS = ['estepona', 'malaga']
const SEASON_SLUG = /autumn-2026/
const NOT_REAL = /@tenisdp\.es$|tomasz/i
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  const cities = await db.collection('cities').find({ slug: { $in: CITY_SLUGS } }).toArray()
  const leagues = await db.collection('leagues').find({}).project({ slug: 1, city: 1, cityId: 1 }).toArray()
  const leagueCity = {}
  for (const l of leagues) {
    if (!SEASON_SLUG.test(l.slug || '')) continue
    const c = cities.find(x => String(x._id) === String(l.city || l.cityId || ''))
    if (c) leagueCity[String(l._id)] = c
  }

  const players = await db.collection('players').find({ 'registrations.league': { $in: Object.keys(leagueCity).map(id => new mongoose.Types.ObjectId(id)) } }).toArray()

  const recipients = []
  for (const p of players) {
    if (NOT_REAL.test(p.email || '')) continue
    const reg = (p.registrations || []).find(r => leagueCity[String(r.league)] && r.paymentStatus === 'completed')
    if (!reg) continue
    const city = leagueCity[String(reg.league)]
    const language = p.preferences?.preferredLanguage === 'en' ? 'en' : 'es'
    recipients.push({ name: p.name, email: p.email, language, cityName: city.name?.[language] || city.name?.es || '' })
  }

  let list = recipients
  if (SINGLE_TO) {
    const base = recipients[0] || { name: 'Tom', language: 'es', cityName: 'Estepona' }
    let r = { ...base, email: SINGLE_TO }
    if (FORCE_LANG) r.language = FORCE_LANG
    if (TEST_CITY) r.cityName = TEST_CITY
    list = [r]
  }

  console.log(`Recipients: ${list.length}${SINGLE_TO ? ' (single --to)' : ''}${DO_SEND || SINGLE_TO ? '' : '  [DRY RUN - nothing sent]'}\n`)

  let ok = 0, fail = 0
  for (const r of list) {
    if (!DO_SEND && !SINGLE_TO) {
      console.log(`${r.email.padEnd(36)} ${r.language}  ${r.cityName.padEnd(10)} ${r.name}`)
      continue
    }
    const { subject, html, text } = generateSeasonNotYetEmail(r)
    const res = await sendEmail({ to: r.email, subject, html, text })
    if (res.success) { ok++; console.log(`SENT ${r.email}`) } else { fail++; console.log(`FAILED ${r.email}: ${res.error}`) }
    await sleep(700)
  }

  if (DO_SEND || SINGLE_TO) console.log(`\nSent: ${ok}, failed: ${fail}`)
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
