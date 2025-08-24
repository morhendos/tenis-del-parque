// Debug utility to check club courts data
import dbConnect from '@/lib/db/mongoose'
import Club from '@/lib/models/Club'

export default async function debugClubCourts() {
  await dbConnect()
  
  // Get all clubs and log their courts data
  const clubs = await Club.find({}, 'name slug courts').lean()
  
  console.log('=== CLUB COURTS DATA DEBUG ===')
  clubs.forEach(club => {
    console.log(`\nClub: ${club.name} (${club.slug})`)
    console.log('Courts:', JSON.stringify(club.courts, null, 2))
  })
  
  return clubs
}

// Usage: Run this in your API or as a script to check actual database values
