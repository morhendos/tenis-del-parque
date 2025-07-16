import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import Link from 'next/link';
import { Trophy, Users, Calendar, MapPin } from 'lucide-react';

const leaguesData = {
  es: {
    title: 'Nuestras Ligas',
    subtitle: 'Encuentra la liga perfecta para tu nivel',
    description: 'Únete a una de nuestras ligas de tenis amateur en toda España. Partidos semanales, jugadores de tu nivel y una comunidad apasionada.',
    activeLeagues: 'Ligas Activas',
    comingSoon: 'Próximamente',
    joinButton: 'Unirse a la Liga',
    learnMore: 'Más Información',
    features: {
      weeklyMatches: 'Partidos Semanales',
      levelBased: 'Por Niveles',
      community: 'Comunidad Local'
    },
    cities: {
      sotogrande: {
        name: 'Sotogrande',
        region: 'Cádiz',
        players: '150+ jugadores',
        status: 'active',
        description: 'La liga original, establecida en 2023'
      },
      malaga: {
        name: 'Málaga',
        region: 'Costa del Sol',
        players: '100+ jugadores',
        status: 'active',
        description: 'Costa del Sol, sol y tenis todo el año'
      },
      valencia: {
        name: 'Valencia',
        region: 'Comunidad Valenciana',
        players: '80+ jugadores',
        status: 'active',
        description: 'Mediterráneo y tenis de calidad'
      },
      sevilla: {
        name: 'Sevilla',
        region: 'Andalucía',
        players: '60+ jugadores',
        status: 'active',
        description: 'Pasión andaluza por el tenis'
      },
      barcelona: {
        name: 'Barcelona',
        region: 'Cataluña',
        players: 'Próximamente',
        status: 'coming',
        description: 'La capital del tenis catalán'
      },
      madrid: {
        name: 'Madrid',
        region: 'Comunidad de Madrid',
        players: 'Próximamente',
        status: 'coming',
        description: 'Tenis en el corazón de España'
      },
      marbella: {
        name: 'Marbella',
        region: 'Costa del Sol',
        players: 'Próximamente',
        status: 'coming',
        description: 'Lujo y tenis en la Costa del Sol'
      }
    }
  },
  en: {
    title: 'Our Leagues',
    subtitle: 'Find the perfect league for your level',
    description: 'Join one of our amateur tennis leagues across Spain. Weekly matches, players at your level, and a passionate community.',
    activeLeagues: 'Active Leagues',
    comingSoon: 'Coming Soon',
    joinButton: 'Join League',
    learnMore: 'Learn More',
    features: {
      weeklyMatches: 'Weekly Matches',
      levelBased: 'Level Based',
      community: 'Local Community'
    },
    cities: {
      sotogrande: {
        name: 'Sotogrande',
        region: 'Cádiz',
        players: '150+ players',
        status: 'active',
        description: 'The original league, established in 2023'
      },
      malaga: {
        name: 'Málaga',
        region: 'Costa del Sol',
        players: '100+ players',
        status: 'active',
        description: 'Costa del Sol, sun and tennis all year round'
      },
      valencia: {
        name: 'Valencia',
        region: 'Valencia Region',
        players: '80+ players',
        status: 'active',
        description: 'Mediterranean and quality tennis'
      },
      sevilla: {
        name: 'Seville',
        region: 'Andalusia',
        players: '60+ players',
        status: 'active',
        description: 'Andalusian passion for tennis'
      },
      barcelona: {
        name: 'Barcelona',
        region: 'Catalonia',
        players: 'Coming Soon',
        status: 'coming',
        description: 'The capital of Catalan tennis'
      },
      madrid: {
        name: 'Madrid',
        region: 'Madrid Region',
        players: 'Coming Soon',
        status: 'coming',
        description: 'Tennis in the heart of Spain'
      },
      marbella: {
        name: 'Marbella',
        region: 'Costa del Sol',
        players: 'Coming Soon',
        status: 'coming',
        description: 'Luxury and tennis on the Costa del Sol'
      }
    }
  }
};

export default function LeaguesPage({ params }) {
  const { locale } = params;
  const content = leaguesData[locale] || leaguesData['es'];

  const activeLeagues = Object.entries(content.cities).filter(([_, city]) => city.status === 'active');
  const comingLeagues = Object.entries(content.cities).filter(([_, city]) => city.status === 'coming');

  return (
    <>
      <Navigation locale={locale} />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
            <p className="text-xl mb-6">{content.subtitle}</p>
            <p className="text-lg opacity-90 max-w-3xl">{content.description}</p>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">{content.features.weeklyMatches}</h3>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">{content.features.levelBased}</h3>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">{content.features.community}</h3>
            </div>
          </div>

          {/* Active Leagues */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{content.activeLeagues}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeLeagues.map(([key, city]) => (
                <div key={key} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{city.name}</h3>
                        <p className="text-gray-600 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {city.region}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                        {city.players}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-6">{city.description}</p>
                    <div className="flex gap-4">
                      <Link
                        href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${key}`}
                        className="flex-1 bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {content.joinButton}
                      </Link>
                      <Link
                        href={`/${locale}/${key}`}
                        className="flex-1 bg-gray-200 text-gray-800 text-center py-3 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        {content.learnMore}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon Leagues */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{content.comingSoon}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comingLeagues.map(([key, city]) => (
                <div key={key} className="bg-gray-100 rounded-lg p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{city.name}</h3>
                  <p className="text-gray-600">{city.region}</p>
                  <p className="text-purple-600 font-semibold mt-4">{city.players}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer locale={locale} />
    </>
  );
}

// Generate static params for both locales
export async function generateStaticParams() {
  return [
    { locale: 'es' },
    { locale: 'en' }
  ];
}

// Metadata for the page
export async function generateMetadata({ params }) {
  const { locale } = params;
  
  return {
    title: locale === 'es' ? 'Ligas de Tenis Amateur - Tenis del Parque' : 'Amateur Tennis Leagues - Tenis del Parque',
    description: locale === 'es' 
      ? 'Descubre nuestras ligas de tenis amateur en Sotogrande, Málaga, Valencia y Sevilla. Únete a partidos semanales con jugadores de tu nivel.'
      : 'Discover our amateur tennis leagues in Sotogrande, Málaga, Valencia and Seville. Join weekly matches with players at your level.',
    keywords: locale === 'es'
      ? ['ligas tenis', 'tenis amateur', 'tenis sotogrande', 'tenis málaga', 'tenis valencia', 'tenis sevilla']
      : ['tennis leagues', 'amateur tennis', 'tennis sotogrande', 'tennis malaga', 'tennis valencia', 'tennis seville'],
    openGraph: {
      title: locale === 'es' ? 'Ligas de Tenis Amateur en España' : 'Amateur Tennis Leagues in Spain',
      description: locale === 'es' 
        ? 'Únete a nuestras ligas de tenis amateur. Partidos semanales en tu ciudad.'
        : 'Join our amateur tennis leagues. Weekly matches in your city.',
      images: ['/og-leagues.png']
    }
  };
}