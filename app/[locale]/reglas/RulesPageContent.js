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
  const content = rulesContent[locale]
  const footerContent = homeContent[locale]?.footer
  const activeSection = useActiveSection()

  // Toggle mobile sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Close sidebar when clicking a link on mobile
  const handleSectionClick = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-parque-bg to-white">
      <Navigation currentPage="rules" />
      
      {/* Hero Section */}
      <RulesHeroSection content={content.hero} />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <RulesSidebar 
              sections={content.sections} 
              activeSection={activeSection}
              isOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              onSectionClick={handleSectionClick}
            />
          </aside>
          
          {/* Rules Content */}
          <main className="mt-8 lg:mt-0 lg:col-span-9">
            <div className="prose prose-lg max-w-none">
              {content.sections.map((section) => (
                <RulesSection key={section.id} section={section} />
              ))}
            </div>
          </main>
        </div>
      </div>
      
      {/* CTA Section */}
      <RulesCTASection content={content.cta} locale={locale} />
      
      <Footer content={footerContent} />
    </div>
  )
}