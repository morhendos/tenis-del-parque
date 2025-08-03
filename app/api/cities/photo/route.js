import { NextResponse } from 'next/server'

// Generate consistent fallback image for all cities
const getConsistentFallback = (photoReference) => {
  // Create a generic city fallback using SVG
  const svgFallback = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10B981;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#cityGrad)"/>
      <text x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white" opacity="0.9">🏙️</text>
      <text x="400" y="340" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="white" opacity="0.8">Ciudad</text>
    </svg>
  `
  
  const base64Svg = Buffer.from(svgFallback).toString('base64')
  return `data:image/svg+xml;base64,${base64Svg}`
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const photoReference = searchParams.get('photo_reference')
    const maxwidth = searchParams.get('maxwidth') || '800'

    if (!photoReference) {
      return NextResponse.json({ error: 'photo_reference is required' }, { status: 400 })
    }

    // Check if Google Maps API is available
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      // Return consistent fallback image
      return NextResponse.redirect(getConsistentFallback(photoReference))
    }

    // Construct Google Photos URL
    const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`

    try {
      // Fetch the image from Google
      const response = await fetch(googlePhotoUrl)
      
      if (!response.ok) {
        throw new Error(`Google Photos API error: ${response.status}`)
      }

      // Return the image data
      const imageBuffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || 'image/jpeg'

      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
          'X-Image-Source': 'google-photos-public'
        }
      })

    } catch (apiError) {
      console.error('Google Photos API error:', apiError.message)
      
      // Return consistent fallback on error
      return NextResponse.redirect(getConsistentFallback(photoReference))
    }

  } catch (error) {
    console.error('Error serving Google Photo:', error)
    
    // Return consistent fallback on any error
    return NextResponse.redirect(getConsistentFallback('default'))
  }
}
