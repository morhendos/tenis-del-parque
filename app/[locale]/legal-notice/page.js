import LegalPageContent from '@/components/pages/LegalPageContent'

export async function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }]
}

export async function generateMetadata({ params }) {
  const locale = params.locale || 'en'
  return {
    title: locale === 'en'
      ? 'Legal Notice | Tenis del Parque'
      : 'Aviso Legal | Tenis del Parque',
    description: locale === 'en'
      ? 'Legal notice and website owner identification for tenisdp.es in compliance with LSSI-CE.'
      : 'Aviso legal e identificación del titular del sitio web tenisdp.es conforme a la LSSI-CE.',
    alternates: {
      canonical: `/${locale}/legal-notice`,
      languages: { 'es': '/es/aviso-legal', 'en': '/en/legal-notice' }
    }
  }
}

export default function LegalNoticePage({ params }) {
  return <LegalPageContent locale={params.locale || 'en'} pageKey="avisoLegal" />
}
