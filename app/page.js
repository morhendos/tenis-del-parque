'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [language, setLanguage] = useState('es') // 'es' or 'en'

  const content = {
    es: {
      hero: {
        tagline: 'La primera liga de tenis amateur que une pasión, competencia y comunidad. Prepárate para llevar tu juego al siguiente nivel.',
        cta: 'Únete a la Liga'
      },
      features: {
        title: '¿Por qué unirte a nuestra liga?',
        items: [
          {
            title: 'Comunidad',
            description: 'Conoce a otros apasionados del tenis y crea conexiones duraderas'
          },
          {
            title: 'Competencia',
            description: 'Partidos organizados cada semana con jugadores de tu nivel'
          },
          {
            title: 'Mejora',
            description: 'Eleva tu juego con competencia regular y feedback constructivo'
          }
        ]
      },
      howItWorks: {
        title: 'Cómo funciona',
        steps: [
          {
            title: 'Regístrate',
            description: 'Completa el formulario con tu nombre y email. Te contactaremos cuando lancemos la liga.'
          },
          {
            title: 'Clasificación',
            description: 'Jugarás partidos de clasificación para determinar tu nivel y división.'
          },
          {
            title: 'Compite',
            description: 'Partidos semanales contra jugadores de tu nivel. Sube en el ranking y diviértete.'
          }
        ]
      },
      signup: {
        title: 'Reserva tu plaza',
        subtitle: 'Sé de los primeros en unirte a la Liga de Tenis del Parque en Sotogrande. Las plazas son limitadas para la temporada de prueba.',
        form: {
          name: 'Nombre completo',
          email: 'Email',
          submit: 'Únete a la lista de espera',
          submitting: 'Enviando...'
        },
        success: {
          title: '¡Gracias por registrarte!',
          message: 'Te contactaremos pronto con más información sobre el inicio de la liga.'
        }
      },
      footer: '© 2025 Liga de Tenis del Parque - Sotogrande. Todos los derechos reservados.'
    },
    en: {
      hero: {
        tagline: 'The first amateur tennis league that brings together passion, competition, and community. Get ready to take your game to the next level.',
        cta: 'Join the League'
      },
      features: {
        title: 'Why join our league?',
        items: [
          {
            title: 'Community',
            description: 'Meet other tennis enthusiasts and create lasting connections'
          },
          {
            title: 'Competition',
            description: 'Organized matches every week with players at your level'
          },
          {
            title: 'Improvement',
            description: 'Elevate your game with regular competition and constructive feedback'
          }
        ]
      },
      howItWorks: {
        title: 'How it works',
        steps: [
          {
            title: 'Sign up',
            description: 'Complete the form with your name and email. We\'ll contact you when we launch the league.'
          },
          {
            title: 'Classification',
            description: 'You\'ll play classification matches to determine your level and division.'
          },
          {
            title: 'Compete',
            description: 'Weekly matches against players at your level. Move up the rankings and have fun.'
          }
        ]
      },
      signup: {
        title: 'Reserve your spot',
        subtitle: 'Be among the first to join the Tennis del Parque League in Sotogrande. Spots are limited for the trial season.',
        form: {
          name: 'Full name',
          email: 'Email',
          submit: 'Join the waiting list',
          submitting: 'Sending...'
        },
        success: {
          title: 'Thank you for signing up!',
          message: 'We\'ll contact you soon with more information about the league launch.'
        }
      },
      footer: '© 2025 Tennis del Parque League - Sotogrande. All rights reserved.'
    }
  }

  const t = content[language]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    // Reset form after 3 seconds
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
    <main className="min-h-screen bg-parque-bg">
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-parque-purple"
        >
          {language === 'es' ? 'EN' : 'ES'}
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/5 to-transparent"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Logo */}
            <div className="mb-12 flex justify-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <Image
                  src="/logo.png"
                  alt="Liga de Tenis del Parque"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              {t.hero.tagline}
            </p>
            
            {/* CTA Button */}
            <a href="#signup" className="inline-block bg-parque-purple text-white px-10 py-5 rounded-full text-lg font-medium hover:bg-parque-purple/90 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              {t.hero.cta}
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light text-center text-parque-purple mb-20">
            {t.features.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-24 h-24 bg-parque-green/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-parque-green/30 transition-colors duration-300">
                <svg className="w-12 h-12 text-parque-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-parque-purple mb-4">{t.features.items[0].title}</h3>
              <p className="text-gray-600 text-lg font-light leading-relaxed">{t.features.items[0].description}</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-parque-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-parque-yellow/30 transition-colors duration-300">
                <svg className="w-12 h-12 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-parque-purple mb-4">{t.features.items[1].title}</h3>
              <p className="text-gray-600 text-lg font-light leading-relaxed">{t.features.items[1].description}</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-parque-purple/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-parque-purple/30 transition-colors duration-300">
                <svg className="w-12 h-12 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-parque-purple mb-4">{t.features.items[2].title}</h3>
              <p className="text-gray-600 text-lg font-light leading-relaxed">{t.features.items[2].description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-light text-center text-parque-purple mb-20">
            {t.howItWorks.title}
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {t.howItWorks.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-parque-purple text-white rounded-full flex items-center justify-center flex-shrink-0 font-light text-xl">{index + 1}</div>
                  <div>
                    <h3 className="text-2xl font-light text-parque-purple mb-3">{step.title}</h3>
                    <p className="text-gray-600 text-lg font-light leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section id="signup" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-light text-center text-parque-purple mb-8">
              {t.signup.title}
            </h2>
            <p className="text-center text-gray-600 mb-16 text-lg font-light leading-relaxed">
              {t.signup.subtitle}
            </p>
            
            {isSubmitted ? (
              <div className="bg-parque-green/10 border-2 border-parque-green/30 rounded-2xl p-12 text-center">
                <svg className="w-20 h-20 text-parque-green mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-3xl font-light text-parque-purple mb-4">{t.signup.success.title}</h3>
                <p className="text-gray-600 text-lg font-light">{t.signup.success.message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-3">
                    {t.signup.form.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent outline-none transition-all text-lg"
                    placeholder={language === 'es' ? 'Juan García' : 'John Smith'}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-3">
                    {t.signup.form.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent outline-none transition-all text-lg"
                    placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-parque-purple text-white py-5 rounded-xl font-medium text-lg hover:bg-parque-purple/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  {isSubmitting ? t.signup.form.submitting : t.signup.form.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200/50">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p className="font-light">{t.footer}</p>
          </div>
        </div>
      </footer>
    </main>
  )
}