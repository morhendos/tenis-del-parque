import { NextResponse } from 'next/server'

// Google Maps API configuration
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY
const GOOGLE_PHOTO_BASE_URL = 'https://maps.googleapis.com/maps/api/place/photo'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const photoReference = searchParams.get('photo_reference')
    const maxWidth = searchParams.get('maxwidth') || '800'
    
    // If no photo reference, return a branded fallback
    if (!photoReference) {
      const fallbackSVG = `
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="800" height="600" fill="url(#gradient)"/>
          <text x="400" y="280" font-family="system-ui" font-size="72" text-anchor="middle" fill="white">🎾</text>
          <text x="400" y="340" font-family="system-ui" font-size="24" text-anchor="middle" fill="white" opacity="0.9">Tennis Club</text>
        </svg>
      `
      
      return new NextResponse(fallbackSVG, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      })
    }
    
    // If we have API key and photo reference, fetch from Google
    if (GOOGLE_API_KEY) {
      const googlePhotoUrl = `${GOOGLE_PHOTO_BASE_URL}?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`
      
      try {
        const response = await fetch(googlePhotoUrl)
        
        if (response.ok) {
          const imageBuffer = await response.arrayBuffer()
          const contentType = response.headers.get('content-type') || 'image/jpeg'
          
          return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
          })
        }
      } catch (error) {
        console.error('Error fetching Google photo:', error)
      }
    }
    
    // Fallback for any errors or missing API key
    const fallbackSVG = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#gradient)"/>
        <text x="400" y="280" font-family="system-ui" font-size="72" text-anchor="middle" fill="white">🎾</text>
        <text x="400" y="340" font-family="system-ui" font-size="24" text-anchor="middle" fill="white" opacity="0.9">Tennis Club</text>
      </svg>
    `
    
    return new NextResponse(fallbackSVG, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    })
    
  } catch (error) {
    console.error('Error in club photo proxy:', error)
    
    // Error fallback
    const errorSVG = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#e5e7eb"/>
        <text x="400" y="300" font-family="system-ui" font-size="20" text-anchor="middle" fill="#6b7280">Image unavailable</text>
      </svg>
    `
    
    return new NextResponse(errorSVG, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }
}