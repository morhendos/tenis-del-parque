/**
 * WhatsApp Group Setup Script
 * 
 * This script helps set up WhatsApp groups for leagues
 * Run with: node scripts/setupWhatsAppGroups.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import readline from 'readline'
import dbConnect from '../lib/db/mongoose.js'
import League from '../lib/models/League.js'

dotenv.config({ path: '.env.local' })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function setupWhatsAppGroups() {
  try {
    // Connect to database
    await dbConnect()
    console.log('✅ Connected to database\n')

    // Get all leagues
    const leagues = await League.find({ 
      status: { $in: ['active', 'coming_soon', 'registration_open'] } 
    }).sort({ displayOrder: 1 })

    if (leagues.length === 0) {
      console.log('No active leagues found.')
      process.exit(0)
    }

    console.log('📋 Active Leagues Found:')
    console.log('========================\n')

    for (let i = 0; i < leagues.length; i++) {
      const league = leagues[i]
      console.log(`${i + 1}. ${league.name}`)
      console.log(`   Status: ${league.status}`)
      console.log(`   Slug: ${league.slug}`)
      console.log(`   WhatsApp Group: ${league.whatsappGroup?.isActive ? '✅ Active' : '❌ Not set up'}`)
      if (league.whatsappGroup?.isActive) {
        console.log(`   - Group Name: ${league.whatsappGroup.name}`)
        console.log(`   - Invite Code: ${league.whatsappGroup.inviteCode}`)
        console.log(`   - Admin Phone: ${league.whatsappGroup.adminPhone}`)
      }
      console.log('')
    }

    // Ask which league to update
    const choice = await question('\nEnter league number to set up WhatsApp group (or 0 to exit): ')
    const leagueIndex = parseInt(choice) - 1

    if (choice === '0') {
      console.log('Exiting...')
      process.exit(0)
    }

    if (leagueIndex < 0 || leagueIndex >= leagues.length) {
      console.log('❌ Invalid selection')
      process.exit(1)
    }

    const selectedLeague = leagues[leagueIndex]
    console.log(`\n📱 Setting up WhatsApp for: ${selectedLeague.name}\n`)

    // Instructions for creating WhatsApp group
    console.log('📋 Instructions:')
    console.log('1. Create a WhatsApp group with this name:')
    console.log(`   "Liga de ${selectedLeague.location.city} - Jugadores"\n`)
    console.log('2. Add this description:')
    console.log(`   "Comunidad de jugadores de Liga de ${selectedLeague.location.city}. Aquí puedes conocer otros jugadores, coordinar entrenamientos y recibir actualizaciones."\n`)
    console.log('3. Go to Group Settings > Invite via link')
    console.log('4. Copy the invite link (it looks like: https://chat.whatsapp.com/ABC123DEF456)\n')

    // Get WhatsApp group details
    const inviteLink = await question('Paste the full WhatsApp invite link: ')
    
    // Extract invite code from link
    const inviteCodeMatch = inviteLink.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
    if (!inviteCodeMatch) {
      console.log('❌ Invalid WhatsApp link format')
      process.exit(1)
    }
    const inviteCode = inviteCodeMatch[1]

    const groupName = await question('Group name (press Enter for default): ') || 
                      `Liga de ${selectedLeague.location.city} - Jugadores`
    
    const adminPhone = await question('Admin WhatsApp phone (with country code, e.g., +34612345678): ')
    
    const activate = await question('Activate this group now? (y/n): ')
    const isActive = activate.toLowerCase() === 'y'

    // Update league with WhatsApp group info
    selectedLeague.whatsappGroup = {
      inviteCode,
      name: groupName,
      isActive,
      adminPhone,
      createdAt: new Date()
    }

    await selectedLeague.save()

    console.log('\n✅ WhatsApp group configured successfully!')
    console.log('\n📊 Summary:')
    console.log(`League: ${selectedLeague.name}`)
    console.log(`Group Name: ${groupName}`)
    console.log(`Invite Link: https://chat.whatsapp.com/${inviteCode}`)
    console.log(`Admin Phone: ${adminPhone}`)
    console.log(`Status: ${isActive ? 'Active' : 'Inactive'}`)

    // Ask if want to set up another
    const another = await question('\nSet up another league? (y/n): ')
    if (another.toLowerCase() === 'y') {
      console.log('\n')
      rl.close()
      // Restart the script
      setupWhatsAppGroups()
    } else {
      process.exit(0)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Run the script
setupWhatsAppGroups()
