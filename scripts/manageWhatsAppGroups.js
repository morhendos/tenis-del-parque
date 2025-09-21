#!/usr/bin/env node

/**
 * Script to manage WhatsApp groups for leagues
 * Usage: node scripts/manageWhatsAppGroups.js [command] [options]
 * 
 * Commands:
 *   list                    - List all leagues and their WhatsApp group status
 *   update [league-slug]    - Update WhatsApp group for a specific league
 *   update-all              - Update all leagues interactively
 *   clear [league-slug]     - Clear WhatsApp group for a specific league
 * 
 * Examples:
 *   node scripts/manageWhatsAppGroups.js list
 *   node scripts/manageWhatsAppGroups.js update sotogrande
 *   node scripts/manageWhatsAppGroups.js update-all
 */

import mongoose from 'mongoose'
import readline from 'readline'
import dotenv from 'dotenv'
import League from '../lib/models/League.js'
import dbConnect from '../lib/db/mongoose.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
}

async function listLeagues() {
  log.title('📋 Leagues and WhatsApp Groups Status')
  
  const leagues = await League.find({}).sort({ displayOrder: 1, createdAt: 1 })
  
  if (leagues.length === 0) {
    log.warning('No leagues found in database')
    return
  }
  
  console.log('Total leagues:', leagues.length)
  console.log('')
  
  for (const league of leagues) {
    const hasGroup = league.whatsappGroup?.isActive
    const status = hasGroup ? '✅' : '❌'
    const statusColor = hasGroup ? colors.green : colors.red
    
    console.log(`${statusColor}${status}${colors.reset} ${colors.bright}${league.name}${colors.reset}`)
    console.log(`   Slug: ${league.slug}`)
    console.log(`   Status: ${league.status}`)
    
    if (hasGroup) {
      console.log(`   WhatsApp Group: ${league.whatsappGroup.name || 'Unnamed'}`)
      console.log(`   Invite Code: ${league.whatsappGroup.inviteCode}`)
      console.log(`   Admin Phone: ${league.whatsappGroup.adminPhone || 'Not set'}`)
    } else {
      console.log(`   ${colors.dim}No WhatsApp group configured${colors.reset}`)
    }
    console.log('')
  }
}

async function updateLeague(slug) {
  const league = await League.findOne({ slug })
  
  if (!league) {
    log.error(`League with slug '${slug}' not found`)
    return
  }
  
  log.title(`📱 Update WhatsApp Group for: ${league.name}`)
  
  // Show current status
  if (league.whatsappGroup?.isActive) {
    log.info('Current WhatsApp group configuration:')
    console.log(`   Name: ${league.whatsappGroup.name || 'Not set'}`)
    console.log(`   Invite Code: ${league.whatsappGroup.inviteCode}`)
    console.log(`   Admin Phone: ${league.whatsappGroup.adminPhone || 'Not set'}`)
    console.log('')
  } else {
    log.info('No WhatsApp group currently configured')
    console.log('')
  }
  
  // Ask for confirmation to update
  const confirm = await question('Do you want to update this league\'s WhatsApp group? (y/n): ')
  
  if (confirm.toLowerCase() !== 'y') {
    log.info('Update cancelled')
    return
  }
  
  // Get WhatsApp group details
  console.log('\n' + colors.cyan + 'Enter WhatsApp group details:' + colors.reset)
  console.log(colors.dim + '(Press Enter to keep existing value)' + colors.reset + '\n')
  
  const inviteLink = await question('WhatsApp invite link (https://chat.whatsapp.com/ABC123...): ')
  let inviteCode = league.whatsappGroup?.inviteCode || ''
  
  if (inviteLink) {
    // Extract invite code from link
    const match = inviteLink.match(/chat\\.whatsapp\\.com\\/([A-Za-z0-9]+)/)
    if (match) {
      inviteCode = match[1]
      log.success(`Extracted invite code: ${inviteCode}`)
    } else {
      log.error('Invalid WhatsApp invite link format')
      return
    }
  }
  
  const groupName = await question(`Group name [${league.whatsappGroup?.name || league.name + ' - Jugadores'}]: `)
  const adminPhone = await question(`Admin phone number [${league.whatsappGroup?.adminPhone || process.env.ADMIN_WHATSAPP || '+34612345678'}]: `)
  const isActive = await question('Is group active? (y/n) [y]: ')
  
  // Update the league
  const updateData = {
    'whatsappGroup.inviteCode': inviteCode || league.whatsappGroup?.inviteCode,
    'whatsappGroup.name': groupName || league.whatsappGroup?.name || `${league.name} - Jugadores`,
    'whatsappGroup.adminPhone': adminPhone || league.whatsappGroup?.adminPhone || process.env.ADMIN_WHATSAPP,
    'whatsappGroup.isActive': isActive.toLowerCase() !== 'n',
    'whatsappGroup.createdAt': league.whatsappGroup?.createdAt || new Date()
  }
  
  await League.findByIdAndUpdate(league._id, updateData)
  
  log.success(`WhatsApp group updated for ${league.name}`)
  
  // Show the invite link
  if (updateData['whatsappGroup.inviteCode']) {
    console.log('')
    log.info('Full invite link:')
    console.log(`   ${colors.bright}https://chat.whatsapp.com/${updateData['whatsappGroup.inviteCode']}${colors.reset}`)
  }
}

async function updateAllLeagues() {
  log.title('📱 Update WhatsApp Groups for All Leagues')
  
  const leagues = await League.find({ status: { $in: ['active', 'coming_soon', 'registration_open'] } })
    .sort({ displayOrder: 1, createdAt: 1 })
  
  log.info(`Found ${leagues.length} active/upcoming leagues`)
  console.log('')
  
  for (const league of leagues) {
    const hasGroup = league.whatsappGroup?.isActive
    const skipOption = hasGroup ? ' (s to skip)' : ''
    
    console.log(`\n${colors.bright}${colors.magenta}League: ${league.name}${colors.reset}`)
    console.log(`Status: ${league.status}`)
    
    if (hasGroup) {
      console.log(`Current WhatsApp: ${league.whatsappGroup.name || 'Configured'}`)
    }
    
    const action = await question(`Update this league?${skipOption} (y/n/s): `)
    
    if (action.toLowerCase() === 'y') {
      await updateLeague(league.slug)
    } else if (action.toLowerCase() === 's') {
      log.info('Skipped')
    } else {
      log.info('Skipped')
    }
  }
  
  log.success('All leagues processed!')
}

async function clearLeague(slug) {
  const league = await League.findOne({ slug })
  
  if (!league) {
    log.error(`League with slug '${slug}' not found`)
    return
  }
  
  log.warning(`This will clear the WhatsApp group for: ${league.name}`)
  
  const confirm = await question('Are you sure? (y/n): ')
  
  if (confirm.toLowerCase() !== 'y') {
    log.info('Clear cancelled')
    return
  }
  
  await League.findByIdAndUpdate(league._id, {
    'whatsappGroup.isActive': false,
    'whatsappGroup.inviteCode': null
  })
  
  log.success(`WhatsApp group cleared for ${league.name}`)
}

async function main() {
  const command = process.argv[2]
  const param = process.argv[3]
  
  try {
    // Connect to database
    await dbConnect()
    log.success('Connected to database')
    
    switch (command) {
      case 'list':
        await listLeagues()
        break
        
      case 'update':
        if (!param) {
          log.error('Please provide a league slug')
          console.log('Usage: node scripts/manageWhatsAppGroups.js update [league-slug]')
        } else {
          await updateLeague(param)
        }
        break
        
      case 'update-all':
        await updateAllLeagues()
        break
        
      case 'clear':
        if (!param) {
          log.error('Please provide a league slug')
          console.log('Usage: node scripts/manageWhatsAppGroups.js clear [league-slug]')
        } else {
          await clearLeague(param)
        }
        break
        
      default:
        log.title('WhatsApp Group Management Tool')
        console.log('Usage: node scripts/manageWhatsAppGroups.js [command] [options]\n')
        console.log('Commands:')
        console.log('  list                    - List all leagues and their WhatsApp group status')
        console.log('  update [league-slug]    - Update WhatsApp group for a specific league')
        console.log('  update-all              - Update all leagues interactively')
        console.log('  clear [league-slug]     - Clear WhatsApp group for a specific league')
        console.log('\nExamples:')
        console.log('  node scripts/manageWhatsAppGroups.js list')
        console.log('  node scripts/manageWhatsAppGroups.js update sotogrande')
        console.log('  node scripts/manageWhatsAppGroups.js update-all')
    }
  } catch (error) {
    log.error(`Error: ${error.message}`)
    console.error(error)
  } finally {
    rl.close()
    process.exit(0)
  }
}

// Run the script
main()
