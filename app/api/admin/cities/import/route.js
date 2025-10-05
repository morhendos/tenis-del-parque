import { NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db/mongoose'
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
    const citiesData = parseCSV(csvText)
    
    if (citiesData.length === 0) {
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
    for (let i = 0; i < citiesData.length; i++) {
      const row = citiesData[i]
      
      // Skip empty rows
      if (!row.slug || !row.slug.trim()) {
        continue
      }
      
      try {
        // Required fields validation
        if (!row.nameEs || !row.nameEs.trim()) {
          errors.push(`Row ${i + 2}: Missing nameEs (Spanish name)`)
          continue
        }
        
        if (!row.nameEn || !row.nameEn.trim()) {
          errors.push(`Row ${i + 2}: Missing nameEn (English name)`)
          continue
        }
        
        // Validate slug format
        const slugRegex = /^[a-z0-9-]+$/
        if (!slugRegex.test(row.slug)) {
          errors.push(`Row ${i + 2}: Invalid slug format. Use only lowercase letters, numbers, and hyphens`)
          continue
        }
        
        // Prepare city document
        const cityDoc = {
          slug: row.slug.toLowerCase().trim(),
          name: {
            es: row.nameEs.trim(),
            en: row.nameEn.trim()
          },
          province: row.province || 'Málaga',
          country: row.country || 'Spain',
          status: row.status || 'active',
          displayOrder: row.displayOrder ? parseInt(row.displayOrder) : 0,
          importSource: row.importSource || 'manual'
        }
        
        // Add coordinates if provided
        if (row.lat && row.lng) {
          const lat = parseFloat(row.lat)
          const lng = parseFloat(row.lng)
          
          if (!isNaN(lat) && !isNaN(lng)) {
            cityDoc.coordinates = { lat, lng }
          }
        }
        
        // Add images if provided
        if (row.mainImage) {
          cityDoc.images = {
            main: row.mainImage,
            gallery: [],
            googlePhotoReference: null
          }
        }
        
        // Add Google data if provided
        if (row.googlePlaceId) {
          cityDoc.googlePlaceId = row.googlePlaceId
        }
        
        if (row.formattedAddress) {
          cityDoc.formattedAddress = row.formattedAddress
        }
        
        // Check if city exists
        const existingCity = await City.findOne({ slug: cityDoc.slug })
        
        if (existingCity) {
          // Update existing city
          Object.assign(existingCity, cityDoc)
          await existingCity.save()
          updated++
        } else {
          // Create new city
          await City.create(cityDoc)
          created++
        }
      } catch (error) {
        errors.push(`Failed to process city "${row.slug}": ${error.message}`)
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
      { error: 'Failed to import cities', details: error.message },
      { status: 500 }
    )
  }
}
