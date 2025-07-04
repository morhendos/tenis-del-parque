import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Player from '../../../../../lib/models/Player'
import League from '../../../../../lib/models/League'

export async function POST(request) {
  try {
    await dbConnect()

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file')
    const leagueId = formData.get('leagueId')

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Convert file to text
    const text = await file.text()
    
    // Parse CSV
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no data rows' },
        { status: 400 }
      )
    }

    // Parse headers
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    
    // Required fields
    const requiredFields = ['name', 'email', 'whatsapp']
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Get league if specified
    let league = null
    if (leagueId) {
      league = await League.findById(leagueId).lean()
      if (!league) {
        return NextResponse.json(
          { error: 'Invalid league ID' },
          { status: 400 }
        )
      }
    } else {
      // Default to Sotogrande league if no league specified
      league = await League.findOne({ slug: 'sotogrande' }).lean()
    }

    if (!league) {
      return NextResponse.json(
        { error: 'No league found. Please specify a valid league.' },
        { status: 400 }
      )
    }

    // Process each row
    const results = {
      created: 0,
      updated: 0,
      errors: []
    }

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i])
        if (values.length === 0) continue // Skip empty lines

        const rowData = {}
        headers.forEach((header, index) => {
          rowData[header] = values[index]?.trim() || ''
        })

        // Validate required fields
        const missingData = requiredFields.filter(field => !rowData[field])
        if (missingData.length > 0) {
          results.errors.push(`Row ${i + 1}: Missing ${missingData.join(', ')}`)
          continue
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(rowData.email)) {
          results.errors.push(`Row ${i + 1}: Invalid email format`)
          continue
        }

        // Validate level if provided
        const validLevels = ['beginner', 'intermediate', 'advanced']
        if (rowData.level && !validLevels.includes(rowData.level.toLowerCase())) {
          results.errors.push(`Row ${i + 1}: Invalid level. Must be: beginner, intermediate, or advanced`)
          continue
        }

        // Validate status if provided
        const validStatuses = ['pending', 'confirmed', 'active', 'inactive']
        if (rowData.status && !validStatuses.includes(rowData.status.toLowerCase())) {
          results.errors.push(`Row ${i + 1}: Invalid status. Must be: pending, confirmed, active, or inactive`)
          continue
        }

        // Check if player exists
        const existingPlayer = await Player.findOne({ email: rowData.email })

        if (existingPlayer) {
          // Determine the correct season to use
          let season = 'summer-2025' // default fallback
          if (league?.seasons?.length > 0) {
            // Find active season or use the first season
            const activeSeason = league.seasons.find(s => s.status === 'active' || s.status === 'registration_open')
            season = activeSeason?.name || league.seasons[0].name
          }

          // Update existing player
          existingPlayer.name = rowData.name
          existingPlayer.whatsapp = rowData.whatsapp
          if (rowData.level) existingPlayer.level = rowData.level.toLowerCase()
          if (rowData.status) existingPlayer.status = rowData.status.toLowerCase()
          if (league && !existingPlayer.league) existingPlayer.league = league._id
          
          // Update season to match current league season
          existingPlayer.season = season
          
          await existingPlayer.save()
          results.updated++
        } else {
          // Determine the correct season to use
          let season = 'summer-2025' // default fallback
          if (league?.seasons?.length > 0) {
            // Find active season or use the first season
            const activeSeason = league.seasons.find(s => s.status === 'active' || s.status === 'registration_open')
            season = activeSeason?.name || league.seasons[0].name
          }

          // Create new player
          const playerData = {
            name: rowData.name,
            email: rowData.email,
            whatsapp: rowData.whatsapp,
            level: rowData.level?.toLowerCase() || 'intermediate',
            status: rowData.status?.toLowerCase() || 'pending',
            league: league?._id,
            season: season,
            registeredAt: new Date()
          }

          await Player.create(playerData)
          results.created++

          // Note: User accounts are NOT created during import
          // Players will need to be invited separately via the invitation system
        }
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error)
        results.errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }

    return NextResponse.json({
      message: `Import completed. Created: ${results.created}, Updated: ${results.updated}`,
      created: results.created,
      updated: results.updated,
      errors: results.errors
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import players', details: error.message },
      { status: 500 }
    )
  }
}

// Helper function to parse CSV line properly (handles commas in quotes)
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Don't forget the last field
  if (current) {
    result.push(current.trim())
  }
  
  return result
}
