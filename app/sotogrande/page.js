'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '../../components/common/Navigation'
import HeroSection from '../../components/home/HeroSection'
import FeaturesSection from '../../components/home/FeaturesSection'
import HowItWorksSection from '../../components/home/HowItWorksSection'
import LevelsSection from '../../components/home/LevelsSection'
import PlatformPreviewSection from '../../components/home/PlatformPreviewSection'
import TestimonialsSection from '../../components/home/TestimonialsSection'
import FAQSection from '../../components/home/FAQSection'
import Footer from '../../components/common/Footer'
import { useLanguage } from '../../lib/hooks/useLanguage'
import { homeContent } from '../../lib/content/homeContent'
import { mockData } from '../../lib/data/mockData'

// Simple, consistent section divider with larger tennis ball
function SectionDivider() {
  return (
    <div className="relative h-px my-20">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <div className="absolute left-1/2 -translate-x-1/2 -top-4">
        <div className="w-8 h-8 tennis-ball"></div>
      </div>
    </div>
  )
}

// Beautiful Registration Banner Component
function RegistrationBanner({ language }) {
  return (
    <div className="bg-gradient-to-r from-parque-purple via-purple-600 to-indigo-600 text-white py-3 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/5"></div>
      <div className="absolute inset-0">
        <div className="absolute -inset-40 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>
      <div className="container mx-auto text-center relative z-10">
        <div className="flex items-center justify-center space-x-3 font-medium text-sm md:text-base">
          <span className="text-xl">🎾</span>
          <span>
            {language === 'es' 
              ? 'Las inscripciones cierran hoy lunes a las 23:00 - ¡Reserva tu plaza!'
              : 'Registration closes today Monday at 23:00 - Reserve your spot!'
            }
          </span>
          <span className="text-xl">✨</span>
        </div>
      </div>
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

// New CTA Section Component
function CTASection({ content, language, onSignupClick }) {
  return (
    <section id="signup" className="py-24 md:py-32 relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-8">
            {content.title}
          </h2>
          <p className="text-lg text-gray-600 mb-12 font-light leading-relaxed">
            {content.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onSignupClick}
              className="px-8 py-4 bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white rounded-2xl font-medium text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
            >
              <span className="flex items-center justify-center">
                {language === 'es' ? 'Inscríbete ahora' : 'Sign up now'}
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            <a
              href="#features"
              className="px-8 py-4 border-2 border-parque-purple text-parque-purple rounded-2xl font-medium text-lg hover:bg-parque-purple/10 transition-all duration-300"
            >
              {language === 'es' ? 'Descubre más' : 'Learn more'}
            </a>
          </div>
          
          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-parque-purple/10 border border-parque-purple/20 rounded-full text-sm">
            <span className="w-2 h-2 bg-parque-purple rounded-full animate-pulse"></span>
            <span className="text-parque-purple font-medium">
              {language === 'es' 
                ? 'Inscripciones cierran hoy lunes 23:00' 
                : 'Registration closes today Monday 23:00'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function SotograndePage() {
  const { language, setLanguage, isLanguageLoaded } = useLanguage()
  const [scrollY, setScrollY] = useState(0)
  const router = useRouter()

  const t = homeContent[language]

  // Handle parallax scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignupClick = () => {
    // Navigate to Sotogrande league signup page
    router.push('/signup/sotogrande')
  }

  // Show loading state until language is resolved to prevent hydration flicker
  if (!isLanguageLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 tennis-ball mb-4 animate-bounce mx-auto"></div>
          <div className="text-parque-purple/60 text-lg font-light">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white relative overflow-x-hidden">
      {/* Tennis-themed parallax background layers */}
      
      {/* Layer 1: Tennis court lines - far background */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0 opacity-20"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
          height: '200vh',
        }}
      >
        <div className="w-full h-full tennis-court-pattern" />
      </div>
      
      {/* Layer 2: Tennis ball pattern - mid background */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0 opacity-30"
        style={{
          transform: `translateY(${scrollY * 0.4}px)`,
          height: '150vh',
        }}
      >
        <div className="w-full h-full tennis-ball-pattern" />
      </div>
      
      {/* Layer 3: Subtle gradient orbs for depth */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{
          transform: `translateY(${scrollY * 0.6}px)`,
          height: '130vh',
        }}
      >
        <div className="absolute top-[10%] left-[10%] w-96 h-96 opacity-15">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-parque-purple to-transparent blur-3xl" />
        </div>
        <div className="absolute top-[40%] right-[15%] w-[500px] h-[500px] opacity-15">
          <div className="w-full h-full rounded-full bg-gradient-to-tl from-parque-green to-transparent blur-3xl" />
        </div>
        <div className="absolute top-[70%] left-[20%] w-[600px] h-[600px] opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-parque-yellow/50 to-transparent blur-3xl" />
        </div>
      </div>
      
      {/* Navigation with high z-index */}
      <Navigation 
        currentPage="home" 
        language={language} 
        onLanguageChange={setLanguage} 
      />
      
      {/* Beautiful Registration Banner */}
      <div className="relative z-30 mt-16">
        <RegistrationBanner language={language} />
      </div>
      
      {/* Main content with proper z-index (lower than navigation) */}
      <div className="relative z-10">
        <HeroSection content={t.hero} />
      </div>
      
      {/* Rest of content with alternating backgrounds */}
      <div className="relative z-20">
        {/* Features Section - White background */}
        <div id="features" className="bg-white scroll-mt-20">
          <FeaturesSection content={t.features} />
        </div>
        
        <SectionDivider />
        
        {/* How It Works - Light gradient with tennis net pattern */}
        <div id="how-it-works" className="bg-gradient-to-br from-gray-50 to-parque-bg/20 relative overflow-hidden scroll-mt-20">
          <div className="absolute inset-0 tennis-net-mesh opacity-10"></div>
          <HowItWorksSection content={t.howItWorks} />
        </div>
        
        <SectionDivider />
        
        {/* Levels Section - White with sport stripes */}
        <div id="levels" className="bg-white relative overflow-hidden scroll-mt-20">
          <div className="absolute inset-0 sport-stripes-pattern opacity-10"></div>
          <LevelsSection content={t.levels} />
        </div>
        
        <SectionDivider />
        
        {/* Platform Preview - Gradient with racquet strings */}
        <div id="platform" className="bg-gradient-to-bl from-parque-purple/5 to-parque-green/5 relative overflow-hidden scroll-mt-20">
          <div className="absolute inset-0 racquet-strings-pattern opacity-15"></div>
          <PlatformPreviewSection 
            content={t.platformPreview} 
            mockData={mockData} 
            language={language} 
          />
        </div>
        
        <SectionDivider />
        
        {/* Testimonials - White background */}
        <div id="testimonials" className="bg-white scroll-mt-20">
          <TestimonialsSection content={t.testimonials} language={language} />
        </div>
        
        <SectionDivider />
        
        {/* FAQ - Light background with subtle tennis court pattern */}
        <div id="faq" className="bg-gray-50 relative overflow-hidden scroll-mt-20">
          <div className="absolute inset-0 tennis-court-pattern opacity-5"></div>
          <FAQSection content={t.faq} />
        </div>
        
        {/* CTA Section - Gradient background with tennis ball pattern */}
        <div className="bg-gradient-to-br from-parque-purple/10 via-parque-green/5 to-parque-yellow/10 relative overflow-hidden">
          <div className="absolute inset-0 tennis-ball-pattern opacity-10"></div>
          <CTASection 
            content={t.signup} 
            language={language}
            onSignupClick={handleSignupClick}
          />
        </div>
        
        <Footer content={t.footer} />
      </div>

      {/* Keep animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
          animation-fill-mode: both;
        }
        
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        
        .delay-1000 { animation-delay: 1000ms; }
        .delay-2000 { animation-delay: 2000ms; }
      `}</style>
    </main>
  )
} 