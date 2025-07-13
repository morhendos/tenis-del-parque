'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import { swissContent } from '@/lib/content/swissContent'
import { homeContent } from '@/lib/content/homeContent'
import { useActiveSection } from '@/lib/hooks/useActiveSection'

export default function SwissSystemPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [scrollY, setScrollY] = useState(0)
  const activeSection = useActiveSection()
  
  const content = swissContent[locale]
  const footerContent = homeContent[locale]?.footer

  // Handle parallax scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-parque-bg to-white relative overflow-x-hidden">
      {/* Parallax background elements */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0 opacity-10"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          height: '200vh',
        }}
      >
        <div className="w-full h-full tennis-court-pattern" />
      </div>
      
      <Navigation currentPage="swiss" />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-parque-purple mb-6 animate-fadeInUp">
              {content.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light animate-fadeInUp animation-delay-200">
              {content.hero.subtitle}
            </p>
          </div>
        </section>
        
        {/* Quick Navigation */}
        <section className="py-8 border-b border-gray-200 sticky top-16 bg-white/80 backdrop-blur-md z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              {content.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-parque-purple text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Content Sections */}
        <div className="py-16">
          {content.sections.map((section, index) => (
            <section 
              key={section.id}
              id={section.id}
              className="py-16 px-4 scroll-mt-32"
            >
              <div className="container mx-auto max-w-4xl">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                  <h2 className="text-3xl md:text-4xl font-light text-parque-purple mb-8">
                    {section.title}
                  </h2>
                  
                  {section.content && (
                    <div className="prose prose-lg max-w-none">
                      {section.content.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="text-gray-700 mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {section.features && (
                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                      {section.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-parque-green rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">
                              {feature.title}
                            </h3>
                            <p className="text-gray-600">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {section.example && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        {locale === 'es' ? 'Ejemplo:' : 'Example:'}
                      </h3>
                      <p className="text-gray-700">{section.example}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
        
        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-parque-purple to-parque-green text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light mb-4">
              {content.cta.title}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              {content.cta.subtitle}
            </p>
            <a
              href={`/${locale}#cities`}
              className="inline-block bg-white text-parque-purple px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
            >
              {content.cta.button}
            </a>
          </div>
        </section>
      </div>
      
      <Footer content={footerContent} />
    </div>
  )
}