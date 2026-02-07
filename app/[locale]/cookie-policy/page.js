import LegalPageContent from '@/components/pages/LegalPageContent'

export async function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export async function generateMetadata({ params }) {
  const locale = params.locale || 'en'
  return {
    title: locale === 'en'
      ? 'Cookie Policy | Tenis del Parque'
      : 'Política de Cookies | Tenis del Parque',
    description: locale === 'en'
      ? 'Information about cookie usage on tenisdp.es and how to manage them.'
      : 'Información sobre el uso de cookies en tenisdp.es y cómo gestionarlas.',
    alternates: {
      canonical: `/${locale}/cookie-policy`,
      languages: { 'es': '/es/politica-cookies', 'en': '/en/cookie-policy' }
    }
  }
}

export default function CookiePolicyPage({ params }) {
  return <LegalPageContent locale={params.locale || 'en'} pageKey="cookies" />
}
