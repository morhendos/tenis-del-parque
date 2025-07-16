import { redirect } from 'next/navigation';

// English route that redirects to Spanish 'ligas' page
export default function LeaguesPageEnglish({ params }) {
  const { locale } = params;
  
  // Redirect to the ligas page
  redirect(`/${locale}/ligas`);
}

// Generate static params
export async function generateStaticParams() {
  return [
    { locale: 'en' }
  ];
}