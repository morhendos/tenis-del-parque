'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/common/Navigation';
import Footer from '@/components/common/Footer';
import EmotionalHeroSection from '@/components/home/EmotionalHeroSection';
import ProblemSection from '@/components/home/ProblemSection';
import SolutionSection from '@/components/home/SolutionSection';
import LeagueCard from '@/components/league/LeagueCard';
import { i18n } from '@/lib/i18n/config';
import { multiLeagueHomeContent } from '@/lib/content/multiLeagueHomeContent';
import { homeContent } from '@/lib/content/homeContent';
import { TennisPreloaderInline } from '@/components/ui/TennisPreloader';

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

export default function HomePageSSG({ locale, leaguesData }) {
  const validLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  const [language, setLanguage] = useState(validLocale);
  
  const content = multiLeagueHomeContent[validLocale] || multiLeagueHomeContent[i18n.defaultLocale];
  const footerContent = homeContent[validLocale]?.footer || homeContent[i18n.defaultLocale]?.footer;
  
  // Use the pre-fetched data from SSG
  const { leagues, activeLeagues, registrationOpenLeagues, comingSoonLeagues, total, error } = leaguesData;
  
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
      
      {/* Cities Section - Using pre-fetched SSG data */}
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
              <Link
                href={`/${validLocale}/${validLocale === 'es' ? 'ligas' : 'leagues'}`}
                className="inline-block bg-parque-purple text-white px-6 py-3 rounded-lg hover:bg-parque-purple/90 transition-colors"
              >
                {validLocale === 'es' ? 'Ver todas las ligas' : 'View all leagues'}
              </Link>
            </div>
          ) : (
            <>
              {/* PRIORITY 1: Registration Open Leagues - MOST IMPORTANT for new leads */}
              {registrationOpenLeagues.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-3xl font-bold text-parque-purple mb-8 text-center">
                    {validLocale === 'es' ? '🎾 ¡Únete Ahora!' : '🎾 Join Now!'}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-8">
                    {registrationOpenLeagues.map((league) => (
                      <LeagueCard
                        key={league._id}
                        league={league}
                        content={content}
                        locale={validLocale}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* PRIORITY 2: Coming Soon Leagues - Builds anticipation */}
              {comingSoonLeagues.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
                    {content.cities.launching} {validLocale === 'es' ? 'Próximamente' : 'Soon'}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-8">
                    {comingSoonLeagues.map((league) => (
                      <LeagueCard
                        key={league._id}
                        league={league}
                        content={content}
                        locale={validLocale}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* PRIORITY 3: Active Leagues - Social proof but de-emphasized */}
              {/* To hide completely: comment out or delete this entire block */}
              {activeLeagues.length > 0 && (
                <div className="mt-20 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-medium text-gray-500 mb-6 text-center">
                    {validLocale === 'es' ? 'Ligas en Curso' : 'Currently Running'}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-8 opacity-75">
                    {activeLeagues.map((league) => (
                      <LeagueCard
                        key={league._id}
                        league={league}
                        content={content}
                        locale={validLocale}
                      />
                    ))}
                  </div>
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
