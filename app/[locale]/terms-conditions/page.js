import LegalPageContent from '@/components/pages/LegalPageContent'

export async function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export async function generateMetadata({ params }) {
  const locale = params.locale || 'en'
  return {
    title: locale === 'en'
      ? 'Terms and Conditions | Tenis del Parque'
      : 'Términos y Condiciones | Tenis del Parque',
    description: locale === 'en'
      ? 'Terms and conditions for amateur tennis league registration purchases on tenisdp.es.'
      : 'Términos y condiciones de contratación de inscripciones a ligas de tenis amateur en tenisdp.es.',
    alternates: {
      canonical: `/${locale}/terms-conditions`,
      languages: { 'es': '/es/terminos-condiciones', 'en': '/en/terms-conditions' }
    }
  }
}

export default function TermsConditionsPage({ params }) {
  return <LegalPageContent locale={params.locale || 'en'} pageKey="terminos" />
}
