import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongoose'
import City from '@/lib/models/City'

// Debug endpoint to check city image data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const citySlug = searchParams.get('slug')
    const cityId = searchParams.get('id')
    
    await dbConnect()
    
    let city = null
    
    if (cityId) {
      city = await City.findById(cityId).lean()
    } else if (citySlug) {
      city = await City.findOne({ slug: citySlug }).lean()
    } else {
      // Return a few cities with images for debugging
      const cities = await City.find({ 'images.main': { $exists: true, $ne: '' } })
        .limit(5)
        .lean()
      
      return NextResponse.json({
        message: 'Cities with images',
        count: cities.length,
        cities: cities.map(c => ({
          name: c.name?.es,
          slug: c.slug,
          mainImage: c.images?.main,
          googlePhotoRef: c.images?.googlePhotoReference,
          gallery: c.images?.gallery,
          hasGooglePhotos: !!(c.googleData?.photos?.length > 0)
        }))
      })
    }
    
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }
    
    // Return detailed debug information
    return NextResponse.json({
      city: {
        _id: city._id,
        name: city.name,
        slug: city.slug,
        images: city.images,
        googleData: {
          hasPhotos: !!(city.googleData?.photos?.length > 0),
          photoCount: city.googleData?.photos?.length || 0,
          placeId: city.googlePlaceId
        },
        imageDebug: {
          hasMainImage: !!city.images?.main,
          mainImageUrl: city.images?.main,
          isVercerBlobUrl: city.images?.main?.includes('blob.vercel-storage.com'),
          isGooglePhoto: !!city.images?.googlePhotoReference,
          galleryCount: city.images?.gallery?.length || 0
        }
      }
    })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
