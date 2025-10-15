'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import LeagueCard from '@/components/league/LeagueCard'
import { multiLeagueHomeContent } from '@/lib/content/multiLeagueHomeContent'
import { homeContent } from '@/lib/content/homeContent'

export default function LeaguesPageSSG({ locale, leaguesData }) {
  const [language, setLanguage] = useState(locale)
  
  const content = multiLeagueHomeContent[locale] || multiLeagueHomeContent['es']
  const footerContent = homeContent[locale]?.footer || homeContent['es']?.footer
  
  const { leagues, stats, error } = leaguesData
  
  // Organize leagues by status
  const activeLeagues = leagues.filter(league => league.status === 'active')
  const registrationOpenLeagues = leagues.filter(league => league.status === 'registration_open')
  const comingSoonLeagues = leagues.filter(league => league.status === 'coming_soon')
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-parque-bg to-white">
      <Navigation 
        currentPage="leagues" 
        language={language} 
        onLanguageChange={setLanguage}
        showLanguageSwitcher={true}
      />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {locale === 'es' ? 'Todas Nuestras Ligas' : 'All Our Leagues'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {locale === 'es' 
              ? 'Encuentra la liga perfecta para tu nivel. Sistema suizo, rankings ELO y ambiente competitivo pero relajado.'
              : 'Find the perfect league for your level. Swiss system, ELO rankings and competitive but relaxed atmosphere.'}
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-parque-purple">{stats.total}</div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Total Ligas' : 'Total Leagues'}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Activas' : 'Active'}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-blue-600">{stats.registrationOpen}</div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Inscripciones' : 'Registration'}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="text-2xl font-bold text-orange-600">{stats.cities}</div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Ciudades' : 'Cities'}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Leagues Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {error ? (
            <div className="text-center py-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {locale === 'es' ? 'Error cargando ligas' : 'Error loading leagues'}
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
            </div>
          ) : leagues.length === 0 ? (
            <div className="text-center py-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🎾</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {locale === 'es' ? 'No hay ligas disponibles' : 'No leagues available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {locale === 'es' 
                  ? 'Actualmente no hay ligas en la base de datos. Estamos trabajando para agregar más.'
                  : 'There are currently no leagues in the database. We are working to add more.'}
              </p>
            </div>
          ) : (
            <>
              {/* Active Leagues */}
              {activeLeagues.length > 0 && (
                <div className="mb-20">
                  <div className="max-w-7xl mx-auto mb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 px-4">
                        {locale === 'es' ? 'Ligas Activas' : 'Active Leagues'}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                    <p className="text-center text-gray-600 text-sm">
                      {locale === 'es' ? 'Ligas en curso con partidos programados' : 'Ongoing leagues with scheduled matches'}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
                    {activeLeagues.map((league) => (
                      <LeagueCard
                        key={league._id}
                        league={league}
                        content={content}
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Registration Open Leagues */}
              {registrationOpenLeagues.length > 0 && (
                <div className="mb-20">
                  <div className="max-w-7xl mx-auto mb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 px-4">
                        {locale === 'es' ? 'Inscripciones Abiertas' : 'Registration Open'}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                    <p className="text-center text-gray-600 text-sm">
                      {locale === 'es' ? 'Únete ahora y asegura tu lugar' : 'Join now and secure your spot'}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
                    {registrationOpenLeagues.map((league) => (
                      <LeagueCard
                        key={league._id}
                        league={league}
                        content={content}
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Coming Soon Leagues */}
              {comingSoonLeagues.length > 0 && (
                <div className="mb-20">
                  <div className="max-w-7xl mx-auto mb-8">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 px-4">
                        {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                    <p className="text-center text-gray-600 text-sm">
                      {locale === 'es' ? 'Nuevas ligas en preparación' : 'New leagues in preparation'}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
                    {comingSoonLeagues.map((league) => (
                      <LeagueCard
                        key={league._id}
                        league={league}
                        content={content}
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'es' ? '¿Listo para jugar?' : 'Ready to play?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Únete a la comunidad de tenis amateur más activa de España'
              : 'Join the most active amateur tennis community in Spain'}
          </p>
          <Link
            href={`/${locale}/${locale === 'es' ? 'clubes' : 'clubs'}`}
            className="inline-block px-8 py-4 bg-white text-parque-purple rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
          >
            {locale === 'es' ? 'Ver Clubes' : 'View Clubs'}
          </Link>
        </div>
      </section>
      
      <Footer content={footerContent} />
    </main>
  )
}
