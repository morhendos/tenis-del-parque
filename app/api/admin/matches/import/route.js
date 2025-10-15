import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import Match from '../../../../../lib/models/Match'
import Player from '../../../../../lib/models/Player'
import League from '../../../../../lib/models/League'
import mongoose from 'mongoose'

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
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))
    
    // Required fields for creating a match
    const requiredFields = ['round', 'player 1 email', 'player 2 email']
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Get league if specified
    let defaultLeague = null
    if (leagueId) {
      defaultLeague = await League.findById(leagueId).lean()
      if (!defaultLeague) {
        return NextResponse.json(
          { error: 'Invalid league ID' },
          { status: 400 }
        )
      }
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

        // Find players by email
        const player1 = await Player.findOne({ email: rowData['player 1 email'] })
        const player2 = await Player.findOne({ email: rowData['player 2 email'] })

        if (!player1) {
          results.errors.push(`Row ${i + 1}: Player 1 not found with email ${rowData['player 1 email']}`)
          continue
        }
        if (!player2) {
          results.errors.push(`Row ${i + 1}: Player 2 not found with email ${rowData['player 2 email']}`)
          continue
        }
        if (player1._id.equals(player2._id)) {
          results.errors.push(`Row ${i + 1}: Cannot create match with same player`)
          continue
        }

        // Determine league
        let league = defaultLeague

        // If league name is provided in CSV, try to find it
        if (rowData.league && !league) {
          league = await League.findOne({ 
            $or: [
              { name: new RegExp(rowData.league, 'i') },
              { slug: rowData.league.toLowerCase() }
            ]
          }).lean()
        }

        // Default to player's league if still not found
        if (!league && player1.registrations && player1.registrations.length > 0) {
          const registration = player1.registrations[0]
          league = await League.findById(registration.league).lean()
        }

        if (!league) {
          results.errors.push(`Row ${i + 1}: No league found`)
          continue
        }

        // CRITICAL FIX: Determine the correct season format based on league
        let season = null
        
        // Check what format the league is using for seasons
        if (league.season) {
          // Check if league.season is an ObjectId
          if (mongoose.Types.ObjectId.isValid(league.season)) {
            // League uses Season ObjectId - use the same ObjectId for match
            season = league.season
            console.log(`Using Season ObjectId from league: ${season}`)
          } 
          // Check if league.season is a nested object
          else if (typeof league.season === 'object' && league.season.year && league.season.type) {
            // League uses nested season object - use the same object for match
            season = {
              year: league.season.year,
              type: league.season.type
            }
            console.log(`Using nested season object from league: ${JSON.stringify(season)}`)
          }
        }
        
        // Fallback: Try to parse from CSV or use default
        if (!season) {
          // Check if season is provided in CSV
          if (rowData.season) {
            // Try to parse season from CSV (e.g., "summer-2025")
            const seasonParts = rowData.season.split('-')
            if (seasonParts.length >= 2) {
              const type = seasonParts[0].toLowerCase()
              const year = parseInt(seasonParts[1])
              
              // Try to find Season document
              const Season = mongoose.models.Season || mongoose.model('Season', new mongoose.Schema({
                year: Number,
                type: String
              }))
              
              const seasonDoc = await Season.findOne({ 
                type: type, 
                year: year 
              })
              
              if (seasonDoc) {
                season = seasonDoc._id
                console.log(`Found Season document for ${type} ${year}: ${season}`)
              } else {
                // Use as nested object (without number field)
                season = { type, year }
                console.log(`Using parsed season as object: ${JSON.stringify(season)}`)
              }
            } else {
              // Use the raw string (legacy format)
              season = rowData.season
            }
          } else {
            // Default to summer 2025 as nested object (without number field)
            season = {
              type: 'summer',
              year: 2025
            }
            console.log(`Using default season: ${JSON.stringify(season)}`)
          }
        }

        // Check if match already exists
        const existingMatch = await Match.findOne({
          league: league._id,
          season: season,
          round: parseInt(rowData.round),
          $or: [
            { 'players.player1': player1._id, 'players.player2': player2._id },
            { 'players.player1': player2._id, 'players.player2': player1._id }
          ]
        })

        if (existingMatch) {
          // Update existing match if it has results
          if (rowData.status === 'completed' && rowData.score) {
            // Parse score
            const sets = []
            const scorePattern = /(\d+)-(\d+)/g
            let scoreMatch
            while ((scoreMatch = scorePattern.exec(rowData.score)) !== null) {
              sets.push({
                player1: parseInt(scoreMatch[1]),
                player2: parseInt(scoreMatch[2])
              })
            }

            if (sets.length > 0) {
              // Determine winner based on sets
              let player1SetsWon = 0
              let player2SetsWon = 0
              sets.forEach(set => {
                if (set.player1 > set.player2) player1SetsWon++
                else player2SetsWon++
              })

              const winner = player1SetsWon > player2SetsWon ? 
                (existingMatch.players.player1.equals(player1._id) ? player1._id : player2._id) :
                (existingMatch.players.player1.equals(player2._id) ? player2._id : player1._id)

              existingMatch.status = 'completed'
              existingMatch.result = {
                winner: winner,
                score: {
                  sets: sets,
                  walkover: rowData.score.toLowerCase().includes('walkover')
                },
                playedAt: rowData['date played'] ? new Date(rowData['date played']) : new Date()
              }

              // Add ELO changes if provided
              if (rowData['player 1 elo change'] || rowData['player 2 elo change']) {
                existingMatch.eloChanges = {
                  player1: {
                    before: parseInt(rowData['player 1 elo before']) || 1200,
                    after: parseInt(rowData['player 1 elo after']) || 1200,
                    change: parseInt(rowData['player 1 elo change']) || 0
                  },
                  player2: {
                    before: parseInt(rowData['player 2 elo before']) || 1200,
                    after: parseInt(rowData['player 2 elo after']) || 1200,
                    change: parseInt(rowData['player 2 elo change']) || 0
                  }
                }
              }

              await existingMatch.save()
              results.updated++
            }
          }
        } else {
          // Create new match
          const matchData = {
            league: league._id,
            season: season,
            round: parseInt(rowData.round),
            players: {
              player1: player1._id,
              player2: player2._id
            },
            status: rowData.status || 'scheduled',
            schedule: {}
          }

          // Add schedule info if available
          if (rowData['date played']) {
            matchData.schedule.confirmedDate = new Date(rowData['date played'])
          }
          if (rowData.court) {
            matchData.schedule.court = rowData.court
          }

          // Add notes
          if (rowData.notes) {
            matchData.notes = rowData.notes
          }

          // If match is completed, add result
          if (rowData.status === 'completed' && rowData.score) {
            // Parse score
            const sets = []
            const scorePattern = /(\d+)-(\d+)/g
            let scoreMatch
            while ((scoreMatch = scorePattern.exec(rowData.score)) !== null) {
              sets.push({
                player1: parseInt(scoreMatch[1]),
                player2: parseInt(scoreMatch[2])
              })
            }

            if (sets.length > 0) {
              // Determine winner based on sets
              let player1SetsWon = 0
              let player2SetsWon = 0
              sets.forEach(set => {
                if (set.player1 > set.player2) player1SetsWon++
                else player2SetsWon++
              })

              const winner = player1SetsWon > player2SetsWon ? player1._id : player2._id

              matchData.result = {
                winner: winner,
                score: {
                  sets: sets,
                  walkover: rowData.score.toLowerCase().includes('walkover')
                },
                playedAt: rowData['date played'] ? new Date(rowData['date played']) : new Date()
              }

              // Add ELO changes if provided
              if (rowData['player 1 elo change'] || rowData['player 2 elo change']) {
                matchData.eloChanges = {
                  player1: {
                    before: parseInt(rowData['player 1 elo before']) || 1200,
                    after: parseInt(rowData['player 1 elo after']) || 1200,
                    change: parseInt(rowData['player 1 elo change']) || 0
                  },
                  player2: {
                    before: parseInt(rowData['player 2 elo before']) || 1200,
                    after: parseInt(rowData['player 2 elo after']) || 1200,
                    change: parseInt(rowData['player 2 elo change']) || 0
                  }
                }
              }
            }
          }

          await Match.create(matchData)
          results.created++
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
      { error: 'Failed to import matches', details: error.message },
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