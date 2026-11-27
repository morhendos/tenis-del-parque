import './fonts.css'
import './globals.css'
import { Providers } from './providers'
import TapFeedback from '@/components/TapFeedback'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://www.tenisdp.es'),
  title: {
    template: '%s | Tenis del Parque',
    default: 'Tenis del Parque - Amateur Tennis League'
  },
  description: 'Join the premier amateur tennis league in Spain. Find players at your level, compete weekly, and improve your game.',
  keywords: ['tennis', 'amateur tennis', 'tennis league', 'Spain', 'Sotogrande', 'Málaga', 'Valencia', 'Sevilla'],
  authors: [{ name: 'Tenis del Parque' }],
  creator: 'Tenis del Parque',
  publisher: 'Tenis del Parque',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TenisDP',
  },
  openGraph: {
    type: 'website',
    siteName: 'Tenis del Parque',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tenis del Parque - Amateur Tennis League',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tenisdelparque',
    creator: '@tenisdelparque',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6B46C1' },
    { media: '(prefers-color-scheme: dark)', color: '#6B46C1' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="TenisDP" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="alternate" hrefLang="es" href="/es" />
        <link rel="alternate" hrefLang="en" href="/en" />
        <link rel="alternate" hrefLang="x-default" href="/es" />
        <link rel="preload" href="/fonts/outfit-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/raleway-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-sans">
        <TapFeedback />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
