'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// English route that redirects to Spanish 'ligas' page
export default function LeaguesPageEnglish({ params }) {
  const { locale } = params;
  
  useEffect(() => {
    // In production, you might want to handle this with middleware
    // For now, we'll just redirect to the ligas page
    redirect(`/${locale}/ligas`);
  }, [locale]);
  
  return null;
}

// Generate static params
export async function generateStaticParams() {
  return [
    { locale: 'en' }
  ];
}