import OpenRankPageClient from './OpenRankPageClient'

// Generate static params for all locales
export async function generateStaticParams() {
  return [
    { locale: 'es' },
    { locale: 'en' }
  ]
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const locale = params.locale || 'es'
  
  return {
    title: locale === 'es' 
      ? 'OpenRank - Ranking Global de Tenis | Tenis del Parque'
      : 'OpenRank - Global Tennis Ranking | Tennis Park',
    description: locale === 'es'
      ? 'Descubre el ranking global de jugadores de tenis amateur basado en el sistema ELO. Juega 8 partidos para entrar en el OpenRank.'
      : 'Discover the global amateur tennis player ranking based on the ELO system. Play 8 matches to enter the OpenRank.',
    keywords: locale === 'es'
      ? ['ranking tenis', 'ELO tenis', 'clasificación tenis amateur', 'OpenRank', 'jugadores tenis']
      : ['tennis ranking', 'tennis ELO', 'amateur tennis classification', 'OpenRank', 'tennis players'],
    openGraph: {
      title: locale === 'es' 
        ? 'OpenRank - Ranking Global de Tenis'
        : 'OpenRank - Global Tennis Ranking',
      description: locale === 'es'
        ? 'El ranking definitivo de tenis amateur basado en ELO'
        : 'The definitive amateur tennis ranking based on ELO',
      type: 'website',
    },
    alternates: {
      canonical: locale === 'es' ? '/es/openrank' : '/en/openrank',
      languages: {
        'es': '/es/openrank',
        'en': '/en/openrank'
      }
    }
  }
}

// Main page component
export default function OpenRankPage({ params }) {
  const locale = params.locale || 'es'
  
  return <OpenRankPageClient locale={locale} />
}

// Enable ISR - revalidate every 5 minutes for fresh ranking data
export const revalidate = 300
