'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../../lib/hooks/useLanguage'
import { eloContent } from '../../lib/content/eloContent'
import Navigation from '../../components/common/Navigation'
import Footer from '../../components/common/Footer'
import EloHeroSection from '../../components/elo/EloHeroSection'
import EloContentRenderer from '../../components/elo/EloContentRenderer'
import EloCTASection from '../../components/elo/EloCTASection'

export default function EloPage() {
  const { language, setLanguage } = useLanguage()
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const t = eloContent[language]

  return (
    <main className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg">
      <Navigation 
        language={language} 
        onLanguageChange={setLanguage}
        scrolled={scrolled}
        currentPage="elo"
      />

      <EloHeroSection 
        title={t.hero.title}
        subtitle={t.hero.subtitle}
      />

      {/* Sections */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {t.sections.map((section, sectionIndex) => (
              <div key={section.id} className="mb-24 last:mb-0 animate-fadeInUp" style={{animationDelay: `${sectionIndex * 100}ms`}}>
                <h2 className="text-3xl md:text-4xl font-light text-parque-purple mb-10">
                  {section.title}
                </h2>
                <EloContentRenderer 
                  contentItems={section.content}
                  language={language}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <EloCTASection 
        title={t.cta.title}
        subtitle={t.cta.subtitle}
        buttonText={t.cta.button}
        link={t.cta.link}
      />

      <Footer content={t.footer} />
    </main>
  )
} 