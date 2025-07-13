'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import { homeContent } from '@/lib/content/homeContent'

export default function NotFound() {
  const params = useParams()
  const locale = params?.locale || 'es'
  
  const content = {
    es: {
      title: 'Página no encontrada',
      subtitle: 'Lo sentimos, la página que buscas no existe.',
      description: 'Es posible que el enlace esté roto o que la página haya sido eliminada.',
      button: 'Volver al inicio',
      suggestions: 'También puedes:',
      links: [
        { text: 'Ver nuestras ligas', href: '/es#cities' },
        { text: 'Leer las reglas', href: '/es/reglas' },
        { text: 'Conocer el sistema ELO', href: '/es/elo' }
      ]
    },
    en: {
      title: 'Page not found',
      subtitle: 'Sorry, the page you are looking for does not exist.',
      description: 'The link might be broken or the page may have been removed.',
      button: 'Back to home',
      suggestions: 'You can also:',
      links: [
        { text: 'View our leagues', href: '/en#cities' },
        { text: 'Read the rules', href: '/en/rules' },
        { text: 'Learn about ELO system', href: '/en/elo' }
      ]
    }
  }
  
  const t = content[locale] || content.es
  const footerContent = homeContent[locale]?.footer || homeContent.es.footer
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg to-white">
      <Navigation currentPage="404" />
      
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          {/* Tennis Ball 404 */}
          <div className="relative mb-8 mx-auto w-32 h-32">
            <div className="absolute inset-0 tennis-ball animate-bounce">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-700">404</span>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          <h1 className="text-4xl font-light text-parque-purple mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {t.subtitle}
          </p>
          <p className="text-gray-500 mb-8">
            {t.description}
          </p>
          
          {/* Primary Action */}
          <Link
            href={`/${locale}`}
            className="inline-block bg-parque-purple text-white px-8 py-3 rounded-lg font-medium hover:bg-parque-purple/90 transition-colors mb-8"
          >
            {t.button}
          </Link>
          
          {/* Suggestions */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-gray-600 mb-4">{t.suggestions}</p>
            <div className="space-y-2">
              {t.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="block text-parque-purple hover:text-parque-purple/80 transition-colors"
                >
                  {link.text} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer content={footerContent} />
    </div>
  )
}