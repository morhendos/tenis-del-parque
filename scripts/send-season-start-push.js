import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import webpush from 'web-push'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.+)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}

const args = process.argv.slice(2)
const arg = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null }
const SLUG = arg('--league')
const DO_SEND = args.includes('--send')
const ES_ONLY = (arg('--es-only') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
const SKIP = (arg('--skip') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
if (!SLUG) { console.log('Usage: node scripts/send-season-start-push.js --league <slug> [--es-only a,b] [--skip a] [--send]'); process.exit(1) }

webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:info@tenisdelparque.com', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY)

const text = {
  es: { title: '🎾 ¡Arranca la temporada!', body: (r) => `Ronda 1: tú contra ${r}. Escríbele y quedad para jugar.` },
  en: { title: '🎾 The season has started!', body: (r) => `Round 1: you vs ${r}. Message them and set up your match.` }
}

await mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection.db
const league = await db.collection('leagues').findOne({ slug: SLUG })
const matches = await db.collection('matches').find({ league: league._id, round: 1, isBye: { $ne: true } }).toArray()
const ids = matches.flatMap(m => [m.players.player1, m.players.player2]).filter(Boolean)
const players = await db.collection('players').find({ _id: { $in: ids } }).toArray()
const byId = (id) => players.find(p => String(p._id) === String(id))

let sent = 0
for (const m of matches) {
  for (const [me, rival] of [[m.players.player1, m.players.player2], [m.players.player2, m.players.player1]]) {
    const p = byId(me)
    const r = byId(rival)
    if (!p || !r || SKIP.includes(p.email.toLowerCase())) continue
    const subs = await db.collection('pushsubscriptions').find({ playerId: p._id, isActive: true }).toArray()
    if (subs.length === 0) continue
    const lang = ES_ONLY.includes(p.email.toLowerCase()) ? 'es' : 'en'
    const t = text[lang]
    console.log(`${p.name.padEnd(24)} ${lang} vs ${r.name} (${subs.length} device(s))`)
    if (!DO_SEND) continue
    const payload = JSON.stringify({
      title: t.title,
      body: t.body(r.name),
      icon: '/web-app-manifest-192x192.png',
      badge: '/apple-touch-icon.png',
      tag: `season-start-${SLUG}`,
      data: { url: '/player/dashboard' },
      actions: [],
      requireInteraction: false
    })
    for (const s of subs) {
      try { await webpush.sendNotification(s.subscription, payload); sent++ } catch (e) { console.log(`  failed ${e.statusCode}`) }
    }
  }
}
console.log(DO_SEND ? `Pushes sent: ${sent}` : '[DRY RUN]')
await mongoose.disconnect()
