// One-off: push subscription stats
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
const uri = env.match(/^MONGODB_URI=(.+)$/m)[1].trim()

async function main() {
  await mongoose.connect(uri)
  const db = mongoose.connection.db
  const col = db.collection('pushsubscriptions')

  const total = await col.countDocuments()
  const active = await col.countDocuments({ isActive: true })
  const distinctPlayers = (await col.distinct('playerId', { isActive: true })).filter(Boolean).length
  const byPlatform = await col.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$deviceInfo.platform', count: { $sum: 1 } } }
  ]).toArray()

  const totalPlayers = await db.collection('players').countDocuments()

  console.log(JSON.stringify({
    subscriptionsTotal: total,
    subscriptionsActive: active,
    playersWithActivePush: distinctPlayers,
    totalPlayersInDb: totalPlayers,
    byPlatform: Object.fromEntries(byPlatform.map(p => [p._id || 'unknown', p.count]))
  }, null, 2))
  await mongoose.disconnect()
}

main().catch(e => { console.error(e.message); process.exit(1) })
