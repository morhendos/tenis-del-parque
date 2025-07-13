'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import { useParams } from 'next/navigation';
import { cityInfo } from '@/lib/i18n/config';
import { multiLeagueHomeContent } from '@/lib/content/multiLeagueHomeContent';
import { homeContent } from '@/lib/content/homeContent';

// City Card Component
function CityCard({ city, cityData, content, locale }) {
  const isAvailable = cityData[locale].status === 'active';
  const cityContent = content.cities.cityDescriptions[city];
  
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
      !isAvailable ? 'opacity-80' : ''
    }`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isAvailable ? content.cities.available : content.cities.comingSoon}
        </span>
      </div>
      
      {/* City Image */}
      <div className="relative h-48 bg-gradient-to-br from-parque-purple to-parque-green">
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-3xl font-bold text-white">{cityData[locale].name}</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-4">{cityContent}</p>
        
        {isAvailable && (
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">250+</span> {content.cities.playersCount}
            </div>
            <div className="text-sm text-gray-500">
              {cityData[locale].region}
            </div>
          </div>
        )}
        
        {isAvailable ? (
          <Link
            href={`/${locale}/${locale === 'es' ? 'registro' : 'signup'}/${city}`}
            className="block w-full text-center bg-parque-purple text-white px-6 py-3 rounded-lg font-medium hover:bg-parque-purple/90 transition-colors"
          >
            {content.cities.joinButton}
          </Link>
        ) : (
          <button
            disabled
            className="block w-full text-center bg-gray-200 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
          >
            {content.cities.startingSoon}
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
  const locale = params.locale || 'es';
  const [language, setLanguage] = useState(locale);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(true);
  
  const content = multiLeagueHomeContent[locale];
  const footerContent = homeContent[locale]?.footer;
  
  // Organize cities by status
  const activeCities = Object.entries(cityInfo).filter(
    ([_, data]) => data[locale].status === 'active'
  );
  const comingSoonCities = Object.entries(cityInfo).filter(
    ([_, data]) => data[locale].status === 'coming-soon'
  );
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-parque-bg to-white">
      <Navigation 
        currentPage="home" 
        language={language} 
        onLanguageChange={setLanguage}
        showLanguageSwitcher={true}
      />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/10 to-parque-green/10"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              {content.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              {content.hero.subtitle}
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              {content.hero.description}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-parque-purple">{content.hero.stats.players}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-parque-purple">{content.hero.stats.cities}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-parque-purple">{content.hero.stats.matches}</div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#cities"
                className="px-8 py-4 bg-parque-purple text-white rounded-lg font-medium text-lg hover:bg-parque-purple/90 transition-colors"
              >
                {content.hero.cta.primary}
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-4 border-2 border-parque-purple text-parque-purple rounded-lg font-medium text-lg hover:bg-parque-purple/10 transition-colors"
              >
                {content.hero.cta.secondary}
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Cities Section */}
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
          
          {/* Active Cities */}
          {activeCities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {activeCities.map(([city, cityData]) => (
                <CityCard
                  key={city}
                  city={city}
                  cityData={cityData}
                  content={content}
                  locale={locale}
                />
              ))}
            </div>
          )}
          
          {/* Coming Soon Cities */}
          {comingSoonCities.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
                {content.cities.comingSoon}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {comingSoonCities.map(([city, cityData]) => (
                  <CityCard
                    key={city}
                    city={city}
                    cityData={cityData}
                    content={content}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
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
      
      {/* Testimonials Section */}
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
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
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
          <p className="text-sm opacity-90">
            {content.cta.guarantee}
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