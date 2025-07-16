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

export default function RulesPageContent({ locale }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const content = rulesContent[locale]
  const footerContent = homeContent[locale]?.footer

  // Toggle mobile sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Scroll to section
  const scrollToSection = (index) => {
    const element = document.querySelector(`.rule-section:nth-of-type(${index + 1})`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.rule-section')
      const scrollPosition = window.scrollY + 200

      sections.forEach((section, index) => {
        const top = section.offsetTop
        const height = section.clientHeight
        
        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveSection(index)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
              onScrollToSection={scrollToSection}
            />
          </aside>
          
          {/* Rules Content */}
          <main className="mt-8 lg:mt-0 lg:col-span-9">
            <div className="prose prose-lg max-w-none">
              {content.sections.map((section, index) => (
                <RulesSection 
                  key={section.id} 
                  section={section} 
                  index={index}
                />
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