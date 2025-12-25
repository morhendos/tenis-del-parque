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
    valueProps: 'Sistema Swiss • Puntos ELO • 4 Temporadas al Año • OpenRank',
    ctaPrimary: 'Unirme a la Liga',
    ctaSecondary: 'Instalar App Gratis',
    installedButton: 'App Instalada',
    iosInstructions: 'Toca compartir y "Añadir a inicio"',
    learnMore: '¿Cómo funciona?',
    features: ['Dashboard', 'Rankings', 'Resultados']
  },
  en: {
    headline: 'Your League in Your Pocket',
    valueProps: 'Swiss System • ELO Points • 4 Seasons per Year • OpenRank',
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
      
      <div className="container mx-auto px-4 relative z-10 py-8 sm:py-12">
        
        {/* ===== MOBILE LAYOUT ===== */}
        <div className="lg:hidden text-center pt-8 sm:pt-10">
          {/* Logo - BIGGER + more top space */}
          <div className="mb-3 flex justify-center animate-fadeInUp">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56">
              <Image
                src="/logo-liga-costa-del-sol-big.webp"
                alt="Tenis del Parque"
                fill
                className="object-contain drop-shadow-xl"
                priority
                sizes="(max-width: 640px) 192px, 224px"
              />
            </div>
          </div>
          
          {/* Headline - app focused */}
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 animate-fadeInUp animation-delay-200">
            {t.headline}
          </h1>
          
          {/* Value props - one line */}
          <p className="text-gray-500 text-[10px] sm:text-xs mb-3 px-2 animate-fadeInUp animation-delay-400">
            {t.valueProps}
          </p>
          
          {/* Phone Carousel + Label */}
          <div className="relative mx-auto w-[280px] sm:w-[320px] animate-fadeInUp animation-delay-600">
            {/* Glow behind phones */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] bg-parque-purple/15 rounded-full blur-3xl" />
            
            {/* Carousel container */}
            <div 
              className="relative h-[220px] sm:h-[260px] cursor-pointer"
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
                          ? '-translate-x-[85%] translate-y-3 -rotate-12 scale-[0.8] z-10 opacity-50'
                          : '-translate-x-[15%] translate-y-3 rotate-12 scale-[0.8] z-10 opacity-50'
                      }`}
                  >
                    <div className="relative w-[85px] sm:w-[105px]">
                      <div className="relative bg-gray-900 rounded-[0.875rem] sm:rounded-[1rem] p-[2px] shadow-xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-1.5 sm:h-2 bg-gray-900 rounded-b-md z-10" />
                        <div className="relative bg-white rounded-[0.75rem] sm:rounded-[0.875rem] overflow-hidden aspect-[9/19.5]">
                          <Image
                            src={src}
                            alt={t.features[idx]}
                            fill
                            className="object-cover object-top"
                            sizes="105px"
                          />
                        </div>
                        <div className="absolute bottom-[1px] left-1/2 -translate-x-1/2 w-5 sm:w-6 h-[1.5px] bg-gray-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Feature label - TIGHT to phones, more space below */}
            <p className="text-xs font-semibold text-parque-purple -mt-4 mb-5">
              {t.features[activeIndex]}
            </p>
          </div>
          
          {/* CTAs */}
          <div className="space-y-2.5 px-6 animate-fadeInUp animation-delay-800">
            {/* Primary CTA */}
            <a
              href="#cities"
              onClick={scrollToLeagues}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-parque-purple/25 active:scale-[0.98] transition-transform"
            >
              {t.ctaPrimary}
              <Icons.ArrowRight className="w-4 h-4" />
            </a>
            
            {/* Secondary CTA - Install */}
            <div className="relative">
              {showIOSHint && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl shadow-xl z-10 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Icons.Share className="w-4 h-4" />
                    <span>{t.iosInstructions}</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              )}
              
              <button
                onClick={handleInstallClick}
                disabled={isInstalled}
                className={`flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
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
          
          {/* Learn more link */}
          <button
            onClick={scrollToHowItWorks}
            className="mt-4 text-xs text-parque-purple font-medium animate-fadeInUp animation-delay-1000"
          >
            <span className="border-b border-parque-purple/30">{t.learnMore}</span>
          </button>
          
          {/* Scroll indicator */}
          <div className="mt-3 flex justify-center animate-fadeInUp animation-delay-1200">
            <button onClick={scrollToLeagues} className="p-2 animate-bounce">
              <Icons.ChevronDown className="w-5 h-5 text-parque-purple/50" />
            </button>
          </div>
        </div>
        
        {/* ===== DESKTOP LAYOUT ===== */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center max-w-6xl mx-auto">
          {/* Left: Copy + CTAs */}
          <div className="text-left">
            {/* Logo */}
            <div className="mb-6 animate-fadeInUp">
              <div className="relative w-36 h-36 xl:w-44 xl:h-44">
                <Image
                  src="/logo-liga-costa-del-sol-big.webp"
                  alt="Tenis del Parque"
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                  sizes="176px"
                />
              </div>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900 mb-4 animate-fadeInUp animation-delay-200 leading-tight">
              {t.headline}
            </h1>
            
            {/* Value props */}
            <p className="text-gray-500 text-sm xl:text-base mb-8 animate-fadeInUp animation-delay-400">
              {t.valueProps}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-fadeInUp animation-delay-600">
              {/* Primary CTA */}
              <a
                href="#cities"
                onClick={scrollToLeagues}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-parque-purple/25 hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                {t.ctaPrimary}
                <Icons.ArrowRight className="w-5 h-5" />
              </a>
              
              {/* Secondary CTA - Install */}
              <div className="relative">
                {showIOSHint && (
                  <div className="absolute bottom-full left-0 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl shadow-xl z-10">
                    <div className="flex items-center gap-2">
                      <Icons.Share className="w-4 h-4" />
                      <span>{t.iosInstructions}</span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalled}
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                    isInstalled
                      ? 'bg-parque-green text-white'
                      : 'bg-white text-gray-900 border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300'
                  }`}
                >
                  {isInstalled ? (
                    <>
                      <Icons.Check className="w-5 h-5" />
                      {t.installedButton}
                    </>
                  ) : (
                    <>
                      <Icons.Download className="w-5 h-5" />
                      {t.ctaSecondary}
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Learn more */}
            <button
              onClick={scrollToHowItWorks}
              className="mt-8 text-parque-purple font-medium animate-fadeInUp animation-delay-800 group"
            >
              <span className="border-b-2 border-parque-purple/30 group-hover:border-parque-purple/60 transition-colors pb-1">
                {t.learnMore}
              </span>
            </button>
          </div>
          
          {/* Right: Phone Carousel */}
          <div className="relative animate-fadeInUp animation-delay-400">
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] xl:w-[350px] xl:h-[350px] bg-parque-purple/10 rounded-full blur-3xl" />
            
            <div 
              className="relative mx-auto w-[380px] h-[420px] xl:w-[420px] xl:h-[480px] cursor-pointer"
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
                    <div className="relative w-[140px] xl:w-[160px]">
                      <div className="relative bg-gray-900 rounded-[1.25rem] xl:rounded-[1.5rem] p-[3px] shadow-2xl">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 xl:w-12 h-2.5 xl:h-3 bg-gray-900 rounded-b-lg z-10" />
                        <div className="relative bg-white rounded-[1rem] xl:rounded-[1.25rem] overflow-hidden aspect-[9/19.5]">
                          <Image
                            src={src}
                            alt={t.features[idx]}
                            fill
                            className="object-cover object-top"
                            sizes="160px"
                          />
                        </div>
                        <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-8 xl:w-10 h-[2px] bg-gray-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Feature label */}
            <p className="text-center text-sm font-semibold text-parque-purple mt-2">
              {t.features[activeIndex]}
            </p>
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
      `}</style>
    </section>
  );
}
