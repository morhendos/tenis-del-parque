import LegalPageContent from '@/components/pages/LegalPageContent'

export async function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export async function generateMetadata({ params }) {
  const locale = params.locale || 'es'
  return {
    title: locale === 'es'
      ? 'Política de Privacidad | Tenis del Parque'
      : 'Privacy Policy | Tenis del Parque',
    description: locale === 'es'
      ? 'Política de privacidad y tratamiento de datos personales de tenisdp.es conforme al RGPD y LOPDGDD.'
      : 'Privacy policy and personal data processing for tenisdp.es in compliance with GDPR and LOPDGDD.',
    alternates: {
      canonical: `/${locale}/politica-privacidad`,
      languages: { 'es': '/es/politica-privacidad', 'en': '/en/privacy-policy' }
    }
  }
}

export default function PoliticaPrivacidadPage({ params }) {
  return <LegalPageContent locale={params.locale || 'es'} pageKey="privacidad" />
}
