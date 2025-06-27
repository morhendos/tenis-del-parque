'use client'

import { useState } from 'react'
import Navigation from '../components/common/Navigation'
import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import Footer from '../components/common/Footer'
import { useLanguage } from '../lib/hooks/useLanguage'
import { homeContent } from '../lib/content/homeContent'

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
      
      <FeaturesSection content={t.features} />
      
      {/* TODO: Add more sections as separate components */}
      {/* <HowItWorksSection content={t.howItWorks} /> */}
      {/* <LevelsSection content={t.levels} /> */}
      {/* <PlatformPreview content={t.platformPreview} /> */}
      {/* <TestimonialsSection content={t.testimonials} /> */}
      {/* <FAQSection content={t.faq} /> */}
      {/* <SignupSection content={t.signup} /> */}
      
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