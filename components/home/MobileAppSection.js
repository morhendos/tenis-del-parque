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
  Smartphone: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" strokeLinecap="round" />
    </svg>
  ),
  ChartUp: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 9l-5 5-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Trophy: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
};

// Content translations
const content = {
  es: {
    title: 'Todo en Tu Móvil',
    subtitle: 'Gestiona tu liga desde cualquier lugar',
    installButton: 'Instalar App Gratis',
    installedButton: 'App Instalada',
    iosInstructions: 'Toca compartir y "Añadir a inicio"',
    features: [
      { name: 'Dashboard', desc: 'Tu centro de mando personal' },
      { name: 'Rankings', desc: 'Posición en tiempo real' },
      { name: 'Resultados', desc: 'Registra victorias al instante' }
    ]
  },
  en: {
    title: 'Everything on Your Phone',
    subtitle: 'Manage your league from anywhere',
    installButton: 'Install Free App',
    installedButton: 'App Installed',
    iosInstructions: 'Tap share and "Add to Home Screen"',
    features: [
      { name: 'Dashboard', desc: 'Your personal command center' },
      { name: 'Rankings', desc: 'Real-time position' },
      { name: 'Results', desc: 'Record victories instantly' }
    ]
  }
};

export default function MobileAppSection({ locale = 'es' }) {
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
  
  const featureIcons = [Icons.Smartphone, Icons.ChartUp, Icons.Trophy];
  
  // Get position for each phone based on active index
  const getPosition = (idx) => {
    const diff = idx - activeIndex;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -2) return 'right';
    return 'left';
  };
  
  // Check if already installed and setup install prompt
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
  
  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  
  // Handle install button click
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
  
  return (
    <section className="relative py-10 sm:py-14 lg:py-20 px-4 overflow-hidden">
      {/* Background with animated gradient orbs */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50" />
        
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-parque-purple/5 via-transparent to-parque-green/5" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-parque-yellow/5 via-transparent to-parque-purple/5" />
        </div>
        
        {/* Large animated gradient orbs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-parque-purple/20 via-parque-purple/10 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] bg-gradient-to-tl from-parque-green/20 via-parque-green/10 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-parque-yellow/15 to-orange-200/15 rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] bg-gradient-to-tr from-violet-300/10 to-pink-200/10 rounded-full blur-3xl animate-blob animation-delay-3000" />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-10">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            {t.title}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">{t.subtitle}</p>
        </div>
        
        {/* Main content - 2 column on desktop */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          
          {/* Left column on desktop: Features + CTA */}
          <div className="hidden lg:block space-y-6">
            {/* Feature cards */}
            <div className="space-y-3">
              {t.features.map((feature, idx) => {
                const Icon = featureIcons[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 backdrop-blur-sm ${
                      activeIndex === idx
                        ? 'bg-parque-purple text-white shadow-lg shadow-parque-purple/25 scale-[1.02]'
                        : 'bg-white/80 text-gray-700 shadow-md hover:shadow-lg border border-white/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activeIndex === idx ? 'bg-white/20' : 'bg-parque-purple/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${activeIndex === idx ? 'text-white' : 'text-parque-purple'}`} />
                    </div>
                    <div>
                      <div className="font-semibold">{feature.name}</div>
                      <div className={`text-sm ${activeIndex === idx ? 'text-white/80' : 'text-gray-500'}`}>
                        {feature.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Install CTA - Desktop */}
            <div className="relative pt-2">
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
                className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                  isInstalled
                    ? 'bg-parque-green text-white cursor-default'
                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/25 hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {isInstalled ? (
                  <>
                    <Icons.Check className="w-6 h-6" />
                    {t.installedButton}
                  </>
                ) : (
                  <>
                    <Icons.Download className="w-6 h-6" />
                    {t.installButton}
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Phone Carousel */}
          <div className="relative">
            {/* Subtle glow behind phones */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] lg:w-[300px] lg:h-[300px] bg-parque-purple/10 rounded-full blur-3xl" />
            
            <div 
              className="relative mx-auto cursor-pointer w-[280px] h-[280px] sm:w-[340px] sm:h-[360px] lg:w-[400px] lg:h-[440px]"
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
                          ? '-translate-x-[85%] translate-y-4 sm:translate-y-6 -rotate-12 scale-[0.8] z-10 opacity-60 hover:opacity-75'
                          : '-translate-x-[15%] translate-y-4 sm:translate-y-6 rotate-12 scale-[0.8] z-10 opacity-60 hover:opacity-75'
                      }`}
                  >
                    {/* Phone frame - responsive sizes */}
                    <div className="relative w-[100px] sm:w-[130px] lg:w-[160px]">
                      <div className="relative bg-gray-900 rounded-[1rem] sm:rounded-[1.25rem] lg:rounded-[1.5rem] p-[2px] sm:p-[3px] shadow-xl">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 sm:w-10 lg:w-12 h-2 sm:h-2.5 lg:h-3 bg-gray-900 rounded-b-lg z-10" />
                        
                        {/* Screen */}
                        <div className="relative bg-white rounded-[0.875rem] sm:rounded-[1rem] lg:rounded-[1.25rem] overflow-hidden aspect-[9/19.5]">
                          <Image
                            src={src}
                            alt={t.features[idx].name}
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 640px) 100px, (max-width: 1024px) 130px, 160px"
                          />
                        </div>
                        
                        {/* Home indicator */}
                        <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-6 sm:w-8 lg:w-10 h-[2px] bg-gray-600 rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Feature pills - Mobile only */}
          <div className="flex justify-center gap-2 mt-1 lg:hidden">
            {t.features.map((feature, idx) => {
              const Icon = featureIcons[idx];
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 backdrop-blur-sm ${
                    activeIndex === idx
                      ? 'bg-parque-purple text-white shadow-md shadow-parque-purple/25'
                      : 'bg-white/80 text-gray-600 shadow-sm border border-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${activeIndex === idx ? 'text-white' : 'text-parque-purple'}`} />
                  <span>{feature.name}</span>
                </button>
              );
            })}
          </div>
          
          {/* Install CTA - Mobile only */}
          <div className="relative mt-5 sm:mt-6 lg:hidden">
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
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                isInstalled
                  ? 'bg-parque-green text-white cursor-default'
                  : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] shadow-lg shadow-gray-900/25'
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
                  {t.installButton}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -40px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 20s infinite ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
