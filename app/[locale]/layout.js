import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import MicrosoftClarity from '@/components/analytics/MicrosoftClarity'
import { i18n } from '@/lib/i18n/config'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const locale = params.locale;
  
  return {
    title: locale === 'es' 
      ? 'Tenis del Parque - Liga de Tenis Amateur en España' 
      : 'Tenis del Parque - Amateur Tennis League in Spain',
    description: locale === 'es'
      ? 'Únete a la liga de tenis amateur más grande de España. Encuentra jugadores de tu nivel, juega partidos cada semana y mejora tu juego.'
      : 'Join Spain\'s largest amateur tennis league. Find players at your level, play matches every week, and improve your game.',
    metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://tenisdelparque.com'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'es': '/es',
        'en': '/en'
      }
    },
    openGraph: {
      title: locale === 'es' 
        ? 'Tenis del Parque - Liga de Tenis Amateur' 
        : 'Tenis del Parque - Amateur Tennis League',
      description: locale === 'es'
        ? 'La plataforma líder de ligas de tenis amateur en España'
        : 'The leading amateur tennis league platform in Spain',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: locale === 'es' ? 'en_US' : 'es_ES',
      type: 'website',
      siteName: 'Tenis del Parque',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'es' 
        ? 'Tenis del Parque - Liga de Tenis Amateur' 
        : 'Tenis del Parque - Amateur Tennis League',
      description: locale === 'es'
        ? 'Únete a la liga de tenis amateur más grande de España'
        : 'Join Spain\'s largest amateur tennis league',
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
  };
}

export default function LocaleLayout({ children, params }) {
  const locale = params.locale;
  
  // Organization schema for SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'Tenis del Parque',
    url: 'https://tenisdelparque.com',
    logo: 'https://tenisdelparque.com/logo.png',
    description: locale === 'es' 
      ? 'Liga de tenis amateur organizando partidos semanales en toda España'
      : 'Amateur tennis league organizing weekly matches across Spain',
    sport: 'Tennis',
    areaServed: {
      '@type': 'Country',
      name: 'Spain'
    },
    location: [
      {
        '@type': 'Place',
        name: 'Sotogrande',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Sotogrande',
          addressRegion: 'Cádiz',
          addressCountry: 'ES'
        }
      },
      {
        '@type': 'Place',
        name: 'Málaga',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Málaga',
          addressRegion: 'Málaga',
          addressCountry: 'ES'
        }
      },
      {
        '@type': 'Place',
        name: 'Valencia',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Valencia',
          addressRegion: 'Valencia',
          addressCountry: 'ES'
        }
      },
      {
        '@type': 'Place',
        name: 'Sevilla',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Sevilla',
          addressRegion: 'Sevilla',
          addressCountry: 'ES'
        }
      }
    ],
    sameAs: [
      'https://www.facebook.com/tenisdelparque',
      'https://www.instagram.com/tenisdelparque',
      'https://twitter.com/tenisdelparque'
    ]
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {children}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
      {process.env.NEXT_PUBLIC_CLARITY_ID && (
        <MicrosoftClarity clarityId={process.env.NEXT_PUBLIC_CLARITY_ID} />
      )}
    </>
  );
}