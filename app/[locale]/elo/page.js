'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/common/Navigation'
import Footer from '@/components/common/Footer'
import EloHeroSection from '@/components/elo/EloHeroSection'
import EloContentRenderer from '@/components/elo/EloContentRenderer'
import EloCTASection from '@/components/elo/EloCTASection'
import { eloContent } from '@/lib/content/eloContent'
import { homeContent } from '@/lib/content/homeContent'
import { useActiveSection } from '@/lib/hooks/useActiveSection'

export default function EloPage() {
  const params = useParams()
  const locale = params.locale || 'es'
  const [scrollY, setScrollY] = useState(0)
  const activeSection = useActiveSection()
  
  const content = eloContent[locale]
  const footerContent = homeContent[locale]?.footer

  // Handle parallax scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      
      <Navigation currentPage="elo" />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <EloHeroSection content={content.hero} />
        
        {/* Main Content */}
        <EloContentRenderer 
          sections={content.sections} 
          activeSection={activeSection} 
        />
        
        {/* CTA Section */}
        <EloCTASection content={content.cta} locale={locale} />
      </div>
      
      <Footer content={footerContent} />
    </div>
  )
}