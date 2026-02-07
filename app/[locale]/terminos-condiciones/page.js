import LegalPageContent from '@/components/pages/LegalPageContent'

export async function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export async function generateMetadata({ params }) {
  const locale = params.locale || 'es'
  return {
    title: locale === 'es'
      ? 'Términos y Condiciones | Tenis del Parque'
      : 'Terms and Conditions | Tenis del Parque',
    description: locale === 'es'
      ? 'Términos y condiciones de contratación de inscripciones a ligas de tenis amateur en tenisdp.es.'
      : 'Terms and conditions for amateur tennis league registration purchases on tenisdp.es.',
    alternates: {
      canonical: `/${locale}/terminos-condiciones`,
      languages: { 'es': '/es/terminos-condiciones', 'en': '/en/terms-conditions' }
    }
  }
}

export default function TerminosCondicionesPage({ params }) {
  return <LegalPageContent locale={params.locale || 'es'} pageKey="terminos" />
}
