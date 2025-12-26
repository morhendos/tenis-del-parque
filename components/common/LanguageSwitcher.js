'use client';

import { useLocale } from '@/lib/hooks/useLocale';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSwitcher({ className = '', locale: propLocale }) {
  const { locale: hookLocale, switchLocale, t } = useLocale();
  const locale = propLocale || hookLocale; // Use prop if provided, otherwise hook
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef(null);
  
  // Hydration guard
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];
  
  const currentLanguage = languages.find(lang => lang.code === locale);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    if (isClient) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isClient]);
  
  const handleLanguageChange = (langCode) => {
    if (!isClient) return;
    switchLocale(langCode);
    setIsOpen(false);
  };

  const handleToggleOpen = () => {
    if (!isClient) return;
    setIsOpen(!isOpen);
  };
  
  // Return non-interactive version until hydrated
  if (!isClient) {
    const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700">
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="text-sm font-medium w-[2ch] text-center">{currentLanguage.code.toUpperCase()}</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={handleToggleOpen}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 hover:text-gray-900"
        aria-label={t('navigation', 'switchLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="text-sm font-medium w-[2ch] text-center">{currentLanguage?.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {languages.map(language => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-200 ${
                language.code === locale ? 'bg-gray-50' : ''
              }`}
              role="menuitem"
              lang={language.code}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm font-medium text-gray-700">
                {language.name}
              </span>
              {language.code === locale && (
                <svg
                  className="w-4 h-4 text-parque-purple ml-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for mobile (simple toggle)
export function LanguageSwitcherCompact({ className = '', locale: propLocale }) {
  const { locale: hookLocale, switchLocale } = useLocale();
  const locale = propLocale || hookLocale;
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const toggleLanguage = () => {
    if (!isClient) return;
    const newLocale = locale === 'es' ? 'en' : 'es';
    switchLocale(newLocale);
  };
  
  if (!isClient) {
    return (
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${className}`}>
        <span className="text-lg">{locale === 'es' ? '🇪🇸' : '🇬🇧'}</span>
      </div>
    );
  }
  
  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${className}`}
      aria-label="Switch language"
    >
      <span className="text-lg">{locale === 'es' ? '🇪🇸' : '🇬🇧'}</span>
    </button>
  );
}

// Segmented toggle for mobile menu - shows both options, one tap to switch
export function LanguageSwitcherToggle({ className = '', locale: propLocale }) {
  const { locale: hookLocale, switchLocale } = useLocale();
  const locale = propLocale || hookLocale;
  const [isClient, setIsClient] = useState(false);
  const [tapped, setTapped] = useState(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleSwitch = (langCode) => {
    if (!isClient || langCode === locale) return;
    setTapped(langCode);
    
    // Small delay for visual feedback
    setTimeout(() => {
      switchLocale(langCode);
      setTapped(null);
    }, 150);
  };
  
  const languages = [
    { code: 'es', flag: '🇪🇸', label: 'ES' },
    { code: 'en', flag: '🇬🇧', label: 'EN' }
  ];
  
  return (
    <div className={`inline-flex rounded-xl bg-gray-100 p-1 ${className}`}>
      {languages.map((lang) => {
        const isActive = locale === lang.code;
        const isTapped = tapped === lang.code;
        
        return (
          <button
            key={lang.code}
            onClick={() => handleSwitch(lang.code)}
            disabled={!isClient}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white text-parque-purple shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            } ${isTapped ? 'scale-95' : ''}`}
            aria-label={`Switch to ${lang.label}`}
            aria-pressed={isActive}
          >
            <span className="text-base">{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}