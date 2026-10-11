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

const MANUAL = {
  'lijarcio13@gmail.com': 'estepona',
  'josenri8@hotmail.com': 'malaga'
}

await mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection.db

const cities = await db.collection('cities').find({}).project({ slug: 1 }).toArray()
const citySlug = Object.fromEntries(cities.map(c => [c.slug, c._id]))
const leagues = await db.collection('leagues').find({}).project({ city: 1 }).toArray()
const leagueCity = Object.fromEntries(leagues.filter(l => l.city).map(l => [String(l._id), l.city]))

const players = await db.collection('players').find({}).project({ email: 1, registrations: 1 }).toArray()
let updated = 0
for (const p of players) {
  const ids = (p.registrations || []).map(r => leagueCity[String(r.league)]).filter(Boolean)
  const manual = MANUAL[(p.email || '').toLowerCase()]
  if (manual && citySlug[manual]) ids.push(citySlug[manual])
  if (ids.length === 0) continue
  const r = await db.collection('players').updateOne({ _id: p._id }, { $addToSet: { cities: { $each: ids } } })
  if (r.modifiedCount) updated++
}

const counts = await db.collection('players').aggregate([
  { $unwind: '$cities' },
  { $group: { _id: '$cities', n: { $sum: 1 } } }
]).toArray()
const slugById = Object.fromEntries(cities.map(c => [String(c._id), c.slug]))
console.log(`Players updated: ${updated} of ${players.length}`)
console.log('Players per city:', counts.map(c => `${slugById[String(c._id)]}: ${c.n}`).join(', '))
const none = await db.collection('players').countDocuments({ $or: [{ cities: { $exists: false } }, { cities: { $size: 0 } }] })
console.log(`Players with no city: ${none}`)

await mongoose.disconnect()
