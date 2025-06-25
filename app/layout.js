import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Liga de Tenis del Parque - Sotogrande',
  description: 'Únete a la primera liga de tenis amateur en Sotogrande. Compite, mejora tu juego y forma parte de nuestra comunidad.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}