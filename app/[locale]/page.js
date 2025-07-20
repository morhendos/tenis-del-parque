'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import EmotionalHeroSection from '@/components/home/EmotionalHeroSection';
import ProblemSection from '@/components/home/ProblemSection';
import SolutionSection from '@/components/home/SolutionSection';
import { useParams } from 'next/navigation';
import { cityInfo, i18n } from '@/lib/i18n/config';
import { multiLeagueHomeContent } from '@/lib/content/multiLeagueHomeContent';
import { homeContent } from '@/lib/content/homeContent';

// City Card Component - Updated for dynamic data
function CityCard({ league, content, locale }) {
  const isActive = league.status === 'active';
  const citySlug = league.slug;
  const cityContent = content.cities.cityDescriptions?.[citySlug];
  
  // Extract location string from location object
  const locationString = league.location?.city || league.location?.region || league.name;
  const regionString = league.location?.region || 'España';
  
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
      !isActive ? 'opacity-80' : ''
    }`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isActive ? content.cities.available : content.cities.comingSoon}
        </span>
      </div>
      
      {/* City Image */}
      <div className="relative h-48 bg-gradient-to-br from-parque-purple to-parque-green">
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-3xl font-bold text-white">{league.name}</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {cityContent && <p className="text-gray-600 mb-4">{cityContent}</p>}
        
        {isActive && league.playerCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{league.playerCount}</span> {content.cities.playersCount}
            </div>
            <div className="text-sm text-gray-500">
              {regionString}
            </div>
          </div>
        )}
        
        {isActive ? (
          <Link
            href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${citySlug}`}
            className="block w-full text-center bg-parque-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-parque-purple/90 transition-colors"
          >
            {content.cities.joinButton}
          </Link>
        ) : (
          <button
            disabled
            className="block w-full text-center bg-gray-200 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
          >
            {content.cities.waitingList}
          </button>
        )}
      </div>
    </div>
  );
}

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

export default function MultiLeagueHomePage() {
  const params = useParams();
  const validLocale = i18n.locales.includes(params.locale) ? params.locale : i18n.defaultLocale;
  
  const [language, setLanguage] = useState(validLocale);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const content = multiLeagueHomeContent[validLocale] || multiLeagueHomeContent[i18n.defaultLocale];
  const footerContent = homeContent[validLocale]?.footer || homeContent[i18n.defaultLocale]?.footer;
  
  // Fetch leagues from database
  useEffect(() => {
    fetchLeagues();
  }, []);
  
  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/leagues');
      if (response.ok) {
        const data = await response.json();
        setLeagues(data.leagues || []);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Organize leagues by status
  const activeLeagues = leagues.filter(league => league.status === 'active');
  const comingSoonLeagues = leagues.filter(league => league.status === 'coming_soon');
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-parque-bg to-white">
      <Navigation 
        currentPage="home" 
        language={language} 
        onLanguageChange={setLanguage}
        showLanguageSwitcher={true}
      />
      
      <EmotionalHeroSection content={content} locale={validLocale} />
      
      <ProblemSection content={content.problem} />
      
      <SolutionSection content={content.solution} />
      
      {/* Cities Section - Now Dynamic */}
      <section id="cities" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {content.cities.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.cities.subtitle}
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-parque-purple mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {validLocale === 'es' ? 'Cargando ligas...' : 'Loading leagues...'}
              </p>
            </div>
          ) : (
            <>
              {/* Active Leagues */}
              {activeLeagues.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {activeLeagues.map((league) => (
                    <CityCard
                      key={league._id}
                      league={league}
                      content={content}
                      locale={validLocale}
                    />
                  ))}
                </div>
              )}
              
              {/* Coming Soon Leagues */}
              {comingSoonLeagues.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
                    {content.cities.comingSoon}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {comingSoonLeagues.map((league) => (
                      <CityCard
                        key={league._id}
                        league={league}
                        content={content}
                        locale={validLocale}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Fallback if no leagues from database - show hardcoded Sotogrande */}
              {leagues.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <CityCard
                    league={{
                      _id: 'default-sotogrande',
                      name: 'Sotogrande',
                      slug: 'sotogrande',
                      status: 'active',
                      playerCount: 24,
                      location: { city: 'Sotogrande', region: 'Cádiz' }
                    }}
                    content={content}
                    locale={validLocale}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {content.features.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.features.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.features.items.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {content.howItWorks.title}
            </h2>
            <p className="text-xl text-gray-600">
              {content.howItWorks.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {content.howItWorks.steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-parque-purple text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section - Updated */}
      <section className="py-20 px-4">
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
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
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
                    "{testimonial.highlight}"
                  </p>
                )}
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section - Updated */}
      <section className="py-20 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {content.cta.title}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {content.cta.subtitle}
          </p>
          <a
            href="#cities"
            className="inline-block px-8 py-4 bg-white text-parque-purple rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors mb-4"
          >
            {content.cta.button}
          </a>
          <p className="text-sm opacity-90 mb-2">
            {content.cta.guarantee}
          </p>
          <p className="text-sm opacity-75">
            {content.cta.urgency}
          </p>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            {content.faq.title}
          </h2>
          
          <div className="space-y-6">
            {content.faq.items.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer content={footerContent} />
    </main>
  );
}