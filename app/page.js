'use client'

import { useState } from 'react'
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
import TennisBallDivider, { TennisNetDivider, CourtLinesDivider } from '../components/ui/TennisDividers'
import { useLanguage } from '../lib/hooks/useLanguage'
import { homeContent } from '../lib/content/homeContent'
import { mockData } from '../lib/data/mockData'

export default function Home() {
  const { language, setLanguage } = useLanguage()
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const t = homeContent[language]

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
    <main className="min-h-screen bg-gradient-to-br from-parque-bg via-white to-parque-bg">
      <Navigation 
        currentPage="home" 
        language={language} 
        onLanguageChange={setLanguage} 
      />
      
      <HeroSection content={t.hero} />
      
      <TennisBallDivider />
      
      <FeaturesSection content={t.features} />
      
      <CourtLinesDivider />
      
      <HowItWorksSection content={t.howItWorks} />
      
      <TennisNetDivider />
      
      <LevelsSection content={t.levels} />
      
      <TennisBallDivider />
      
      <PlatformPreviewSection 
        content={t.platformPreview} 
        mockData={mockData} 
        language={language} 
      />
      
      <CourtLinesDivider />
      
      <TestimonialsSection content={t.testimonials} />
      
      <TennisBallDivider />
      
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