import { Suspense } from 'react'
import LeaguesPageContent from '@/components/pages/LeaguesPageContent'
import { TennisPreloaderFullScreen } from '@/components/ui/TennisPreloader'

export default function LeaguesPage({ params }) {
  // Ensure locale is properly passed to the content component
  const locale = params?.locale || 'es'
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white">
        <TennisPreloaderFullScreen 
          text={locale === 'es' ? 'Cargando ligas...' : 'Loading leagues...'} 
          locale={locale} 
        />
      </div>
    }>
      <LeaguesPageContent locale={locale} />
    </Suspense>
  )
}

// Generate metadata for both English and Spanish routes
export function generateMetadata({ params }) {
  const locale = params?.locale || 'es'
  
  if (locale === 'es') {
    return {
      title: 'Ligas de Tenis | Tenis del Parque',
      description: 'Encuentra tu liga perfecta de tenis amateur. Sistema suizo, rankings ELO y ambiente competitivo pero relajado.',
      alternates: {
        canonical: '/es/ligas',
        languages: {
          'es': '/es/ligas',
          'en': '/en/leagues'
        }
      }
    }
  } else {
    return {
      title: 'Tennis Leagues | Tennis Park',
      description: 'Find your perfect amateur tennis league. Swiss system, ELO rankings and competitive but relaxed atmosphere.',
      alternates: {
        canonical: '/en/leagues',
        languages: {
          'es': '/es/ligas', 
          'en': '/en/leagues'
        }
      }
    }
  }
}