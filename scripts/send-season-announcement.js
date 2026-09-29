// Send the Season 3 announcement email to the player base.
// DRY RUN by default - prints who would get what, sends nothing.
//
//   node scripts/send-season-announcement.js                 -> dry run
//   node scripts/send-season-announcement.js --to a@b.com    -> send ONE real email to that address (uses that player's data if found)
//   node scripts/send-season-announcement.js --send          -> send to everyone listed by the dry run
//
// Respects preferences.emailNotifications === false. Excludes test accounts.

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

const { generateSeasonAnnouncementEmail } = await import('../lib/email/templates/seasonAnnouncementEmail.js')
const { sendEmail } = await import('../lib/email/resend.js')

const args = process.argv.slice(2)
const DO_SEND = args.includes('--send')
const toIdx = args.indexOf('--to')
const SINGLE_TO = toIdx !== -1 ? args[toIdx + 1] : null
const langIdx = args.indexOf('--lang')
const FORCE_LANG = langIdx !== -1 ? args[langIdx + 1] : null

const EXCLUDE = /tomasz\+|tomasz@skilling\.com|@tenisdp\.es|jan@urban\.com|@asdd\.as|@gma\.zs|@as\.as/i
const BASE = 'https://www.tenisdp.es'

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  const cities = await db.collection('cities').find({}).toArray()
  const leagues = await db.collection('leagues').find({}).project({ city: 1, cityId: 1 }).toArray()
  const leagueCity = {}
  for (const l of leagues) {
    const cid = String(l.city || l.cityId || '')
    const c = cities.find(x => String(x._id) === cid)
    if (c) leagueCity[String(l._id)] = c
  }

  const players = await db.collection('players').find({}).toArray()
  const seen = new Set()
  const recipients = []

  for (const p of players) {
    const email = (p.email || '').toLowerCase().trim()
    if (!email || seen.has(email)) continue
    seen.add(email)
    if (EXCLUDE.test(email)) continue
    if (p.preferences?.emailNotifications === false) continue

    const lastReg = (p.registrations || []).slice(-1)[0]
    const city = lastReg ? leagueCity[String(lastReg.league)] : null
    const language = p.preferences?.preferredLanguage === 'en' ? 'en' : 'es'
    const cityName = city ? (city.name?.[language] || city.name?.es || '') : ''
    const UTM = 'utm_source=email&utm_medium=email&utm_campaign=season3-announcement'
    const ctaUrl = city
      ? `${BASE}/${language}/leagues/${city.slug}?${UTM}`
      : `${BASE}/${language}/leagues?${UTM}`

    recipients.push({ name: p.name, email, language, cityName, ctaUrl })
  }

  let list = recipients
  if (SINGLE_TO) {
    const found = recipients.find(r => r.email === SINGLE_TO.toLowerCase())
    list = [found || { name: 'Test', email: SINGLE_TO, language: 'es', cityName: 'Sotogrande', ctaUrl: `${BASE}/es/leagues/sotogrande` }]
    if (FORCE_LANG) {
      list = list.map(r => ({ ...r, language: FORCE_LANG, ctaUrl: r.ctaUrl.replace(/\/(es|en)\//, `/${FORCE_LANG}/`) }))
    }
  }

  console.log(`Recipients: ${list.length}${SINGLE_TO ? ' (single --to)' : ''}${DO_SEND || SINGLE_TO ? '' : '  [DRY RUN - nothing sent]'}`)
  console.log('')

  let ok = 0, fail = 0
  for (const r of list) {
    if (!DO_SEND && !SINGLE_TO) {
      console.log(`${r.email.padEnd(42)} ${r.language}  ${(r.cityName || '-').padEnd(12)} ${r.ctaUrl}`)
      continue
    }
    const { subject, html, text } = generateSeasonAnnouncementEmail(r)
    const res = await sendEmail({ to: r.email, subject, html, text })
    if (res.success) { ok++ } else { fail++; console.log(`FAILED ${r.email}: ${res.error}`) }
    await sleep(700)
  }

  if (DO_SEND || SINGLE_TO) console.log(`\nSent: ${ok}, failed: ${fail}`)
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
