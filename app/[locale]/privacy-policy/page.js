import LegalPageContent from '@/components/pages/LegalPageContent'

export async function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export async function generateMetadata({ params }) {
  const locale = params.locale || 'en'
  return {
    title: locale === 'en'
      ? 'Privacy Policy | Tenis del Parque'
      : 'Política de Privacidad | Tenis del Parque',
    description: locale === 'en'
      ? 'Privacy policy and personal data processing for tenisdp.es in compliance with GDPR and LOPDGDD.'
      : 'Política de privacidad y tratamiento de datos personales de tenisdp.es conforme al RGPD y LOPDGDD.',
    alternates: {
      canonical: `/${locale}/privacy-policy`,
      languages: { 'es': '/es/politica-privacidad', 'en': '/en/privacy-policy' }
    }
  }
}

export default function PrivacyPolicyPage({ params }) {
  return <LegalPageContent locale={params.locale || 'en'} pageKey="privacidad" />
}
