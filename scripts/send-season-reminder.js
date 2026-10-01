// Season 3 reminder ("we're waiting for you") to announcement recipients who haven't registered yet.
// DRY RUN by default - prints who would get what, sends nothing.
//
//   node scripts/send-season-reminder.js                 -> dry run
//   node scripts/send-season-reminder.js --to a@b.com    -> send ONE real email to that address
//        [--lang en] [--code LOYAL50] [--tag TEST]
//   node scripts/send-season-reminder.js --send          -> send to everyone listed by the dry run

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

const { generateSeasonReminderEmail } = await import('../lib/email/templates/seasonReminderEmail.js')
const { sendEmail } = await import('../lib/email/resend.js')

const args = process.argv.slice(2)
const DO_SEND = args.includes('--send')
const arg = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null }
const SINGLE_TO = arg('--to')
const FORCE_LANG = arg('--lang')
const SUBJECT_TAG = arg('--tag')
const TEST_CODE = arg('--code')

const readJson = (f, fallback) => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8')) } catch { return fallback } }
const loyaltyMap = readJson('loyalty-codes.json', {})
const announced = readJson('season3-sent.json', [])
const SENT_LOG = path.join(__dirname, 'season3-reminder-sent.json')
const sentLog = readJson('season3-reminder-sent.json', [])

const BASE = 'https://www.tenisdp.es'
const SEASON_SLUG = /autumn-2026/
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

function buildUrl(language, citySlug, code) {
  const utm = `utm_source=email&utm_medium=email&utm_campaign=${code ? 'season3-reminder-loyalty50' : 'season3-reminder'}`
  const codePart = code ? `code=${encodeURIComponent(code)}&` : ''
  return citySlug ? `${BASE}/${language}/leagues/${citySlug}?${codePart}${utm}` : `${BASE}/${language}/leagues?${codePart}${utm}`
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  const cities = await db.collection('cities').find({}).toArray()
  const leagues = await db.collection('leagues').find({}).project({ slug: 1, city: 1, cityId: 1 }).toArray()
  const leagueCity = {}
  for (const l of leagues) {
    const c = cities.find(x => String(x._id) === String(l.city || l.cityId || ''))
    if (c) leagueCity[String(l._id)] = c
  }
  const seasonLeagueIds = new Set(leagues.filter(l => SEASON_SLUG.test(l.slug || '')).map(l => String(l._id)))

  const players = await db.collection('players').find({}).toArray()
  const byEmail = {}
  for (const p of players) {
    const e = (p.email || '').toLowerCase().trim()
    if (e && !byEmail[e]) byEmail[e] = p
  }

  const recipients = []
  for (const email of announced) {
    const p = byEmail[email]
    if (!p) continue
    if (p.preferences?.emailNotifications === false) continue
    if ((p.registrations || []).some(r => seasonLeagueIds.has(String(r.league)))) continue

    const lastReg = (p.registrations || []).slice(-1)[0]
    const city = lastReg ? leagueCity[String(lastReg.league)] : null
    const language = p.preferences?.preferredLanguage === 'en' ? 'en' : 'es'
    const cityName = city ? (city.name?.[language] || city.name?.es || '') : ''
    const loyalty = loyaltyMap[email]
    const code = (typeof loyalty === 'string' ? loyalty : loyalty?.code) || null
    recipients.push({ name: p.name, email, language, cityName, citySlug: city?.slug, discountCode: code, ctaUrl: buildUrl(language, city?.slug, code) })
  }

  let list = recipients
  if (SINGLE_TO) {
    const found = recipients.find(r => r.email === SINGLE_TO.toLowerCase())
    let r = found || { name: 'Tom', email: SINGLE_TO, language: 'es', cityName: 'Sotogrande', citySlug: 'sotogrande', discountCode: null }
    if (FORCE_LANG) r = { ...r, language: FORCE_LANG }
    if (TEST_CODE) r = { ...r, discountCode: TEST_CODE }
    r.ctaUrl = buildUrl(r.language, r.citySlug, r.discountCode)
    list = [r]
  }

  console.log(`Recipients: ${list.length}${SINGLE_TO ? ' (single --to)' : ''}${DO_SEND || SINGLE_TO ? '' : '  [DRY RUN - nothing sent]'}\n`)

  let ok = 0, fail = 0, skipped = 0, i = 0
  for (const r of list) {
    i++
    if (!DO_SEND && !SINGLE_TO) {
      console.log(`${r.email.padEnd(42)} ${r.language}  ${(r.cityName || '-').padEnd(12)} ${r.discountCode || ''}`)
      continue
    }
    if (DO_SEND && sentLog.includes(r.email)) {
      skipped++
      console.log(`[${i}/${list.length}] SKIP (already sent) ${r.email}`)
      continue
    }
    const { subject, html, text } = generateSeasonReminderEmail(r)
    const res = await sendEmail({ to: r.email, subject: SUBJECT_TAG ? `${subject} [${SUBJECT_TAG}]` : subject, html, text })
    if (res.success) {
      ok++
      console.log(`[${i}/${list.length}] SENT ${r.email}`)
      if (DO_SEND) {
        sentLog.push(r.email)
        fs.writeFileSync(SENT_LOG, JSON.stringify(sentLog, null, 2))
      }
    } else {
      fail++
      console.log(`[${i}/${list.length}] FAILED ${r.email}: ${res.error}`)
    }
    await sleep(700)
  }

  if (DO_SEND || SINGLE_TO) console.log(`\nSent: ${ok}, failed: ${fail}, skipped (already sent): ${skipped}`)
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
