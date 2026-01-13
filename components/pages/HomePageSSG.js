'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import DiscountCapture from '@/components/common/DiscountCapture';
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
  const activeGroups = groupLeaguesBySeason(activeLeagues)
  const comingSoonGroups = groupLeaguesBySeason(comingSoonLeagues)
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-parque-bg to-white">
      {/* Capture discount codes from URL */}
      <Suspense fallback={null}>
        <DiscountCapture />
      </Suspense>
      
      <Navigation 
        currentPage="home" 
        language={language} 
        onLanguageChange={setLanguage}
        showLanguageSwitcher={true}
      />
      
      {/* 1. Hero (now includes app showcase) */}
      <EmotionalHeroSection locale={validLocale} />
      
      {/* 2. Find Your League Section */}
      <section id="cities" className="relative scroll-mt-16 py-16 sm:py-24 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />
        
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-parque-purple/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-parque-green/5 to-transparent rounded-full blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="container mx-auto max-w-3xl relative z-10">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-parque-purple/10 rounded-full text-sm font-medium mb-5">
              <svg className="w-4 h-4 text-parque-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-parque-purple">
                {validLocale === 'es' ? 'Costa del Sol, España' : 'Costa del Sol, Spain'}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {content.cities.title}
            </h2>
            <p className="text-[0.9rem] sm:text-lg text-gray-500 max-w-md mx-auto">
              {content.cities.subtitle}
            </p>
          </div>
          
          {/* League content */}
          <div className="relative">
            {error ? (
              <div className="text-center py-12 max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {validLocale === 'es' ? 'Error cargando ligas' : 'Error loading leagues'}
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
              </div>
            ) : leagues.length === 0 ? (
              <div className="text-center py-12 max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-parque-purple/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-parque-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
                    <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
                  </svg>
                </div>
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
                          <h3 className="text-[0.9rem] sm:text-lg font-medium text-gray-600 mb-4 text-center flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-parque-green animate-pulse" />
                            {cityName}
                          </h3>
                          {group.leagues.length > 1 ? (
                            <SeasonLevelSelector
                              leagues={group.leagues}
                              locale={validLocale}
                              status="upcoming"
                              variant="default"
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
                
                {/* PRIORITY 2: Active Leagues */}
                {activeGroups.length > 0 && (
                  <div className={registrationOpenGroups.length > 0 ? 'pt-6' : ''}>
                    {registrationOpenGroups.length > 0 && (
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-gray-200" />
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                          {validLocale === 'es' ? 'En Curso' : 'In Progress'}
                        </h3>
                        <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-gray-200" />
                      </div>
                    )}
                    <div className="space-y-6">
                      {activeGroups.map((group, index) => {
                        const cityName = group.leagues[0]?.city?.name?.[validLocale] || group.leagues[0]?.city?.name?.es || ''
                        return (
                          <div key={`active-${index}`}>
                            {registrationOpenGroups.length === 0 && (
                              <h3 className="text-[0.9rem] sm:text-lg font-medium text-gray-600 mb-4 text-center flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                                {cityName}
                              </h3>
                            )}
                            {group.leagues.length > 1 ? (
                              <SeasonLevelSelector
                                leagues={group.leagues}
                                locale={validLocale}
                                status="active"
                                variant="default"
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
                  </div>
                )}
                
                {/* PRIORITY 3: Coming Soon Leagues */}
                {comingSoonGroups.length > 0 && (
                  <div className="pt-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-gray-200" />
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                        {validLocale === 'es' ? 'Próximamente' : 'Coming Soon'}
                      </h3>
                      <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-gray-200" />
                    </div>
                    <div className="space-y-6">
                      {comingSoonGroups.map((group, index) => (
                        group.leagues.length > 1 ? (
                          <SeasonLevelSelector
                            key={`soon-${index}`}
                            leagues={group.leagues}
                            locale={validLocale}
                            status="upcoming"
                            variant="default"
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
        </div>
      </section>
      
      {/* 3. How It Works */}
      <HowItWorksShowcase locale={validLocale} />
      
      {/* 4. Testimonials Section - Light */}
      <section className="relative py-16 sm:py-20 px-4 overflow-hidden bg-white">
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-parque-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-parque-green/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-parque-purple/10 rounded-full text-sm font-medium text-parque-purple mb-4">
              <svg className="w-4 h-4 text-parque-purple" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{validLocale === 'es' ? 'Testimonios' : 'Testimonials'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {content.testimonials.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
              {content.testimonials.subtitle}
            </p>
          </div>
          
          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {content.testimonials.items.map((testimonial, index) => {
              const colors = [
                { bg: 'from-parque-purple to-violet-600', text: 'text-white' },
                { bg: 'from-parque-green to-emerald-600', text: 'text-white' },
                { bg: 'from-parque-yellow to-amber-500', text: 'text-gray-900' }
              ][index % 3];
              
              return (
                <div 
                  key={index} 
                  className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-lg"
                >
                  {/* Quote icon */}
                  <div className="mb-4">
                    <svg className="w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-parque-yellow" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  
                  {/* Quote text */}
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  
                  {/* Highlight */}
                  {testimonial.highlight && (
                    <p className="text-sm font-semibold text-parque-purple mb-4">
                      &ldquo;{testimonial.highlight}&rdquo;
                    </p>
                  )}
                  
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center ${colors.text} font-bold text-sm`}>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-gray-500 text-xs">{testimonial.location}</div>
                    </div>
                  </div>
                </div>
              );
            })}
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
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-5 sm:mb-6 rounded-full bg-gradient-to-br from-parque-green to-parque-green/80 shadow-lg shadow-parque-green/25">
            <svg className="w-7 h-7 sm:w-9 sm:h-9 text-white" viewBox="0 0 472.615 472.615" fill="currentColor">
              <path d="M236.308,0C177.21,0,123.225,21.744,81.79,57.603c38.847,38.956,94.88,61.345,154.515,61.345c59.623,0,115.662-22.388,154.52-61.346C349.39,21.744,295.404,0,236.308,0z"/>
              <path d="M236.372,353.665c-59.649,0-115.697,22.4-154.545,61.379c41.43,35.84,95.401,57.571,154.481,57.571c59.113,0,113.111-21.755,154.55-57.631C352.01,376.042,295.978,353.665,236.372,353.665z"/>
              <path d="M405.246,71.146c-42.54,42.904-103.899,67.494-168.941,67.494c-65.055,0-126.407-24.587-168.944-67.486C25.707,113.76,0,172.018,0,236.308c0,64.307,25.721,122.581,67.395,165.188c42.539-42.923,103.904-67.523,168.977-67.523c65.021,0,126.371,24.576,168.91,67.459c41.636-42.601,67.334-100.849,67.334-165.124C472.615,172.014,446.904,113.752,405.246,71.146z"/>
            </svg>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            {content.cta.title}
          </h2>
          
          <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            {content.cta.subtitle}
          </p>
          
          <a
            href="#cities"
            className="group inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-gray-900 rounded-full font-semibold text-base sm:text-lg shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            {content.cta.button}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          
          <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-4 sm:gap-8 text-sm text-gray-400">
            <div className="flex items-start gap-2 text-center">
              <svg className="w-4 h-4 text-parque-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{content.cta.guarantee}</span>
            </div>
            <div className="flex items-start gap-2 text-center">
              <svg className="w-4 h-4 text-parque-yellow flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
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
