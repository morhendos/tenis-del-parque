'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import RulesHeroSection from '@/components/rules/RulesHeroSection'
import RulesSection from '@/components/rules/RulesSection'
import RulesSidebar from '@/components/rules/RulesSidebar'
import RulesCTASection from '@/components/rules/RulesCTASection'
import { rulesContent } from '@/lib/content/rulesContent'
import { homeContent } from '@/lib/content/homeContent'
import { useActiveSection } from '@/lib/hooks/useActiveSection'

export default function RulesPageContent({ locale }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { activeSection, scrollToSection } = useActiveSection()
  const content = rulesContent[locale]
  const footerContent = homeContent[locale]?.footer

  // Toggle mobile sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Handle section click on mobile
  const handleSectionClick = (index) => {
    scrollToSection(index)
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }

  // Close sidebar on resize if window becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg">
      <Navigation currentPage="rules" />
      
      {/* Hero Section */}
      <RulesHeroSection content={content.hero} />
      
      {/* Sidebar */}
      <RulesSidebar 
        sections={content.sections} 
        activeSection={activeSection}
        onScrollToSection={handleSectionClick}
      />
      
      {/* Rules Content */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {content.sections.map((section, index) => (
              <RulesSection 
                key={section.id || index} 
                section={section} 
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <RulesCTASection content={content.cta} locale={locale} />
      
      <Footer content={footerContent} />
    </div>
  )
}
