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
  const { language, setLanguage, isLanguageLoaded } = useLanguage()
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    whatsapp: '', 
    level: '' 
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
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

  // Validate form data
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = t.signup.form.errors.required
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t.signup.form.errors.required
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t.signup.form.errors.invalidEmail
    }
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = t.signup.form.errors.required
    } else if (!/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/.test(formData.whatsapp.replace(/\s/g, ''))) {
      newErrors.whatsapp = t.signup.form.errors.invalidPhone
    }
    
    if (!formData.level) {
      newErrors.level = t.signup.form.errors.required
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/players/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          language
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setIsSubmitted(true)
        console.log('Player registered:', data.player)
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setFormData({ name: '', email: '', whatsapp: '', level: '' })
          setIsSubmitted(false)
        }, 5000)
      } else {
        // Handle API errors
        if (response.status === 409) {
          setErrors({ email: t.signup.form.errors.alreadyRegistered })
        } else if (data.errors) {
          // Handle validation errors from API
          const apiErrors = {}
          data.errors.forEach(error => {
            if (error.includes('email')) apiErrors.email = error
            else if (error.includes('whatsapp')) apiErrors.whatsapp = error
            else if (error.includes('name')) apiErrors.name = error
            else if (error.includes('level')) apiErrors.level = error
          })
          setErrors(apiErrors)
        } else {
          // Generic error
          setErrors({ submit: data.error || 'Something went wrong. Please try again.' })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ 
        submit: language === 'es' 
          ? 'Error de conexión. Por favor, inténtalo de nuevo.' 
          : 'Connection error. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  // Show loading state until language is resolved to prevent hydration flicker
  if (!isLanguageLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 tennis-ball mb-4 animate-bounce mx-auto"></div>
          <div className="text-parque-purple/60 text-lg font-light">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-parque-bg via-white to-white relative overflow-x-hidden">
      {/* Tennis-themed parallax background layers */}
      
      {/* Layer 1: Tennis court lines - far background */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0 opacity-20"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
          height: '200vh',
        }}
      >
        <div className="w-full h-full tennis-court-pattern" />
      </div>
      
      {/* Layer 2: Tennis ball pattern - mid background */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0 opacity-30"
        style={{
          transform: `translateY(${scrollY * 0.4}px)`,
          height: '150vh',
        }}
      >
        <div className="w-full h-full tennis-ball-pattern" />
      </div>
      
      {/* Layer 3: Subtle gradient orbs for depth */}
      <div 
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{
          transform: `translateY(${scrollY * 0.6}px)`,
          height: '130vh',
        }}
      >
        <div className="absolute top-[10%] left-[10%] w-96 h-96 opacity-15">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-parque-purple to-transparent blur-3xl" />
        </div>
        <div className="absolute top-[40%] right-[15%] w-[500px] h-[500px] opacity-15">
          <div className="w-full h-full rounded-full bg-gradient-to-tl from-parque-green to-transparent blur-3xl" />
        </div>
        <div className="absolute top-[70%] left-[20%] w-[600px] h-[600px] opacity-10">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-parque-yellow/50 to-transparent blur-3xl" />
        </div>
      </div>
      
      {/* Navigation with high z-index */}
      <Navigation 
        currentPage="home" 
        language={language} 
        onLanguageChange={setLanguage} 
      />
      
      {/* Main content with proper z-index (lower than navigation) */}
      <div className="relative z-10 pt-16">
        <HeroSection content={t.hero} />
      </div>
      
      {/* Rest of content with alternating backgrounds */}
      <div className="relative z-20">
        {/* Features Section - White background */}
        <div id="features" className="bg-white scroll-mt-20">
          <FeaturesSection content={t.features} />
        </div>
        
        <SectionDivider />
        
        {/* How It Works - Light gradient with tennis net pattern */}
        <div className="bg-gradient-to-br from-gray-50 to-parque-bg/20 relative overflow-hidden">
          <div className="absolute inset-0 tennis-net-mesh opacity-10"></div>
          <HowItWorksSection content={t.howItWorks} />
        </div>
        
        <SectionDivider />
        
        {/* Levels Section - White with sport stripes */}
        <div className="bg-white relative overflow-hidden">
          <div className="absolute inset-0 sport-stripes-pattern opacity-10"></div>
          <LevelsSection content={t.levels} />
        </div>
        
        <SectionDivider />
        
        {/* Platform Preview - Gradient with racquet strings */}
        <div className="bg-gradient-to-bl from-parque-purple/5 to-parque-green/5 relative overflow-hidden">
          <div className="absolute inset-0 racquet-strings-pattern opacity-15"></div>
          <PlatformPreviewSection 
            content={t.platformPreview} 
            mockData={mockData} 
            language={language} 
          />
        </div>
        
        <SectionDivider />
        
        {/* Testimonials - White background */}
        <div className="bg-white">
          <TestimonialsSection content={t.testimonials} />
        </div>
        
        <SectionDivider />
        
        {/* FAQ - Light background with subtle tennis court pattern */}
        <div className="bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 tennis-court-pattern opacity-5"></div>
          <FAQSection content={t.faq} />
        </div>
        
        {/* Signup - Gradient background with tennis ball pattern */}
        <div id="signup" className="bg-gradient-to-br from-parque-purple/10 via-parque-green/5 to-parque-yellow/10 relative overflow-hidden scroll-mt-20">
          <div className="absolute inset-0 tennis-ball-pattern opacity-10"></div>
          {errors.submit && (
            <div className="container mx-auto px-4 pt-8">
              <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                  <p className="text-red-600">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}
          <SignupSection 
            content={t.signup} 
            formData={formData} 
            isSubmitted={isSubmitted} 
            isSubmitting={isSubmitting} 
            onSubmit={handleSubmit} 
            onChange={handleChange} 
            language={language}
            errors={errors}
          />
        </div>
        
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
