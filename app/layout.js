import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://tenisdelparque.com'),
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
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}