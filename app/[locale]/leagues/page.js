import { Suspense } from 'react'
import dbConnect from '@/lib/db/mongoose'
import City from '@/lib/models/City'
import League from '@/lib/models/League'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import CityCard from '@/components/leagues/CityCard'
import { TennisPreloaderFullScreen } from '@/components/ui/TennisPreloader'
import { homeContent } from '@/lib/content/homeContent'

// Generate static params for all locales
export async function generateStaticParams() {
  return [
    { locale: 'es' },
    { locale: 'en' }
  ]
}

// Generate metadata for both English and Spanish routes
export function generateMetadata({ params }) {
  const locale = params?.locale || 'es'
  
  if (locale === 'es') {
    return {
      title: 'Ligas de Tenis por Ciudad - Encuentra tu Liga | Tenis del Parque',
      description: 'Explora ligas de tenis en Sotogrande, Marbella, Estepona y Málaga. Sistema suizo, rankings ELO y múltiples niveles.',
      keywords: ['ligas tenis', 'tenis amateur', 'sotogrande', 'marbella', 'estepona', 'malaga'],
      openGraph: {
        title: 'Ligas de Tenis por Ciudad',
        description: 'Ligas de tenis en toda la Costa del Sol',
        type: 'website',
      },
      alternates: {
        canonical: '/es/leagues',
        languages: {
          'es': '/es/leagues',
          'en': '/en/leagues'
        }
      }
    }
  } else {
    return {
      title: 'Tennis Leagues by City - Find Your League | Tennis Park',
      description: 'Explore tennis leagues in Sotogrande, Marbella, Estepona and Málaga. Swiss system, ELO rankings and multiple levels.',
      keywords: ['tennis leagues', 'amateur tennis', 'sotogrande', 'marbella', 'estepona', 'malaga'],
      openGraph: {
        title: 'Tennis Leagues by City',
        description: 'Tennis leagues throughout Costa del Sol',
        type: 'website',
      },
      alternates: {
        canonical: '/en/leagues',
        languages: {
          'es': '/es/leagues',
          'en': '/en/leagues'
        }
      }
    }
  }
}

// Server-side data fetching function
async function getCitiesData() {
  try {
    await dbConnect()
    
    // Get all active cities
    const cities = await City.find({ status: 'active' })
      .sort({ displayOrder: 1, 'name.es': 1 })
      .lean()
    
    // Get league count for each city
    const citiesWithCounts = await Promise.all(
      cities.map(async (city) => {
        const count = await League.countDocuments({
          city: city._id,
          status: { $in: ['active', 'coming_soon', 'registration_open'] }
        })
        return {
          ...city,
          _id: city._id.toString(),
          leagueCount: count
        }
      })
    )
    
    // Get total stats
    const totalLeagues = await League.countDocuments({
      status: { $in: ['active', 'coming_soon', 'registration_open'] }
    })
    
    const activeLeagues = await League.countDocuments({
      status: 'active'
    })
    
    return {
      cities: citiesWithCounts,
      stats: {
        totalCities: citiesWithCounts.length,
        totalLeagues,
        activeLeagues
      }
    }
  } catch (error) {
    console.error('❌ Error fetching cities data:', error)
    return {
      cities: [],
      stats: {
        totalCities: 0,
        totalLeagues: 0,
        activeLeagues: 0
      },
      error: error.message
    }
  }
}

// Main page component
export default async function LeaguesPage({ params }) {
  const locale = params?.locale || 'es'
  const citiesData = await getCitiesData()
  const footerContent = homeContent[locale]?.footer || homeContent['es']?.footer
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <TennisPreloaderFullScreen 
          text={locale === 'es' ? 'Cargando ciudades...' : 'Loading cities...'} 
          locale={locale} 
        />
      </div>
    }>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navigation 
          currentPage="leagues" 
          language={locale}
          showLanguageSwitcher={true}
        />
        
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {locale === 'es' ? 'Elige Tu Ciudad' : 'Choose Your City'}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              {locale === 'es' 
                ? 'Selecciona una ciudad para ver las ligas de tenis disponibles. Encuentra la liga perfecta para tu nivel.'
                : 'Select a city to view available tennis leagues. Find the perfect league for your level.'}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-3xl font-bold">{citiesData.stats.totalCities}</div>
                <div className="text-sm opacity-90">
                  {locale === 'es' ? 'Ciudades' : 'Cities'}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-3xl font-bold">{citiesData.stats.totalLeagues}</div>
                <div className="text-sm opacity-90">
                  {locale === 'es' ? 'Ligas' : 'Leagues'}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-3xl font-bold">{citiesData.stats.activeLeagues}</div>
                <div className="text-sm opacity-90">
                  {locale === 'es' ? 'Activas' : 'Active'}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Cities Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            {citiesData.error ? (
              <div className="text-center py-12 max-w-2xl mx-auto">
                <div className="text-6xl mb-6">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {locale === 'es' ? 'Error cargando ciudades' : 'Error loading cities'}
                </h3>
                <p className="text-gray-600">{citiesData.error}</p>
              </div>
            ) : citiesData.cities.length === 0 ? (
              <div className="text-center py-12 max-w-2xl mx-auto">
                <div className="text-6xl mb-6">🏙️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {locale === 'es' ? 'No hay ciudades disponibles' : 'No cities available'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'es' 
                    ? 'Estamos trabajando para agregar más ciudades pronto.'
                    : 'We are working to add more cities soon.'}
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {locale === 'es' ? 'Nuestras Ciudades' : 'Our Cities'}
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {locale === 'es'
                      ? 'Ofrecemos ligas de tenis en las principales ciudades de la Costa del Sol. Haz clic en una ciudad para ver todas las ligas disponibles.'
                      : 'We offer tennis leagues in the main cities of Costa del Sol. Click on a city to see all available leagues.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                  {citiesData.cities.map(city => (
                    <CityCard 
                      key={city._id}
                      city={city}
                      leagueCount={city.leagueCount}
                      locale={locale}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {locale === 'es' ? '¿Listo para jugar?' : 'Ready to play?'}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              {locale === 'es'
                ? 'Únete a la comunidad de tenis amateur más activa de la Costa del Sol'
                : 'Join the most active amateur tennis community in Costa del Sol'}
            </p>
          </div>
        </section>
        
        <Footer content={footerContent} />
      </main>
    </Suspense>
  )
}

// Enable Incremental Static Regeneration
export const revalidate = 3600
