import dbConnect from '../lib/db/mongoose.js'
import League from '../lib/models/League.js'
import mongoose from 'mongoose'

/**
 * Script to manage WhatsApp groups for leagues
 * 
 * Usage:
 * node scripts/manageWhatsAppGroups.js list                    - List all leagues
 * node scripts/manageWhatsAppGroups.js update <id> <code>      - Update a league with WhatsApp invite code
 * node scripts/manageWhatsAppGroups.js activate <id>           - Activate WhatsApp group for a league
 * node scripts/manageWhatsAppGroups.js deactivate <id>         - Deactivate WhatsApp group for a league
 * 
 * Example:
 * node scripts/manageWhatsAppGroups.js update 6123456789abcdef12345678 ABC123DEF456
 */

async function listLeagues() {
  await dbConnect()
  
  const leagues = await League.find({
    status: { $in: ['active', 'coming_soon', 'registration_open'] }
  }).select('name slug status whatsappGroup')
  
  console.log('\n📋 Active Leagues:\n')
  console.log('=====================================\n')
  
  for (const league of leagues) {
    console.log(`📍 ${league.name}`)
    console.log(`   ID: ${league._id}`)
    console.log(`   Slug: ${league.slug}`)
    console.log(`   Status: ${league.status}`)
    
    if (league.whatsappGroup?.inviteCode) {
      console.log(`   WhatsApp: ✅ ${league.whatsappGroup.isActive ? 'Active' : 'Inactive'}`)
      console.log(`   Invite: https://chat.whatsapp.com/${league.whatsappGroup.inviteCode}`)
    } else {
      console.log(`   WhatsApp: ❌ Not configured`)
    }
    console.log('')
  }
}

async function updateWhatsAppGroup(leagueId, inviteCode, adminPhone = null) {
  await dbConnect()
  
  if (!mongoose.Types.ObjectId.isValid(leagueId)) {
    console.error('❌ Invalid league ID format')
    process.exit(1)
  }
  
  const league = await League.findById(leagueId)
  
  if (!league) {
    console.error('❌ League not found')
    process.exit(1)
  }
  
  const updateData = {
    'whatsappGroup.inviteCode': inviteCode,
    'whatsappGroup.name': `${league.name} - Jugadores`,
    'whatsappGroup.isActive': true,
    'whatsappGroup.createdAt': new Date()
  }
  
  if (adminPhone) {
    updateData['whatsappGroup.adminPhone'] = adminPhone
  }
  
  await League.findByIdAndUpdate(leagueId, updateData)
  
  console.log(`✅ WhatsApp group updated for ${league.name}`)
  console.log(`   Invite link: https://chat.whatsapp.com/${inviteCode}`)
}

async function activateWhatsAppGroup(leagueId) {
  await dbConnect()
  
  if (!mongoose.Types.ObjectId.isValid(leagueId)) {
    console.error('❌ Invalid league ID format')
    process.exit(1)
  }
  
  const league = await League.findById(leagueId)
  
  if (!league) {
    console.error('❌ League not found')
    process.exit(1)
  }
  
  if (!league.whatsappGroup?.inviteCode) {
    console.error('❌ League does not have a WhatsApp invite code configured')
    process.exit(1)
  }
  
  await League.findByIdAndUpdate(leagueId, {
    'whatsappGroup.isActive': true
  })
  
  console.log(`✅ WhatsApp group activated for ${league.name}`)
}

async function deactivateWhatsAppGroup(leagueId) {
  await dbConnect()
  
  if (!mongoose.Types.ObjectId.isValid(leagueId)) {
    console.error('❌ Invalid league ID format')
    process.exit(1)
  }
  
  const league = await League.findById(leagueId)
  
  if (!league) {
    console.error('❌ League not found')
    process.exit(1)
  }
  
  await League.findByIdAndUpdate(leagueId, {
    'whatsappGroup.isActive': false
  })
  
  console.log(`✅ WhatsApp group deactivated for ${league.name}`)
}

// Main execution
async function main() {
  const command = process.argv[2]
  const leagueId = process.argv[3]
  const inviteCode = process.argv[4]
  const adminPhone = process.argv[5]
  
  try {
    switch (command) {
      case 'list':
        await listLeagues()
        break
        
      case 'update':
        if (!leagueId || !inviteCode) {
          console.error('❌ Usage: node manageWhatsAppGroups.js update <leagueId> <inviteCode> [adminPhone]')
          process.exit(1)
        }
        await updateWhatsAppGroup(leagueId, inviteCode, adminPhone)
        break
        
      case 'activate':
        if (!leagueId) {
          console.error('❌ Usage: node manageWhatsAppGroups.js activate <leagueId>')
          process.exit(1)
        }
        await activateWhatsAppGroup(leagueId)
        break
        
      case 'deactivate':
        if (!leagueId) {
          console.error('❌ Usage: node manageWhatsAppGroups.js deactivate <leagueId>')
          process.exit(1)
        }
        await deactivateWhatsAppGroup(leagueId)
        break
        
      default:
        console.log(`
📱 WhatsApp Group Management Script
====================================

Usage:
  node scripts/manageWhatsAppGroups.js list
    - List all active leagues and their WhatsApp status
    
  node scripts/manageWhatsAppGroups.js update <leagueId> <inviteCode> [adminPhone]
    - Update a league with WhatsApp invite code
    - inviteCode: The code from https://chat.whatsapp.com/ABC123...
    - adminPhone: Optional admin phone number (e.g., +34612345678)
    
  node scripts/manageWhatsAppGroups.js activate <leagueId>
    - Activate WhatsApp group for a league
    
  node scripts/manageWhatsAppGroups.js deactivate <leagueId>
    - Deactivate WhatsApp group for a league

Example:
  node scripts/manageWhatsAppGroups.js update 6123456789abcdef12345678 ABC123DEF456 +34612345678

How to get invite code:
  1. Create a WhatsApp group for the league
  2. Go to group settings → "Invite via link"
  3. Copy the link (e.g., https://chat.whatsapp.com/ABC123DEF456)
  4. Use only the code part: ABC123DEF456
        `)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
