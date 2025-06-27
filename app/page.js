'use client'

import { useState, useEffect } from 'react'
import Navigation from '../components/common/Navigation'
import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import HowItWorksSection from '../components/home/HowItWorksSection'
import LevelsSection from '../components/home/LevelsSection'
import PlatformPreviewSection from '../components/home/PlatformPreviewSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import FAQSection from '../components/home/FAQSection'
import SignupSection from '../components/home/SignupSection'
import Footer from '../components/common/Footer'
import { useLanguage } from '../lib/hooks/useLanguage'
import { homeContent } from '../lib/content/homeContent'
import { mockData } from '../lib/data/mockData'

// Simple, consistent section divider with larger tennis ball
function SectionDivider() {
  return (
    <div className="relative h-px my-20">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <div className="absolute left-1/2 -translate-x-1/2 -top-4">
        <div className="w-8 h-8 tennis-ball"></div>
      </div>
    </div>
  )
}

export default function Home() {
  const { language, setLanguage } = useLanguage()
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const t = homeContent[language]

  // Handle parallax scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    setTimeout(() => {
      setFormData({ name: '', email: '' })
      setIsSubmitted(false)
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white relative overflow-x-hidden">
      {/* Modern parallax background layers */}
      
      {/* Layer 1: Abstract geometric shapes - far background */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
          height: '200vh',
        }}
      >
        <div className="absolute top-[10%] left-[10%] w-96 h-96 opacity-[0.03]">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-parque-purple to-transparent blur-3xl" />
        </div>
        <div className="absolute top-[40%] right-[15%] w-[500px] h-[500px] opacity-[0.04]">
          <div className="w-full h-full rounded-full bg-gradient-to-tl from-parque-green to-transparent blur-3xl" />
        </div>
        <div className="absolute top-[70%] left-[20%] w-[600px] h-[600px] opacity-[0.03]">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-parque-yellow/30 to-transparent blur-3xl" />
        </div>
      </div>
      
      {/* Layer 2: Modern dot pattern - mid background */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0 opacity-[0.15]"
        style={{
          transform: `translateY(${scrollY * 0.4}px)`,
          height: '150vh',
        }}
      >
        <div className="w-full h-full modern-dots-pattern" />
      </div>
      
      {/* Layer 3: Subtle geometric lines - near background */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0 opacity-[0.08]"
        style={{
          transform: `translateY(${scrollY * 0.6}px)`,
          height: '130vh',
        }}
      >
        <div className="w-full h-full modern-lines-pattern" />
      </div>
      
      {/* Layer 4: Floating abstract tennis elements */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{
          transform: `translateY(${scrollY * 0.8}px)`,
          height: '120vh',
        }}
      >
        {/* Abstract tennis ball shapes */}
        <div className="absolute top-[20%] right-[10%] w-32 h-32 opacity-[0.06]">
          <div className="w-full h-full rounded-full bg-gradient-radial from-parque-yellow/40 to-transparent" />
        </div>
        <div className="absolute top-[50%] left-[5%] w-24 h-24 opacity-[0.05]">
          <div className="w-full h-full rounded-full bg-gradient-radial from-parque-yellow/30 to-transparent" />
        </div>
        <div className="absolute top-[80%] right-[20%] w-40 h-40 opacity-[0.04]">
          <div className="w-full h-full rounded-full bg-gradient-radial from-parque-yellow/20 to-transparent" />
        </div>
      </div>
      
      {/* Main content with proper z-index */}
      <div className="relative z-10">
        <Navigation 
          currentPage="home" 
          language={language} 
          onLanguageChange={setLanguage} 
        />
        
        <HeroSection content={t.hero} />
      </div>
      
      {/* Rest of content with solid white background to cover parallax */}
      <div className="bg-white relative z-20">
        <FeaturesSection content={t.features} />
        
        <SectionDivider />
        
        <HowItWorksSection content={t.howItWorks} />
        
        <SectionDivider />
        
        <LevelsSection content={t.levels} />
        
        <SectionDivider />
        
        <PlatformPreviewSection 
          content={t.platformPreview} 
          mockData={mockData} 
          language={language} 
        />
        
        <SectionDivider />
        
        <TestimonialsSection content={t.testimonials} />
        
        <SectionDivider />
        
        <FAQSection content={t.faq} />
        
        <SignupSection 
          content={t.signup} 
          formData={formData} 
          isSubmitted={isSubmitted} 
          isSubmitting={isSubmitting} 
          onSubmit={handleSubmit} 
          onChange={handleChange} 
          language={language} 
        />
        
        <Footer content={t.footer} />
      </div>

      {/* Keep animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
          animation-fill-mode: both;
        }
        
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        
        .delay-1000 { animation-delay: 1000ms; }
        .delay-2000 { animation-delay: 2000ms; }
      `}</style>
    </main>
  )
}
