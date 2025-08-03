import { NextResponse } from 'next/server'

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
      // Return a proper fallback/placeholder image
      const fallbackUrl = `https://picsum.photos/${maxwidth}/${Math.round(maxwidth * 0.75)}?random=1`
      return NextResponse.redirect(fallbackUrl)
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
          'X-Image-Source': 'google-photos'
        }
      })

    } catch (apiError) {
      console.error('Google Photos API error:', apiError.message)
      
      // Fallback to proper placeholder image
      const fallbackUrl = `https://picsum.photos/${maxwidth}/${Math.round(maxwidth * 0.75)}?random=1`
      return NextResponse.redirect(fallbackUrl)
    }

  } catch (error) {
    console.error('Error serving Google Photo:', error)
    
    // Return a proper fallback image
    const fallbackUrl = `https://picsum.photos/800/600?random=1`
    return NextResponse.redirect(fallbackUrl)
  }
}
