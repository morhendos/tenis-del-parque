import EloPageSSG from '@/components/pages/EloPageSSG'

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
      ? 'Sistema ELO de Tenis - Rankings Precisos | Tenis del Parque'
      : 'Tennis ELO System - Accurate Rankings | Tennis Park',
    description: locale === 'es'
      ? 'Descubre cómo funciona nuestro sistema ELO para rankings precisos de tenis amateur. Emparejamientos justos y progresión transparente.'
      : 'Discover how our ELO system works for accurate amateur tennis rankings. Fair matchmaking and transparent progression.',
    keywords: locale === 'es'
      ? ['ELO tenis', 'ranking tenis', 'sistema puntuación', 'emparejamientos justos', 'tenis amateur']
      : ['tennis ELO', 'tennis ranking', 'scoring system', 'fair matchmaking', 'amateur tennis'],
    openGraph: {
      title: locale === 'es' 
        ? 'Sistema ELO de Tenis - Rankings Precisos'
        : 'Tennis ELO System - Accurate Rankings',
      description: locale === 'es'
        ? 'El sistema más justo para rankings de tenis amateur'
        : 'The fairest system for amateur tennis rankings',
      type: 'website',
    },
    alternates: {
      canonical: locale === 'es' ? '/es/elo' : '/en/elo',
      languages: {
        'es': '/es/elo',
        'en': '/en/elo'
      }
    }
  }
}

// Main page component - now server-side rendered
export default function EloPage({ params }) {
  const locale = params.locale || 'es'
  
  return <EloPageSSG locale={locale} />
}

// Enable static generation - ELO system info doesn't change often
// Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400
