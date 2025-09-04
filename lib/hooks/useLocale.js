'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { i18n, getTranslation, getSectionTranslations } from '../i18n/config';

// URL translation mapping for proper Spanish/English route conversion
const URL_TRANSLATIONS = {
  // English -> Spanish
  en: {
    'leagues': 'ligas',
    'clubs': 'clubes', 
    'rules': 'reglas',
    'signup': 'registro'
  },
  // Spanish -> English  
  es: {
    'ligas': 'leagues',
    'clubes': 'clubs',
    'reglas': 'rules', 
    'registro': 'signup'
  }
};

export function useLocale() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get current locale from URL params
  const locale = params?.locale || i18n.defaultLocale;
  
  // Validate locale
  const currentLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  
  // Function to translate URL segments between locales
  const translateUrlSegments = (pathSegments, fromLocale, toLocale) => {
    return pathSegments.map(segment => {
      // Skip locale segment and empty segments
      if (i18n.locales.includes(segment) || !segment) {
        return segment;
      }
      
      // Check if this segment needs translation
      const translations = URL_TRANSLATIONS[fromLocale];
      if (translations && translations[segment]) {
        return translations[segment];
      }
      
      // Return unchanged if no translation needed
      return segment;
    });
  };
  
  // Function to switch language with proper URL translation
  const switchLocale = (newLocale) => {
    if (!i18n.locales.includes(newLocale)) return;
    
    // Get the current path segments
    const segments = pathname.split('/');
    const hasLocale = i18n.locales.includes(segments[1]);
    
    let newPath;
    if (hasLocale) {
      // Current locale
      const currentLoc = segments[1];
      
      // Translate URL segments if switching locales
      if (currentLoc !== newLocale) {
        const translatedSegments = translateUrlSegments(segments, currentLoc, newLocale);
        translatedSegments[1] = newLocale; // Set new locale
        newPath = translatedSegments.join('/');
      } else {
        // Same locale, just replace
        segments[1] = newLocale;
        newPath = segments.join('/');
      }
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
  
  // Build alternate URL for hreflang with proper translations
  const getAlternateUrl = () => {
    const segments = pathname.split('/');
    const hasLocale = i18n.locales.includes(segments[1]);
    
    if (hasLocale) {
      const currentLoc = segments[1];
      const translatedSegments = translateUrlSegments(segments, currentLoc, alternateLocale);
      translatedSegments[1] = alternateLocale;
      return translatedSegments.join('/');
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
    translateUrlSegments, // Export for other components if needed
  };
}