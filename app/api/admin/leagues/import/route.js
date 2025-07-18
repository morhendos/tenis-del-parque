import { NextResponse } from 'next/server'
import clientPromise from '../../../../../lib/db'
import { ObjectId } from 'mongodb'

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = []
    let current = ''
    let insideQuotes = false
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]
      
      if (char === '"') {
        if (insideQuotes && lines[i][j + 1] === '"') {
          current += '"'
          j++
        } else {
          insideQuotes = !insideQuotes
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    data.push(row)
  }
  
  return data
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }
    
    const csvText = await file.text()
    const leaguesData = parseCSV(csvText)
    
    if (leaguesData.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      )
    }
    
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const leaguesCollection = db.collection('leagues')
    
    let created = 0
    let updated = 0
    const errors = []
    
    // Group data by league name to handle multiple seasons
    const leagueGroups = {}
    leaguesData.forEach((row, index) => {
      if (!row.name || !row.location_city || !row.location_region) {
        errors.push(`Row ${index + 2}: Missing required fields (name, location_city, location_region)`)
        return
      }
      
      if (!leagueGroups[row.name]) {
        leagueGroups[row.name] = {
          basicInfo: row,
          seasons: []
        }
      }
      
      if (row.season_name) {
        leagueGroups[row.name].seasons.push({
          name: row.season_name,
          status: row.season_status || 'draft'
        })
      }
    })
    
    // Process each league
    for (const [leagueName, leagueData] of Object.entries(leagueGroups)) {
      const { basicInfo, seasons } = leagueData
      
      try {
        // Check if league exists
        const existingLeague = await leaguesCollection.findOne({ name: leagueName })
        
        const leagueDoc = {
          name: leagueName,
          type: basicInfo.type || 'public',
          location: {
            city: basicInfo.location_city,
            region: basicInfo.location_region,
            venue: basicInfo.location_venue || ''
          },
          settings: {
            surface: basicInfo.surface || 'clay',
            ballType: basicInfo.ball_type || 'pressurized',
            matchFormat: basicInfo.match_format || 'best_of_3'
          },
          seasons: seasons.length > 0 ? seasons.map(s => ({
            _id: new ObjectId(),
            ...s,
            createdAt: new Date(),
            updatedAt: new Date()
          })) : [],
          updatedAt: new Date()
        }
        
        if (existingLeague) {
          // Update existing league
          await leaguesCollection.updateOne(
            { _id: existingLeague._id },
            { 
              $set: {
                ...leagueDoc,
                seasons: existingLeague.seasons ? [...existingLeague.seasons, ...leagueDoc.seasons] : leagueDoc.seasons
              }
            }
          )
          updated++
        } else {
          // Create new league
          await leaguesCollection.insertOne({
            ...leagueDoc,
            createdAt: new Date()
          })
          created++
        }
      } catch (error) {
        errors.push(`Failed to process league "${leagueName}": ${error.message}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Import completed: ${created} created, ${updated} updated`,
      created,
      updated,
      errors
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import leagues', details: error.message },
      { status: 500 }
    )
  }
}
