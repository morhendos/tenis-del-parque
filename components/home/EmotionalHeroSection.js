'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Icons
const Icons = {
  Download: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Share: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16 6 12 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ArrowRight: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ChevronDown: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

const content = {
  es: {
    headline: 'Tu Liga en Tu Móvil',
    valueProps: 'Sistema Swiss • Puntos ELO • 4 Temporadas • 3 Niveles • OpenRank',
    ctaPrimary: 'Unirme a la Liga',
    ctaSecondary: 'Instalar App Gratis',
    installedButton: 'App Instalada',
    iosInstructions: 'Toca compartir y "Añadir a inicio"',
    learnMore: '¿Cómo funciona?',
    features: ['Dashboard', 'Rankings', 'Resultados']
  },
  en: {
    headline: 'Your League in Your Pocket',
    valueProps: 'Swiss System • ELO Points • 4 Seasons • 3 Levels • OpenRank',
    ctaPrimary: 'Join the League',
    ctaSecondary: 'Install Free App',
    installedButton: 'App Installed',
    iosInstructions: 'Tap share and "Add to Home Screen"',
    learnMore: 'How does it work?',
    features: ['Dashboard', 'Rankings', 'Results']
  }
};

export default function EmotionalHeroSection({ locale = 'es' }) {
  const t = content[locale] || content.es;
  const [activeIndex, setActiveIndex] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  
  const screenshots = [
    '/screenshots/dashboard-mobile.png',
    '/screenshots/openrank-mobile.png',
    '/screenshots/victory-mobile.png'
  ];
  
  // Get position for each phone
  const getPosition = (idx) => {
    const diff = idx - activeIndex;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -2) return 'right';
    return 'left';
  };
  
  // PWA install setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  
  // Handle install click
  const handleInstallClick = async () => {
    if (isInstalled) return;
    
    if (isIOS) {
      setShowIOSHint(true);
      setTimeout(() => setShowIOSHint(false), 4000);
      return;
    }
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };
  
  const scrollToLeagues = (e) => {
    e.preventDefault();
    const leaguesSection = document.getElementById('cities');
    if (leaguesSection) {
      leaguesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50" />
        
        {/* Gradient orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-parque-purple/15 via-parque-purple/10 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-gradient-to-tl from-parque-green/15 via-parque-green/10 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-gradient-to-r from-parque-yellow/10 to-orange-200/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 mobile-container">
        
        {/* ===== MOBILE LAYOUT ===== */}
        <div className="lg:hidden text-center mobile-hero">
          {/* Logo */}
          <div className="mobile-logo-wrap flex justify-center animate-fadeInUp">
            <div className="relative mobile-logo">
              <Image
                src="/logo-liga-costa-del-sol-big.webp"
                alt="Tenis del Parque"
                fill
                className="object-contain drop-shadow-xl"
                priority
                sizes="(max-width: 640px) 160px, 224px"
              />
            </div>
          </div>
          
          {/* Headline */}
          <h1 className="mobile-headline font-bold text-gray-900 animate-fadeInUp animation-delay-200">
            {t.headline}
          </h1>
          
          {/* Value props */}
          <p className="text-gray-500 mobile-value-props px-2 animate-fadeInUp animation-delay-400">
            {t.valueProps}
          </p>
          
          {/* Phone Carousel + Label */}
          <div className="relative mx-auto mobile-carousel-container animate-fadeInUp animation-delay-600">
            {/* Glow behind phones */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] mobile-glow bg-parque-purple/15 rounded-full blur-3xl" />
            
            {/* Carousel container */}
            <div 
              className="relative mobile-carousel cursor-pointer"
              onClick={() => setActiveIndex((prev) => (prev + 1) % 3)}
            >
              {screenshots.map((src, idx) => {
                const position = getPosition(idx);
                return (
                  <div
                    key={idx}
                    className={`absolute top-0 left-1/2 transition-all duration-500 ease-out
                      ${position === 'center' 
                        ? '-translate-x-1/2 translate-y-0 rotate-0 scale-100 z-20 opacity-100' 
                        : position === 'left'
                          ? '-translate-x-[85%] translate-y-2 -rotate-12 scale-[0.8] z-10 opacity-50'
                          : '-translate-x-[15%] translate-y-2 rotate-12 scale-[0.8] z-10 opacity-50'
                      }`}
                  >
                    <div className="relative mobile-phone">
                      <div className="relative bg-gray-900 mobile-phone-frame p-[2px] shadow-xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 mobile-notch bg-gray-900 rounded-b-md z-10" />
                        <div className="relative bg-white mobile-phone-screen overflow-hidden aspect-[9/19.5]">
                          <Image
                            src={src}
                            alt={t.features[idx]}
                            fill
                            className="object-cover object-top"
                            sizes="90px"
                          />
                        </div>
                        <div className="absolute bottom-[1px] left-1/2 -translate-x-1/2 mobile-home-bar bg-gray-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Feature label */}
            <p className="mobile-feature-label font-semibold text-parque-purple">
              {t.features[activeIndex]}
            </p>
          </div>
          
          {/* CTAs */}
          <div className="mobile-cta-container px-6 animate-fadeInUp animation-delay-800">
            <a
              href="#cities"
              onClick={scrollToLeagues}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white mobile-cta rounded-xl font-semibold shadow-lg shadow-parque-purple/25 active:scale-[0.98] transition-transform"
            >
              {t.ctaPrimary}
              <Icons.ArrowRight className="w-4 h-4" />
            </a>
            
            <div className="relative">
              {showIOSHint && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Icons.Share className="w-3 h-3" />
                    <span>{t.iosInstructions}</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              )}
              
              <button
                onClick={handleInstallClick}
                disabled={isInstalled}
                className={`flex items-center justify-center gap-2 w-full mobile-cta rounded-xl font-semibold transition-all ${
                  isInstalled
                    ? 'bg-parque-green text-white'
                    : 'bg-white text-gray-900 border-2 border-gray-200 shadow-sm active:scale-[0.98]'
                }`}
              >
                {isInstalled ? (
                  <>
                    <Icons.Check className="w-4 h-4" />
                    {t.installedButton}
                  </>
                ) : (
                  <>
                    <Icons.Download className="w-4 h-4" />
                    {t.ctaSecondary}
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Learn more + Scroll */}
          <div className="mobile-footer animate-fadeInUp animation-delay-1000">
            <button
              onClick={scrollToHowItWorks}
              className="text-xs text-parque-purple font-medium"
            >
              <span className="border-b border-parque-purple/30">{t.learnMore}</span>
            </button>
            
            <button onClick={scrollToLeagues} className="p-1 animate-bounce">
              <Icons.ChevronDown className="w-4 h-4 text-parque-purple/50" />
            </button>
          </div>
        </div>
        
        {/* ===== DESKTOP LAYOUT ===== */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-12 2xl:gap-16 lg:items-center max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] mx-auto">
          {/* Left: Logo + Copy + CTAs - ALL CENTERED */}
          <div className="text-center">
            {/* Logo - HUGE and CENTERED - scales up on large screens */}
            <div className="mb-3 2xl:mb-4 flex justify-center animate-fadeInUp">
              <div className="relative w-72 h-72 xl:w-96 xl:h-96 2xl:w-[30rem] 2xl:h-[30rem]">
                <Image
                  src="/logo-liga-costa-del-sol-big.webp"
                  alt="Tenis del Parque"
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                  sizes="480px"
                />
              </div>
            </div>
            
            {/* Headline - centered under logo */}
            <h1 className="text-xl xl:text-2xl 2xl:text-4xl font-bold text-gray-900 mb-2 2xl:mb-3 animate-fadeInUp animation-delay-200 leading-tight">
              {t.headline}
            </h1>
            
            {/* Value props */}
            <p className="text-gray-500 text-xs xl:text-sm 2xl:text-base mb-5 2xl:mb-6 animate-fadeInUp animation-delay-400">
              {t.valueProps}
            </p>
            
            {/* CTAs - centered */}
            <div className="flex flex-wrap gap-3 2xl:gap-4 justify-center animate-fadeInUp animation-delay-600">
              <a
                href="#cities"
                onClick={scrollToLeagues}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white px-5 py-2.5 2xl:px-7 2xl:py-3.5 rounded-xl font-semibold text-sm 2xl:text-base shadow-lg shadow-parque-purple/25 hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                {t.ctaPrimary}
                <Icons.ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5" />
              </a>
              
              <div className="relative">
                {showIOSHint && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl shadow-xl z-10">
                    <div className="flex items-center gap-2">
                      <Icons.Share className="w-4 h-4" />
                      <span>{t.iosInstructions}</span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalled}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 2xl:px-7 2xl:py-3.5 rounded-xl font-semibold text-sm 2xl:text-base transition-all ${
                    isInstalled
                      ? 'bg-parque-green text-white'
                      : 'bg-white text-gray-900 border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300'
                  }`}
                >
                  {isInstalled ? (
                    <>
                      <Icons.Check className="w-4 h-4 2xl:w-5 2xl:h-5" />
                      {t.installedButton}
                    </>
                  ) : (
                    <>
                      <Icons.Download className="w-4 h-4 2xl:w-5 2xl:h-5" />
                      {t.ctaSecondary}
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Learn more */}
            <button
              onClick={scrollToHowItWorks}
              className="mt-5 2xl:mt-6 text-sm 2xl:text-base text-parque-purple font-medium animate-fadeInUp animation-delay-800 group"
            >
              <span className="border-b-2 border-parque-purple/30 group-hover:border-parque-purple/60 transition-colors pb-1">
                {t.learnMore}
              </span>
            </button>
          </div>
          
          {/* Right: Phone Carousel */}
          <div className="relative animate-fadeInUp animation-delay-400">
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] xl:w-[400px] xl:h-[400px] 2xl:w-[500px] 2xl:h-[500px] bg-parque-purple/10 rounded-full blur-3xl" />
            
            <div 
              className="relative mx-auto w-[420px] h-[440px] xl:w-[480px] xl:h-[500px] 2xl:w-[580px] 2xl:h-[600px] cursor-pointer"
              onClick={() => setActiveIndex((prev) => (prev + 1) % 3)}
            >
              {screenshots.map((src, idx) => {
                const position = getPosition(idx);
                return (
                  <div
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                    className={`absolute top-0 left-1/2 transition-all duration-500 ease-out cursor-pointer
                      ${position === 'center' 
                        ? '-translate-x-1/2 translate-y-0 rotate-0 scale-100 z-20 opacity-100' 
                        : position === 'left'
                          ? '-translate-x-[85%] translate-y-6 -rotate-12 scale-[0.8] z-10 opacity-60 hover:opacity-75'
                          : '-translate-x-[15%] translate-y-6 rotate-12 scale-[0.8] z-10 opacity-60 hover:opacity-75'
                      }`}
                  >
                    <div className="relative w-[160px] xl:w-[185px] 2xl:w-[220px]">
                      <div className="relative bg-gray-900 rounded-[1.5rem] xl:rounded-[1.75rem] 2xl:rounded-[2rem] p-[3px] shadow-2xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 xl:w-14 2xl:w-16 h-3 xl:h-3.5 2xl:h-4 bg-gray-900 rounded-b-lg z-10" />
                        <div className="relative bg-white rounded-[1.25rem] xl:rounded-[1.5rem] 2xl:rounded-[1.75rem] overflow-hidden aspect-[9/19.5]">
                          <Image
                            src={src}
                            alt={t.features[idx]}
                            fill
                            className="object-cover object-top"
                            sizes="220px"
                          />
                        </div>
                        <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-10 xl:w-12 2xl:w-14 h-[2px] bg-gray-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Feature toggle buttons - tight to carousel */}
            <div className="flex justify-center gap-2 2xl:gap-3 -mt-6 2xl:-mt-4">
              {[
                { icon: (
                  <svg className="w-4 h-4 2xl:w-5 2xl:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ), label: t.features[0] },
                { icon: (
                  <svg className="w-4 h-4 2xl:w-5 2xl:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20V10M18 20V4M6 20v-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ), label: t.features[1] },
                { icon: (
                  <svg className="w-4 h-4 2xl:w-5 2xl:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.2L12 14l-4.8 2.5.9-5.2-3.8-3.7 5.3-.8L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ), label: t.features[2] }
              ].map((feature, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                  className={`flex items-center gap-1.5 2xl:gap-2 px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-full text-xs 2xl:text-sm font-medium transition-all ${
                    activeIndex === idx
                      ? 'bg-parque-purple text-white shadow-md'
                      : 'bg-white/80 text-gray-600 hover:bg-white hover:text-parque-purple border border-gray-200'
                  }`}
                >
                  {feature.icon}
                  {feature.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob { animation: blob 20s infinite ease-in-out; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }
        
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1200 { animation-delay: 1200ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }
        .animation-delay-4000 { animation-delay: 4000ms; }
        
        /* ===== HEIGHT-RESPONSIVE MOBILE LAYOUT ===== */
        /* Priority: 1) Top padding (ALWAYS navbar height) 2) Logo stays BIG 3) Shrink carousel/CTAs */
        /* CTAs: min-height controls size, font scales proportionally with button */
        
        /* Default (tall screens 920px+) */
        .mobile-container { padding-top: 2rem; padding-bottom: 3rem; }
        .mobile-hero { padding-top: 4rem; }
        .mobile-logo-wrap { margin-bottom: 0; }
        .mobile-logo { width: 19rem; height: 19rem; }
        .mobile-headline { font-size: 1.25rem; margin-bottom: 0.375rem; }
        .mobile-value-props { font-size: 0.875rem; margin-bottom: 0.75rem; }
        .mobile-carousel-container { width: 320px; }
        .mobile-carousel { height: 260px; }
        .mobile-phone { width: 105px; }
        .mobile-phone-frame { border-radius: 1rem; }
        .mobile-phone-screen { border-radius: 0.875rem; }
        .mobile-notch { width: 2rem; height: 0.5rem; }
        .mobile-home-bar { width: 1.5rem; height: 1.5px; }
        .mobile-glow { width: 200px; height: 200px; }
        .mobile-feature-label { font-size: 0.75rem; margin-top: -1rem; margin-bottom: 1.75rem; }
        .mobile-cta-container { display: flex; flex-direction: column; gap: 0.5rem; }
        .mobile-cta { min-height: 48px !important; font-size: 0.875rem !important; }
        .mobile-footer { margin-top: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; }
        .mobile-footer button { display: flex; align-items: center; justify-content: center; margin: 0 auto; }
        
        /* Medium-tall screens (900-999px) */
        @media (max-height: 999px) {
          .mobile-container { padding-top: 1.5rem; padding-bottom: 2rem; }
          .mobile-hero { padding-top: 4rem; }
          .mobile-logo-wrap { margin-bottom: 0; }
          .mobile-logo { width: 19rem; height: 19rem; }
          .mobile-headline { font-size: 1.125rem; margin-bottom: 0.25rem; }
          .mobile-value-props { font-size: 0.8125rem; margin-bottom: 0.5rem; }
          .mobile-carousel-container { width: 300px; }
          .mobile-carousel { height: 230px; }
          .mobile-phone { width: 90px; }
          .mobile-phone-frame { border-radius: 0.875rem; }
          .mobile-phone-screen { border-radius: 0.75rem; }
          .mobile-notch { width: 1.5rem; height: 0.375rem; }
          .mobile-home-bar { width: 1.25rem; height: 1.5px; }
          .mobile-glow { width: 170px; height: 170px; }
          .mobile-feature-label { font-size: 0.625rem; margin-top: -0.625rem; margin-bottom: 1.5rem; }
          .mobile-cta-container { gap: 0.375rem; }
          .mobile-cta { min-height: 44px !important; font-size: 0.8125rem !important; }
          .mobile-footer { margin-top: 0.5rem; gap: 0.25rem; }
        }
        
        /* Medium screens (820-899px) */
        @media (max-height: 899px) {
          .mobile-container { padding-top: 1rem; padding-bottom: 1.5rem; }
          .mobile-hero { padding-top: 4rem; }
          .mobile-logo-wrap { margin-bottom: 0; }
          .mobile-logo { width: 18rem; height: 18rem; }
          .mobile-headline { font-size: 1rem; margin-bottom: 0.125rem; }
          .mobile-value-props { font-size: 0.75rem; margin-bottom: 0.375rem; }
          .mobile-carousel-container { width: 270px; }
          .mobile-carousel { height: 200px; }
          .mobile-phone { width: 78px; }
          .mobile-phone-frame { border-radius: 0.75rem; }
          .mobile-phone-screen { border-radius: 0.625rem; }
          .mobile-notch { width: 1.25rem; height: 0.25rem; }
          .mobile-home-bar { width: 1rem; height: 1px; }
          .mobile-glow { width: 150px; height: 150px; }
          .mobile-feature-label { font-size: 0.5625rem; margin-top: -0.5rem; margin-bottom: 1.25rem; }
          .mobile-cta-container { gap: 0.3rem; }
          .mobile-cta { min-height: 40px !important; font-size: 0.75rem !important; }
          .mobile-footer { margin-top: 0.375rem; gap: 0.125rem; }
        }
        
        /* Short screens (740-819px) - iPhone SE territory */
        @media (max-height: 819px) {
          .mobile-container { padding-top: 0.75rem; padding-bottom: 1rem; }
          .mobile-hero { padding-top: 3.5rem; }
          .mobile-logo-wrap { margin-bottom: 0; }
          .mobile-logo { width: 16rem; height: 16rem; }
          .mobile-headline { font-size: 0.9375rem; margin-bottom: 0.125rem; }
          .mobile-value-props { font-size: 0.6875rem; margin-bottom: 0.25rem; }
          .mobile-carousel-container { width: 240px; }
          .mobile-carousel { height: 180px; }
          .mobile-phone { width: 70px; }
          .mobile-phone-frame { border-radius: 0.625rem; }
          .mobile-phone-screen { border-radius: 0.5rem; }
          .mobile-notch { width: 1rem; height: 0.1875rem; }
          .mobile-home-bar { width: 0.75rem; height: 1px; }
          .mobile-glow { width: 130px; height: 130px; }
          .mobile-feature-label { font-size: 0.5rem; margin-top: -0.375rem; margin-bottom: 1rem; }
          .mobile-cta-container { gap: 0.25rem; }
          .mobile-cta { min-height: 36px !important; font-size: 0.6875rem !important; }
          .mobile-footer { margin-top: 0.25rem; gap: 0; }
        }
        
        /* Very short screens (<740px) */
        @media (max-height: 739px) {
          .mobile-container { padding-top: 0.5rem; padding-bottom: 0.75rem; }
          .mobile-hero { padding-top: 3rem; }
          .mobile-logo-wrap { margin-bottom: 0; }
          .mobile-logo { width: 15rem; height: 15rem; }
          .mobile-headline { font-size: 0.875rem; margin-bottom: 0.0625rem; }
          .mobile-value-props { font-size: 0.625rem; margin-bottom: 0.125rem; }
          .mobile-carousel-container { width: 210px; }
          .mobile-carousel { height: 155px; }
          .mobile-phone { width: 60px; }
          .mobile-phone-frame { border-radius: 0.5rem; }
          .mobile-phone-screen { border-radius: 0.375rem; }
          .mobile-notch { width: 0.75rem; height: 0.125rem; }
          .mobile-home-bar { width: 0.5rem; height: 1px; }
          .mobile-glow { width: 110px; height: 110px; }
          .mobile-feature-label { font-size: 0.4375rem; margin-top: -0.25rem; margin-bottom: 0.75rem; }
          .mobile-cta-container { gap: 0.3rem; } /* slightly bigger gap */
          .mobile-cta { min-height: 32px !important; font-size: 0.625rem !important; }
          .mobile-footer { margin-top: 0.125rem; gap: 0; }
        }
      `}</style>
    </section>
  );
}
