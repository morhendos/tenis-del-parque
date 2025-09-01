import { NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Generate a fallback SVG image
const generateFallbackImage = (width = 800, height = 600, message = 'Tennis Club') => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#gradient)"/>
      <text x="${width/2}" y="${height/2 - 20}" font-family="system-ui" font-size="48" text-anchor="middle" fill="white" font-weight="bold">🎾</text>
      <text x="${width/2}" y="${height/2 + 20}" font-family="system-ui" font-size="18" text-anchor="middle" fill="white" opacity="0.9">${message}</text>
    </svg>
  `.trim()
  
  return svg
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const photoReference = searchParams.get('photo_reference')
    const maxwidth = parseInt(searchParams.get('maxwidth') || '800')
    const maxheight = Math.round(maxwidth * 0.75) // 4:3 aspect ratio

    console.log(`[Google Photos] Request for photo_reference: ${photoReference?.substring(0, 20)}...`)

    // Validate photo reference
    if (!photoReference) {
      console.error('[Google Photos] Missing photo_reference parameter')
      const fallbackSvg = generateFallbackImage(maxwidth, maxheight, 'Image Missing')
      return new NextResponse(fallbackSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
          'X-Error': 'missing-photo-reference'
        }
      })
    }

    // Basic validation of photo reference format
    if (photoReference.length < 10 || photoReference.includes(' ')) {
      console.error(`[Google Photos] Invalid photo_reference format: ${photoReference}`)
      const fallbackSvg = generateFallbackImage(maxwidth, maxheight, 'Invalid Reference')
      return new NextResponse(fallbackSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
          'X-Error': 'invalid-photo-reference'
        }
      })
    }

    // Check if Google Maps API key is available
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error('[Google Photos] Missing GOOGLE_MAPS_API_KEY environment variable')
      const fallbackSvg = generateFallbackImage(maxwidth, maxheight, 'API Key Missing')
      return new NextResponse(fallbackSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
          'X-Error': 'missing-api-key'
        }
      })
    }

    // Construct Google Photos URL
    const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`

    try {
      console.log(`[Google Photos] Fetching from Google API...`)
      
      // Fetch with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(googlePhotoUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'TenisDelParque/1.0'
        }
      })

      clearTimeout(timeoutId)

      console.log(`[Google Photos] Google API response: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`[Google Photos] Google API error ${response.status}: ${errorText}`)
        
        let errorMessage = 'Photo Unavailable'
        if (response.status === 403) {
          errorMessage = 'API Access Denied'
        } else if (response.status === 400) {
          errorMessage = 'Invalid Photo Reference'
        } else if (response.status === 404) {
          errorMessage = 'Photo Not Found'
        }

        const fallbackSvg = generateFallbackImage(maxwidth, maxheight, errorMessage)
        return new NextResponse(fallbackSvg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600',
            'X-Error': `google-api-${response.status}`,
            'X-Error-Details': response.statusText
          }
        })
      }

      // Get the image data
      const imageBuffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || 'image/jpeg'

      console.log(`[Google Photos] Successfully served image, size: ${imageBuffer.byteLength} bytes, type: ${contentType}`)

      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400', // Cache successful images for 24 hours
          'X-Image-Source': 'google-photos',
          'X-Image-Size': imageBuffer.byteLength.toString()
        }
      })

    } catch (apiError) {
      console.error('[Google Photos] Fetch error:', apiError.message)
      
      let errorMessage = 'Network Error'
      if (apiError.name === 'AbortError') {
        errorMessage = 'Request Timeout'
      } else if (apiError.message.includes('fetch')) {
        errorMessage = 'Connection Failed'
      }

      const fallbackSvg = generateFallbackImage(maxwidth, maxheight, errorMessage)
      return new NextResponse(fallbackSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=1800', // Cache errors for 30 minutes
          'X-Error': 'fetch-error',
          'X-Error-Details': apiError.message
        }
      })
    }

  } catch (error) {
    console.error('[Google Photos] Unexpected error:', error)
    
    const fallbackSvg = generateFallbackImage(800, 600, 'System Error')
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=1800',
        'X-Error': 'system-error',
        'X-Error-Details': error.message
      }
    })
  }
}
