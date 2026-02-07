import LegalPageContent from '@/components/pages/LegalPageContent'

export async function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export async function generateMetadata({ params }) {
  const locale = params.locale || 'es'
  return {
    title: locale === 'es'
      ? 'Aviso Legal | Tenis del Parque'
      : 'Legal Notice | Tenis del Parque',
    description: locale === 'es'
      ? 'Aviso legal e identificación del titular del sitio web tenisdp.es conforme a la LSSI-CE.'
      : 'Legal notice and website owner identification for tenisdp.es in compliance with LSSI-CE.',
    alternates: {
      canonical: `/${locale}/aviso-legal`,
      languages: { 'es': '/es/aviso-legal', 'en': '/en/legal-notice' }
    }
  }
}

export default function AvisoLegalPage({ params }) {
  return <LegalPageContent locale={params.locale || 'es'} pageKey="avisoLegal" />
}
