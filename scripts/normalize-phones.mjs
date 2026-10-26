import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { normalizePhoneForStorage } from '../lib/utils/phoneUtils.js'

dotenv.config({ path: '.env.local' })

const apply = process.argv.includes('--apply')
const overrides = {
  'zhar.dizon@gmail.com': '+17022030512',
  'dquach@hotmail.com': '+35054037477'
}

await mongoose.connect(process.env.MONGODB_URI)
const players = mongoose.connection.db.collection('players')
const all = await players.find({ whatsapp: { $nin: [null, ''] } }).project({ name: 1, email: 1, whatsapp: 1 }).toArray()

let changed = 0
for (const p of all) {
  let next = overrides[p.email]
  if (!next) {
    const { phone, error } = normalizePhoneForStorage(p.whatsapp)
    if (error) {
      console.log(`SKIP   ${p.name} (${p.email}): ${p.whatsapp} -> ${error}`)
      continue
    }
    next = phone
  }
  if (next === p.whatsapp) continue
  changed++
  console.log(`${apply ? 'UPDATE' : 'WOULD '} ${p.name}: ${p.whatsapp} -> ${next}`)
  if (apply) await players.updateOne({ _id: p._id }, { $set: { whatsapp: next } })
}
console.log(`\n${changed} ${apply ? 'updated' : 'to update'} of ${all.length}`)
await mongoose.disconnect()
