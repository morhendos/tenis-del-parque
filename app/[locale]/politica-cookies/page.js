import LegalPageContent from '@/components/pages/LegalPageContent'

export async function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export async function generateMetadata({ params }) {
  const locale = params.locale || 'es'
  return {
    title: locale === 'es'
      ? 'Política de Cookies | Tenis del Parque'
      : 'Cookie Policy | Tenis del Parque',
    description: locale === 'es'
      ? 'Información sobre el uso de cookies en tenisdp.es y cómo gestionarlas.'
      : 'Information about cookie usage on tenisdp.es and how to manage them.',
    alternates: {
      canonical: `/${locale}/politica-cookies`,
      languages: { 'es': '/es/politica-cookies', 'en': '/en/cookie-policy' }
    }
  }
}

export default function PoliticaCookiesPage({ params }) {
  return <LegalPageContent locale={params.locale || 'es'} pageKey="cookies" />
}
