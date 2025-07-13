import { i18n } from '@/lib/i18n/config';

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
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="alternate" hrefLang="es" href="/es" />
        <link rel="alternate" hrefLang="en" href="/en" />
        <link rel="alternate" hrefLang="x-default" href="/es" />
      </head>
      <body>{children}</body>
    </html>
  );
}