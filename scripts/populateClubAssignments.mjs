#!/usr/bin/env node
/**
 * One-time script to populate cached club assignments
 * Run this after implementing the caching system
 */

import { recalculateAllClubAssignments } from '../lib/utils/clubAssignmentCache.js'

console.log('🚀 Starting initial club assignment population...')
console.log('This is a one-time script to populate cached assignments for existing clubs.')
console.log('')

const result = await recalculateAllClubAssignments()

if (result.success) {
  console.log('')
  console.log('🎉 SUCCESS! Club assignments have been populated.')
  console.log(`📊 Results:`)
  console.log(`  • Total clubs processed: ${result.totalClubs}`)
  console.log(`  • Clubs updated: ${result.updated}`)
  console.log(`  • Clubs unchanged: ${result.unchanged}`)
  console.log(`  • Duration: ${result.duration}ms`)
  console.log('')
  console.log('✅ Your clubs page should now load much faster!')
  
  process.exit(0)
} else {
  console.error('')
  console.error('❌ FAILED to populate club assignments')
  console.error('Error:', result.error)
  console.error('')
  console.error('Please check your database connection and area boundaries.')
  
  process.exit(1)
}
