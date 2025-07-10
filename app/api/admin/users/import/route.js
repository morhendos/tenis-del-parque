import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
import User from '../../../../../lib/models/User'
import Player from '../../../../../lib/models/Player'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request) {
  try {
    await dbConnect()

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file')
    const createPasswords = formData.get('createPasswords') === 'true'

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
    
    // Required fields
    const requiredFields = ['email', 'role']
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
      errors: [],
      passwords: [] // Store generated passwords for new users
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

        // Validate role
        const validRoles = ['admin', 'player']
        if (!validRoles.includes(rowData.role.toLowerCase())) {
          results.errors.push(`Row ${i + 1}: Invalid role. Must be: admin or player`)
          continue
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: rowData.email })

        if (existingUser) {
          // Update existing user
          let updated = false

          // Update role if different
          if (rowData.role && existingUser.role !== rowData.role.toLowerCase()) {
            existingUser.role = rowData.role.toLowerCase()
            updated = true
          }

          // Update status if provided
          if (rowData.status) {
            const status = rowData.status.toLowerCase()
            if (status === 'inactive') {
              existingUser.isActive = false
              updated = true
            } else if (status === 'active') {
              existingUser.isActive = true
              existingUser.emailVerified = true
              updated = true
            } else if (status === 'unverified') {
              existingUser.emailVerified = false
              updated = true
            }
          }

          // Update language preference if provided
          if (rowData['language preference']) {
            if (!existingUser.preferences) existingUser.preferences = {}
            existingUser.preferences.language = rowData['language preference'].toLowerCase()
            updated = true
          }

          // Link to player if player email is provided and user is a player role
          if (rowData['player email'] && existingUser.role === 'player' && !existingUser.playerId) {
            const player = await Player.findOne({ email: rowData['player email'] })
            if (player) {
              existingUser.playerId = player._id
              // Also update player's userId
              player.userId = existingUser._id
              await player.save()
              updated = true
            }
          }

          if (updated) {
            await existingUser.save()
            results.updated++
          } else {
            results.errors.push(`Row ${i + 1}: User already exists with no changes needed`)
          }
        } else {
          // Create new user
          const userData = {
            email: rowData.email,
            role: rowData.role.toLowerCase(),
            isActive: true,
            emailVerified: true, // Set to true for imported users
            preferences: {
              language: rowData['language preference']?.toLowerCase() || 'es',
              hasSeenWelcomeModal: true
            }
          }

          // Set status based on CSV
          if (rowData.status) {
            const status = rowData.status.toLowerCase()
            if (status === 'inactive') {
              userData.isActive = false
            } else if (status === 'unverified') {
              userData.emailVerified = false
            }
          }

          // Generate password or activation token
          if (createPasswords) {
            // Generate a random password
            const randomPassword = crypto.randomBytes(8).toString('hex')
            userData.password = await bcrypt.hash(randomPassword, 10)
            results.passwords.push({
              email: userData.email,
              password: randomPassword
            })
          } else {
            // Create activation token for user to set their own password
            userData.emailVerified = false
            userData.activationToken = crypto.randomBytes(32).toString('hex')
            userData.activationTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }

          // Create the user
          const newUser = await User.create(userData)

          // Link to player if this is a player role
          if (userData.role === 'player') {
            let player = null
            
            // Try to find player by email
            if (rowData['player email']) {
              player = await Player.findOne({ email: rowData['player email'] })
            } else {
              // Try to find player by the user's email
              player = await Player.findOne({ email: userData.email })
            }

            if (player) {
              newUser.playerId = player._id
              await newUser.save()
              
              // Update player's userId
              player.userId = newUser._id
              // Update player status to at least confirmed
              if (player.status === 'pending') {
                player.status = 'confirmed'
              }
              await player.save()
            }
          }

          results.created++
        }
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error)
        results.errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }

    // Prepare response
    const response = {
      message: `Import completed. Created: ${results.created}, Updated: ${results.updated}`,
      created: results.created,
      updated: results.updated,
      errors: results.errors
    }

    // Include passwords if any were generated
    if (results.passwords.length > 0) {
      response.passwords = results.passwords
      response.passwordWarning = 'Please save these passwords securely and share them with users. They will not be shown again.'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import users', details: error.message },
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