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
              La primera liga de tenis amateur que une pasión, competencia y comunidad. 
              Prepárate para llevar tu juego al siguiente nivel.
            </p>
            
            {/* CTA Button */}
            <a href="#signup" className="inline-block bg-parque-purple text-white px-10 py-5 rounded-full text-lg font-medium hover:bg-parque-purple/90 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Únete a la Liga
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light text-center text-parque-purple mb-20">
            ¿Por qué unirte a nuestra liga?
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-24 h-24 bg-parque-green/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-parque-green/30 transition-colors duration-300">
                <svg className="w-12 h-12 text-parque-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-parque-purple mb-4">Comunidad</h3>
              <p className="text-gray-600 text-lg font-light leading-relaxed">Conoce a otros apasionados del tenis y crea conexiones duraderas</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-parque-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-parque-yellow/30 transition-colors duration-300">
                <svg className="w-12 h-12 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-parque-purple mb-4">Competencia</h3>
              <p className="text-gray-600 text-lg font-light leading-relaxed">Partidos organizados cada semana con jugadores de tu nivel</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-parque-purple/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-parque-purple/30 transition-colors duration-300">
                <svg className="w-12 h-12 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-parque-purple mb-4">Mejora</h3>
              <p className="text-gray-600 text-lg font-light leading-relaxed">Eleva tu juego con competencia regular y feedback constructivo</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-light text-center text-parque-purple mb-20">
            Cómo funciona
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-parque-purple text-white rounded-full flex items-center justify-center flex-shrink-0 font-light text-xl">1</div>
                <div>
                  <h3 className="text-2xl font-light text-parque-purple mb-3">Regístrate</h3>
                  <p className="text-gray-600 text-lg font-light leading-relaxed">Completa el formulario con tu nombre y email. Te contactaremos cuando lancemos la liga.</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-parque-purple text-white rounded-full flex items-center justify-center flex-shrink-0 font-light text-xl">2</div>
                <div>
                  <h3 className="text-2xl font-light text-parque-purple mb-3">Clasificación</h3>
                  <p className="text-gray-600 text-lg font-light leading-relaxed">Jugarás partidos de clasificación para determinar tu nivel y división.</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-parque-purple text-white rounded-full flex items-center justify-center flex-shrink-0 font-light text-xl">3</div>
                <div>
                  <h3 className="text-2xl font-light text-parque-purple mb-3">Compite</h3>
                  <p className="text-gray-600 text-lg font-light leading-relaxed">Partidos semanales contra jugadores de tu nivel. Sube en el ranking y diviértete.</p>
                </div>
              </div>
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
              Reserva tu plaza
            </h2>
            <p className="text-center text-gray-600 mb-16 text-lg font-light leading-relaxed">
              Sé de los primeros en unirte a la Liga de Tenis del Parque en Sotogrande. 
              Las plazas son limitadas para la temporada de prueba.
            </p>
            
            {isSubmitted ? (
              <div className="bg-parque-green/10 border-2 border-parque-green/30 rounded-2xl p-12 text-center">
                <svg className="w-20 h-20 text-parque-green mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-3xl font-light text-parque-purple mb-4">¡Gracias por registrarte!</h3>
                <p className="text-gray-600 text-lg font-light">Te contactaremos pronto con más información sobre el inicio de la liga.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-3">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent outline-none transition-all text-lg"
                    placeholder="Juan García"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-parque-purple focus:border-transparent outline-none transition-all text-lg"
                    placeholder="tu@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-parque-purple text-white py-5 rounded-xl font-medium text-lg hover:bg-parque-purple/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  {isSubmitting ? 'Enviando...' : 'Únete a la lista de espera'}
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
            <p className="font-light">&copy; 2025 Liga de Tenis del Parque - Sotogrande. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}