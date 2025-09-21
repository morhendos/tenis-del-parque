/**
 * Test Email Sending Script
 * 
 * This script tests the welcome email functionality
 * Run with: node scripts/testEmailSending.js
 */

import dotenv from 'dotenv'
import { generateWelcomeEmail } from '../lib/email/templates/welcomeEmail.js'
import { sendEmail } from '../lib/email/resend.js'
import readline from 'readline'

dotenv.config({ path: '.env.local' })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function testEmailSending() {
  console.log('📧 Welcome Email Test Script')
  console.log('============================\n')

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not configured in .env.local')
    console.log('\n📝 Instructions:')
    console.log('1. Sign up at https://resend.com')
    console.log('2. Get your API key from https://resend.com/api-keys')
    console.log('3. Add to .env.local: RESEND_API_KEY=re_xxxxxxxxxxxx')
    process.exit(1)
  }

  console.log('✅ Resend API key found\n')

  try {
    // Get test email details
    const recipientEmail = await question('Enter recipient email address: ')
    const playerName = await question('Enter player name (or press Enter for "Test Player"): ') || 'Test Player'
    const language = await question('Language (es/en, default es): ') || 'es'
    const isWaitingList = (await question('Is this for a waiting list? (y/n, default n): ')).toLowerCase() === 'y'
    const includeWhatsApp = (await question('Include WhatsApp group link? (y/n, default y): ')).toLowerCase() !== 'n'

    console.log('\n📋 Generating email...')

    // Generate email content
    const emailData = generateWelcomeEmail(
      {
        playerName: playerName,
        playerEmail: recipientEmail,
        playerWhatsApp: '+34612345678', // Test number
        playerLevel: 'intermediate',
        language: language
      },
      {
        leagueName: 'Liga de Sotogrande',
        leagueStatus: isWaitingList ? 'coming_soon' : 'active',
        expectedStartDate: new Date('2025-07-01'),
        whatsappGroupLink: includeWhatsApp ? 'https://chat.whatsapp.com/ABC123TEST' : null,
        shareUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdelparque.com'}/signup/sotogrande`
      },
      {
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tenisdelparque.com'}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`,
        adminContact: process.env.ADMIN_WHATSAPP || '+34600000000'
      }
    )

    console.log('\n📧 Email Details:')
    console.log('================')
    console.log(`To: ${recipientEmail}`)
    console.log(`Subject: ${emailData.subject}`)
    console.log(`Language: ${language}`)
    console.log(`Type: ${isWaitingList ? 'Waiting List' : 'Active League'}`)
    console.log(`WhatsApp Group: ${includeWhatsApp ? 'Included' : 'Not included'}`)

    const sendIt = await question('\n🚀 Send this test email? (y/n): ')
    
    if (sendIt.toLowerCase() === 'y') {
      console.log('\n📤 Sending email...')
      
      const result = await sendEmail({
        to: recipientEmail,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      })

      if (result.success) {
        console.log('\n✅ Email sent successfully!')
        console.log(`📧 Email ID: ${result.id}`)
        console.log('\n📝 Next steps:')
        console.log('1. Check the recipient\'s inbox (including spam folder)')
        console.log('2. Verify the email formatting looks correct')
        console.log('3. Test all links in the email')
        console.log('4. Check WhatsApp group link if included')
      } else {
        console.error('\n❌ Failed to send email:', result.error)
        console.log('\n🔍 Troubleshooting:')
        console.log('1. Verify RESEND_API_KEY is correct')
        console.log('2. Check RESEND_FROM_EMAIL is verified in Resend')
        console.log('3. Make sure recipient email is valid')
      }
    } else {
      console.log('\n❌ Email sending cancelled')
    }

    // Ask if want to send another test
    const another = await question('\nSend another test email? (y/n): ')
    if (another.toLowerCase() === 'y') {
      console.log('\n')
      rl.close()
      testEmailSending()
    } else {
      process.exit(0)
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
    console.log('\n🔍 Common issues:')
    console.log('- Missing or invalid RESEND_API_KEY')
    console.log('- RESEND_FROM_EMAIL not verified')
    console.log('- Network connectivity issues')
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Show configuration status
console.log('🔧 Configuration Status:')
console.log('========================')
console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set'}`)
console.log(`RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || 'Using default'}`)
console.log(`NEXT_PUBLIC_URL: ${process.env.NEXT_PUBLIC_URL || 'Using default'}`)
console.log(`ADMIN_WHATSAPP: ${process.env.ADMIN_WHATSAPP || 'Not set'}`)
console.log('\n')

// Run the test
testEmailSending()
