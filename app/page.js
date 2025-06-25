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
        <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/10 to-transparent"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="w-48 h-48 md:w-64 md:h-64 relative">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* Flame shape */}
                  <path
                    d="M200 80 C200 80, 240 100, 250 140 C260 180, 250 220, 230 250 C250 220, 260 180, 280 160 C300 140, 310 180, 300 220 C290 260, 260 290, 220 300 C260 280, 280 240, 290 200 C300 160, 280 120, 250 100 C220 80, 200 60, 200 60 C200 60, 180 80, 150 100 C120 120, 100 160, 110 200 C120 240, 140 280, 180 300 C140 290, 110 260, 100 220 C90 180, 100 140, 120 160 C140 180, 150 220, 170 250 C150 220, 140 180, 150 140 C160 100, 200 80, 200 80 Z"
                    fill="#563380"
                    opacity="0.9"
                  />
                  {/* Tennis ball */}
                  <circle cx="200" cy="240" r="60" fill="#E6E94E" />
                  {/* Tennis ball curves */}
                  <path
                    d="M160 240 Q200 220, 240 240"
                    stroke="#563380"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    d="M160 240 Q200 260, 240 240"
                    stroke="#563380"
                    strokeWidth="4"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-parque-purple mb-4">
              TENIS DEL PARQUE
            </h1>
            <p className="text-2xl md:text-3xl text-parque-purple/80 mb-8">
              LIGA DE SOTOGRANDE
            </p>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-12">
              La primera liga de tenis amateur que une pasión, competencia y comunidad. 
              Prepárate para llevar tu juego al siguiente nivel.
            </p>
            
            {/* CTA Button */}
            <a href="#signup" className="inline-block bg-parque-purple text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-parque-purple/90 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
              Únete a la Liga
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-parque-purple mb-16">
            ¿Por qué unirte a nuestra liga?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-parque-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-parque-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-parque-purple mb-2">Comunidad</h3>
              <p className="text-gray-600">Conoce a otros apasionados del tenis y crea conexiones duraderas</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-parque-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-parque-purple mb-2">Competencia</h3>
              <p className="text-gray-600">Partidos organizados cada semana con jugadores de tu nivel</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-parque-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-parque-purple mb-2">Mejora</h3>
              <p className="text-gray-600">Eleva tu juego con competencia regular y feedback constructivo</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-parque-purple mb-16">
            Cómo funciona
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-parque-purple text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-parque-purple mb-2">Regístrate</h3>
                  <p className="text-gray-600">Completa el formulario con tu nombre y email. Te contactaremos cuando lancemos la liga.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-parque-purple text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-parque-purple mb-2">Clasificación</h3>
                  <p className="text-gray-600">Jugarás partidos de clasificación para determinar tu nivel y división.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-parque-purple text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-parque-purple mb-2">Compite</h3>
                  <p className="text-gray-600">Partidos semanales contra jugadores de tu nivel. Sube en el ranking y diviértete.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section id="signup" className="py-16 md:py-24 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-parque-purple mb-8">
              Reserva tu plaza
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Sé de los primeros en unirte a la Liga de Tenis del Parque en Sotogrande. 
              Las plazas son limitadas para la temporada de prueba.
            </p>
            
            {isSubmitted ? (
              <div className="bg-parque-green/20 border border-parque-green rounded-lg p-8 text-center">
                <svg className="w-16 h-16 text-parque-green mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-semibold text-parque-purple mb-2">¡Gracias por registrarte!</h3>
                <p className="text-gray-600">Te contactaremos pronto con más información sobre el inicio de la liga.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent outline-none transition"
                    placeholder="Juan García"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-parque-purple focus:border-transparent outline-none transition"
                    placeholder="tu@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-parque-purple text-white py-4 rounded-lg font-semibold hover:bg-parque-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  {isSubmitting ? 'Enviando...' : 'Únete a la lista de espera'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 Liga de Tenis del Parque - Sotogrande. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}