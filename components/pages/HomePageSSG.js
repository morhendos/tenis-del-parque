'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import EmotionalHeroSection from '@/components/home/EmotionalHeroSection';
import HowItWorksShowcase from '@/components/home/HowItWorksShowcase';
import FAQSection from '@/components/home/FAQSection';
import SeasonLevelSelector from '@/components/leagues/SeasonLevelSelector';
import LeagueCard from '@/components/league/LeagueCard';
import { i18n } from '@/lib/i18n/config';
import { multiLeagueHomeContent } from '@/lib/content/multiLeagueHomeContent';
import { homeContent } from '@/lib/content/homeContent';

// Feature Card Component
function FeatureCard({ feature }) {
  const iconMap = {
    calendar: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    chart: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    users: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    phone: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="text-parque-purple mb-4">
        {iconMap[feature.icon]}
      </div>
      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
      <p className="text-gray-600">{feature.description}</p>
    </div>
  );
}

// Helper to generate a unique season key
function getSeasonKey(league) {
  const citySlug = league.city?.slug || 'unknown'
  return `${citySlug}-${league.season?.type || 'unknown'}-${league.season?.year || 'unknown'}`
}

// Group leagues by city + season
function groupLeaguesBySeason(leagues) {
  const groups = {}
  
  leagues.forEach(league => {
    const key = getSeasonKey(league)
    if (!groups[key]) {
      groups[key] = {
        citySlug: league.city?.slug,
        seasonType: league.season?.type,
        seasonYear: league.season?.year,
        leagues: []
      }
    }
    groups[key].leagues.push(league)
  })
  
  return Object.values(groups)
}

export default function HomePageSSG({ locale, leaguesData }) {
  const validLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  const [language, setLanguage] = useState(validLocale);
  
  const content = multiLeagueHomeContent[validLocale] || multiLeagueHomeContent[i18n.defaultLocale];
  const footerContent = homeContent[validLocale]?.footer || homeContent[i18n.defaultLocale]?.footer;
  
  // Use the pre-fetched data from SSG
  const { leagues, activeLeagues, registrationOpenLeagues, comingSoonLeagues, total, error } = leaguesData;
  
  // Group leagues by season for unified display
  const registrationOpenGroups = groupLeaguesBySeason(registrationOpenLeagues)
  const comingSoonGroups = groupLeaguesBySeason(comingSoonLeagues)
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-parque-bg to-white">
      <Navigation 
        currentPage="home" 
        language={language} 
        onLanguageChange={setLanguage}
        showLanguageSwitcher={true}
      />
      
      {/* 1. Hero (now includes app showcase) */}
      <EmotionalHeroSection locale={validLocale} />
      
      {/* 2. Find Your League Section */}
      <section id="cities" className="scroll-mt-16 py-12 sm:py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {content.cities.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-500">
              {content.cities.subtitle}
            </p>
          </div>
          
          {error ? (
            <div className="text-center py-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {validLocale === 'es' ? 'Error cargando ligas' : 'Error loading leagues'}
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
            </div>
          ) : leagues.length === 0 ? (
            <div className="text-center py-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🎾</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {validLocale === 'es' ? 'No hay ligas disponibles' : 'No leagues available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {validLocale === 'es' 
                  ? 'Actualmente no hay ligas en la base de datos. Estamos trabajando para agregar más.'
                  : 'There are currently no leagues in the database. We are working to add more.'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* PRIORITY 1: Registration Open Leagues */}
              {registrationOpenGroups.length > 0 && (
                <div>
                  {registrationOpenGroups.map((group, index) => {
                    const cityName = group.leagues[0]?.city?.name?.[validLocale] || group.leagues[0]?.city?.name?.es || ''
                    return (
                      <div key={`reg-${index}`} className="mb-6 last:mb-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">
                          {validLocale === 'es' 
                            ? `Liga de ${cityName}` 
                            : `${cityName} League`
                          }
                        </h3>
                        {group.leagues.length > 1 ? (
                          <SeasonLevelSelector
                            leagues={group.leagues}
                            locale={validLocale}
                            status="upcoming"
                            variant="home"
                          />
                        ) : (
                          <div className="flex justify-center">
                            <LeagueCard
                              league={group.leagues[0]}
                              content={content}
                              locale={validLocale}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              
              {/* PRIORITY 2: Coming Soon Leagues */}
              {comingSoonGroups.length > 0 && (
                <div className="pt-6">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 text-center">
                    {validLocale === 'es' ? 'Próximamente' : 'Coming Soon'}
                  </h3>
                  <div className="space-y-6">
                    {comingSoonGroups.map((group, index) => (
                      group.leagues.length > 1 ? (
                        <SeasonLevelSelector
                          key={`soon-${index}`}
                          leagues={group.leagues}
                          locale={validLocale}
                          status="upcoming"
                          variant="home"
                        />
                      ) : (
                        <div key={`soon-${index}`} className="flex justify-center">
                          <LeagueCard
                            league={group.leagues[0]}
                            content={content}
                            locale={validLocale}
                          />
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </section>
      
      {/* 3. How It Works */}
      <HowItWorksShowcase locale={validLocale} />
      
      {/* 4. Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {content.testimonials.title}
            </h2>
            <p className="text-xl text-gray-600">
              {content.testimonials.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {content.testimonials.items.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                {testimonial.highlight && (
                  <p className="text-sm font-semibold text-parque-purple mb-2">
                    &ldquo;{testimonial.highlight}&rdquo;
                  </p>
                )}
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 5. CTA Section */}
      <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gray-900" />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/20 via-transparent to-parque-green/20" />
        
        {/* Animated orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-parque-purple/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-parque-green/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        {/* Content */}
        <div className="container mx-auto text-center relative z-10">
          {/* Tennis ball accent */}
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-parque-green to-parque-green/80 shadow-lg shadow-parque-green/25">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
              <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
            </svg>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            {content.cta.title}
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto">
            {content.cta.subtitle}
          </p>
          
          <a
            href="#cities"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            {content.cta.button}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-parque-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{content.cta.guarantee}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-parque-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{content.cta.urgency}</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* 6. FAQ Section */}
      <FAQSection content={content.faq} />
      
      <Footer content={footerContent} />
    </main>
  );
}
