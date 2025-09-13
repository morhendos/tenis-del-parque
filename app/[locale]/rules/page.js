import RulesPageContent from '@/components/pages/RulesPageContent'

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
      ? 'Reglas del Tenis Amateur - Sistema Suizo y ELO | Tenis del Parque'
      : 'Amateur Tennis Rules - Swiss System and ELO | Tennis Park',
    description: locale === 'es'
      ? 'Conoce las reglas completas de nuestras ligas amateur de tenis. Sistema suizo, rankings ELO, normas de juego y código de conducta.'
      : 'Learn the complete rules of our amateur tennis leagues. Swiss system, ELO rankings, game rules and code of conduct.',
    keywords: locale === 'es'
      ? ['reglas tenis', 'sistema suizo', 'ELO ranking', 'tenis amateur', 'código conducta']
      : ['tennis rules', 'swiss system', 'ELO ranking', 'amateur tennis', 'code of conduct'],
    openGraph: {
      title: locale === 'es' 
        ? 'Reglas del Tenis Amateur - Sistema Suizo y ELO'
        : 'Amateur Tennis Rules - Swiss System and ELO',
      description: locale === 'es'
        ? 'Todo lo que necesitas saber sobre nuestro sistema de ligas'
        : 'Everything you need to know about our league system',
      type: 'website',
    },
    alternates: {
      canonical: locale === 'es' ? '/es/reglas' : '/en/rules',
      languages: {
        'es': '/es/reglas',
        'en': '/en/rules'
      }
    }
  }
}

// Main page component - now server-side rendered
export default function RulesPage({ params }) {
  const locale = params.locale || 'es'
  
  return <RulesPageContent locale={locale} />
}

// Enable static generation - rules don't change often
// Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400
