import dbConnect from '@/lib/db/mongoose'
import Club from '@/lib/models/Club'
import City from '@/lib/models/City'
import ClubDetailPageSSG from '@/components/pages/ClubDetailPageSSG'

// Generate static params for all club pages
export async function generateStaticParams() {
  try {
    await dbConnect()
    
    // Get all active clubs with city and locale information
    const clubs = await Club.find({ status: 'active' })
      .select('slug location.city')
      .lean()
    
    // Generate params for both locales for each club
    const params = []
    
    for (const club of clubs) {
      if (club.slug && club.location?.city) {
        // Add both Spanish and English versions
        params.push(
          { locale: 'es', city: club.location.city, slug: club.slug },
          { locale: 'en', city: club.location.city, slug: club.slug }
        )
      }
    }
    
    console.log(`Generated ${params.length} static params for club pages`)
    return params
    
  } catch (error) {
    console.error('Error generating static params for clubs:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { locale, city, slug } = params
  
  try {
    await dbConnect()
    
    // Fetch the specific club for metadata
    const club = await Club.findOne({ slug, 'location.city': city, status: 'active' })
      .select('name description location images googleData')
      .lean()
    
    if (!club) {
      return {
        title: locale === 'es' ? 'Club no encontrado' : 'Club not found',
        description: locale === 'es' 
          ? 'El club que buscas no está disponible'
          : 'The club you are looking for is not available'
      }
    }
    
    const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const description = club.description?.[locale] || club.description?.es || ''
    
    return {
      title: locale === 'es' 
        ? `${club.name} - Club de Tenis en ${cityName} | Tenis del Parque`
        : `${club.name} - Tennis Club in ${cityName} | Tennis Park`,
      description: locale === 'es'
        ? description || `Descubre ${club.name}, un excelente club de tenis en ${cityName}. Instalaciones, servicios, precios y más información.`
        : description || `Discover ${club.name}, an excellent tennis club in ${cityName}. Facilities, services, pricing and more information.`,
      keywords: locale === 'es'
        ? [`${club.name}`, 'club tenis', cityName, 'instalaciones tenis', 'pistas tenis', 'España']
        : [`${club.name}`, 'tennis club', cityName, 'tennis facilities', 'tennis courts', 'Spain'],
      openGraph: {
        title: `${club.name} - ${cityName}`,
        description: description || (locale === 'es' 
          ? `Club de tenis en ${cityName}`
          : `Tennis club in ${cityName}`),
        type: 'website',
        images: club.images?.main ? [{
          url: club.images.main,
          width: 1200,
          height: 630,
          alt: club.name
        }] : [],
      },
      alternates: {
        canonical: `/${locale}/clubs/${city}/${slug}`,
        languages: {
          'es': `/es/clubs/${city}/${slug}`,
          'en': `/en/clubs/${city}/${slug}`
        }
      }
    }
  } catch (error) {
    console.error('Error generating metadata for club:', error)
    return {
      title: locale === 'es' ? 'Club de Tenis' : 'Tennis Club',
      description: locale === 'es' 
        ? 'Información sobre club de tenis'
        : 'Tennis club information'
    }
  }
}

// Server-side data fetching function
async function getClubData(city, slug) {
  try {
    await dbConnect()
    
    // Get the specific club with full details
    const club = await Club.findOne({ 
      slug, 
      'location.city': city, 
      status: 'active' 
    }).lean()
    
    if (!club) {
      return { club: null, nearbyClubs: [], error: 'Club not found' }
    }
    
    // Get nearby clubs in the same city (excluding current club)
    const nearbyClubs = await Club.find({
      'location.city': city,
      status: 'active',
      _id: { $ne: club._id }
    })
    .select('name slug location courts images')
    .limit(5)
    .lean()
    
    return {
      club,
      nearbyClubs,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ Error fetching club data:', error)
    return {
      club: null,
      nearbyClubs: [],
      error: error.message,
      lastUpdated: new Date().toISOString()
    }
  }
}

// Main page component - now server-side rendered
export default async function ClubDetailPage({ params }) {
  const { locale, city, slug } = params
  const clubData = await getClubData(city, slug)
  
  return (
    <ClubDetailPageSSG
      locale={locale || 'es'}
      city={city}
      slug={slug}
      clubData={clubData}
    />
  )
}

// Enable Incremental Static Regeneration
// Revalidate every 6 hours (21600 seconds) - club info changes occasionally
export const revalidate = 21600
