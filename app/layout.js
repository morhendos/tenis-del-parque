import { Outfit, Raleway } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit'
})

const raleway = Raleway({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway'
})

export const metadata = {
  title: 'Tenis del Parque - Sotogrande',
  description: 'Únete a la primera liga de tenis amateur en Sotogrande. Compite, mejora tu juego y forma parte de nuestra comunidad.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} ${raleway.variable} font-sans`}>{children}</body>
    </html>
  )
}