'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { i18n, getTranslation, getSectionTranslations } from '../i18n/config';

export function useLocale() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get current locale from URL params
  const locale = params?.locale || i18n.defaultLocale;
  
  // Validate locale
  const currentLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  
  // Function to switch language
  const switchLocale = (newLocale) => {
    if (!i18n.locales.includes(newLocale)) return;
    
    // Get the current path without locale
    const segments = pathname.split('/');
    const hasLocale = i18n.locales.includes(segments[1]);
    
    let newPath;
    if (hasLocale) {
      // Replace existing locale
      segments[1] = newLocale;
      newPath = segments.join('/');
    } else {
      // Add locale if missing
      newPath = `/${newLocale}${pathname}`;
    }
    
    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;samesite=lax`;
    
    // Navigate to new path
    router.push(newPath);
  };
  
  // Helper to get translations
  const t = (section, key) => {
    return getTranslation(currentLocale, section, key);
  };
  
  // Helper to get all translations for a section
  const tSection = (section) => {
    return getSectionTranslations(currentLocale, section);
  };
  
  // Get alternate language
  const alternateLocale = currentLocale === 'es' ? 'en' : 'es';
  
  // Build alternate URL for hreflang
  const getAlternateUrl = () => {
    const segments = pathname.split('/');
    const hasLocale = i18n.locales.includes(segments[1]);
    
    if (hasLocale) {
      segments[1] = alternateLocale;
      return segments.join('/');
    } else {
      return `/${alternateLocale}${pathname}`;
    }
  };
  
  return {
    locale: currentLocale,
    locales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
    switchLocale,
    t,
    tSection,
    alternateLocale,
    getAlternateUrl,
  };
}