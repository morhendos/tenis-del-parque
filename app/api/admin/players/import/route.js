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
    const defaultLeagueId = formData.get('leagueId') // Optional default league for players without league info

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

    // Parse headers - handle both old and new formats
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    
    // Check for required fields
    const requiredFields = ['name', 'email']
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Process each row
    const results = {
      created: 0,
      updated: 0,
      errors: []
    }

    // Cache for leagues to avoid multiple DB queries
    const leagueCache = new Map()

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i])
        if (values.length === 0) continue // Skip empty lines

        const rowData = {}
        headers.forEach((header, index) => {
          rowData[header] = values[index]?.trim().replace(/^"|"$/g, '') || ''
        })

        // Validate required fields
        if (!rowData.name || !rowData.email) {
          results.errors.push(`Row ${i + 1}: Missing name or email`)
          continue
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(rowData.email)) {
          results.errors.push(`Row ${i + 1}: Invalid email format`)
          continue
        }

        // Find the league for this player
        let league = null
        
        // Try to find league by slug if provided
        if (rowData.leagueslug || rowData.league_slug) {
          const leagueSlug = rowData.leagueslug || rowData.league_slug
          
          // Check cache first
          if (leagueCache.has(leagueSlug)) {
            league = leagueCache.get(leagueSlug)
          } else {
            league = await League.findOne({ slug: leagueSlug }).lean()
            if (league) {
              leagueCache.set(leagueSlug, league)
            }
          }
          
          if (!league) {
            results.errors.push(`Row ${i + 1}: League with slug "${leagueSlug}" not found`)
            continue
          }
        } else if (defaultLeagueId) {
          // Use the default league if no league slug in CSV
          if (leagueCache.has('default')) {
            league = leagueCache.get('default')
          } else {
            league = await League.findById(defaultLeagueId).lean()
            if (league) {
              leagueCache.set('default', league)
            }
          }
        }

        // Get level and status from CSV or use defaults
        const level = rowData.level?.toLowerCase() || 'intermediate'
        const status = rowData.status?.toLowerCase() || 'pending'
        
        // Validate level
        const validLevels = ['beginner', 'intermediate', 'advanced']
        if (!validLevels.includes(level)) {
          results.errors.push(`Row ${i + 1}: Invalid level. Must be: beginner, intermediate, or advanced`)
          continue
        }

        // Validate status
        const validStatuses = ['waiting', 'pending', 'confirmed', 'active', 'inactive']
        if (!validStatuses.includes(status)) {
          results.errors.push(`Row ${i + 1}: Invalid status. Must be: ${validStatuses.join(', ')}`)
          continue
        }

        // Check if player exists
        let existingPlayer = await Player.findOne({ email: rowData.email.toLowerCase() })

        if (existingPlayer) {
          // Update basic info
          existingPlayer.name = rowData.name
          if (rowData.whatsapp) existingPlayer.whatsapp = rowData.whatsapp
          if (rowData.elorating) existingPlayer.eloRating = parseFloat(rowData.elorating) || 1200

          // Add league registration if league is specified and player not already registered
          if (league) {
            const existingRegistration = existingPlayer.registrations.find(reg => 
              reg.league.toString() === league._id.toString()
            )

            if (!existingRegistration) {
              // Create new registration for this league
              existingPlayer.registrations.push({
                league: league._id,
                season: league.season || { year: 2025, type: 'summer', number: 1 },
                level: level,
                status: status,
                registeredAt: rowData.registrationdate ? new Date(rowData.registrationdate) : new Date(),
                stats: {
                  matchesPlayed: 0,
                  matchesWon: 0,
                  totalPoints: 0,
                  setsWon: 0,
                  setsLost: 0,
                  gamesWon: 0,
                  gamesLost: 0,
                  retirements: 0,
                  walkovers: 0
                },
                matchHistory: [],
                wildCards: {
                  total: 3,
                  used: 0,
                  history: []
                }
              })
            } else {
              // Update existing registration
              existingRegistration.level = level
              existingRegistration.status = status
            }
          }
          
          await existingPlayer.save()
          results.updated++
        } else {
          // Create new player
          const playerData = {
            name: rowData.name,
            email: rowData.email.toLowerCase(),
            whatsapp: rowData.whatsapp || '',
            eloRating: rowData.elorating ? parseFloat(rowData.elorating) : 1200,
            registrations: [],
            preferences: {
              emailNotifications: true,
              whatsappNotifications: true,
              preferredLanguage: 'es'
            },
            metadata: {
              source: 'import',
              firstRegistrationDate: rowData.registrationdate ? new Date(rowData.registrationdate) : new Date()
            }
          }

          // Add league registration if league is specified
          if (league) {
            playerData.registrations.push({
              league: league._id,
              season: league.season || { year: 2025, type: 'summer', number: 1 },
              level: level,
              status: status,
              registeredAt: rowData.registrationdate ? new Date(rowData.registrationdate) : new Date(),
              stats: {
                matchesPlayed: 0,
                matchesWon: 0,
                totalPoints: 0,
                setsWon: 0,
                setsLost: 0,
                gamesWon: 0,
                gamesLost: 0,
                retirements: 0,
                walkovers: 0
              },
              matchHistory: [],
              wildCards: {
                total: 3,
                used: 0,
                history: []
              }
            })
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
      success: true,
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
      if (line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Don't forget the last field
  if (current || result.length > 0) {
    result.push(current.trim())
  }
  
  return result
}
