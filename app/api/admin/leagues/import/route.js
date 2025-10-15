import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import League from '../../../../../lib/models/League'
import City from '../../../../../lib/models/City'

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
    
    await dbConnect()
    
    let created = 0
    let updated = 0
    const errors = []
    
    // Process each row
    for (let i = 0; i < leaguesData.length; i++) {
      const row = leaguesData[i]
      
      // Skip empty rows
      if (!row.name || !row.name.trim()) {
        continue
      }
      
      try {
        // Required fields validation
        if (!row.citySlug || !row.citySlug.trim()) {
          errors.push(`Row ${i + 2}: Missing citySlug (this field is required to link the league to a city)`)
          continue
        }
        
        if (!row.seasonYear) {
          errors.push(`Row ${i + 2}: Missing seasonYear`)
          continue
        }
        
        if (!row.seasonType) {
          errors.push(`Row ${i + 2}: Missing seasonType`)
          continue
        }
        
        // Find the city
        const city = await City.findOne({ slug: row.citySlug.toLowerCase() })
        if (!city) {
          // List available cities for better error message
          const availableCities = await City.find({}, 'slug').lean()
          const cityList = availableCities.map(c => c.slug).join(', ')
          errors.push(`Row ${i + 2}: City with slug "${row.citySlug}" not found. Available cities: ${cityList || 'none'}`)
          continue
        }
        
        // Generate slug
        const skillLevel = row.skillLevel || 'all'
        const skillSlug = skillLevel === 'all' ? '' : `-${skillLevel}`
        let slug = `${row.citySlug}${skillSlug}-${row.seasonType}-${row.seasonYear}`
        
        // Parse dates
        const startDate = row.startDate ? new Date(row.startDate) : new Date()
        const endDate = row.endDate ? new Date(row.endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        
        // Prepare league document
        const leagueDoc = {
          name: row.name.trim(),
          slug: slug.toLowerCase(),
          skillLevel: skillLevel,
          season: {
            year: parseInt(row.seasonYear),
            type: row.seasonType,
            number: seasonNumber
          },
          city: city._id,
          location: {
            city: city.name.es || city.name.en,
            region: city.province || 'Málaga',
            country: city.country || 'Spain',
            timezone: row.timezone || 'Europe/Madrid'
          },
          description: {
            es: row.descriptionEs || '',
            en: row.descriptionEn || ''
          },
          seasonConfig: {
            startDate: startDate,
            endDate: endDate,
            registrationStart: row.registrationStart ? new Date(row.registrationStart) : null,
            registrationEnd: row.registrationEnd ? new Date(row.registrationEnd) : null,
            maxPlayers: row.maxPlayers ? parseInt(row.maxPlayers) : 20,
            minPlayers: row.minPlayers ? parseInt(row.minPlayers) : 8,
            price: {
              amount: row.priceAmount ? parseFloat(row.priceAmount) : 0,
              currency: row.priceCurrency || 'EUR',
              isFree: row.isFree === 'true' || row.isFree === '1' || !row.priceAmount
            }
          },
          config: {
            roundsPerSeason: row.roundsPerSeason ? parseInt(row.roundsPerSeason) : 8,
            wildCardsPerPlayer: row.wildCardsPerPlayer ? parseInt(row.wildCardsPerPlayer) : 4,
            playoffPlayers: row.playoffPlayers ? parseInt(row.playoffPlayers) : 8
          },
          status: row.status || 'coming_soon',
          expectedLaunchDate: row.expectedLaunchDate ? new Date(row.expectedLaunchDate) : null,
          displayOrder: row.displayOrder ? parseInt(row.displayOrder) : 0
        }
        
        // Check if league exists
        const existingLeague = await League.findOne({ slug: slug.toLowerCase() })
        
        if (existingLeague) {
          // Update existing league
          Object.assign(existingLeague, leagueDoc)
          await existingLeague.save()
          updated++
        } else {
          // Create new league
          await League.create(leagueDoc)
          created++
        }
      } catch (error) {
        errors.push(`Failed to process league "${row.name}": ${error.message}`)
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
