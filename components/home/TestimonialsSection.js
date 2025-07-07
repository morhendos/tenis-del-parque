import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function TestimonialsSection({ content, language }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const intervalRef = useRef(null)
  const containerRef = useRef(null)

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % content.items.length)
      }, 5000)
    }
    return () => clearInterval(intervalRef.current)
  }, [currentIndex, isAutoPlaying, content.items.length])

  // Handle touch events for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
    setIsAutoPlaying(false)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % content.items.length)
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + content.items.length) % content.items.length)
    }

    // Resume auto-play after interaction
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  // Generate avatar based on initials
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Color schemes for avatars
  const avatarColors = [
    'from-parque-purple to-parque-purple/70',
    'from-parque-green to-parque-green/70',
    'from-parque-yellow to-parque-yellow/70'
  ]

  return (
    <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-transparent via-parque-bg/30 to-transparent">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-parque-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-parque-green/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-center text-parque-purple mb-12 md:mb-20">
          {content.title}
        </h2>

        {/* Mobile Carousel View */}
        <div className="block md:hidden">
          <div 
            ref={containerRef}
            className="relative px-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overflow-hidden rounded-3xl">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {content.items.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-2">
                    <div className="bg-white rounded-3xl shadow-lg p-6 relative mx-2">
                      {/* Quote Icon */}
                      <div className="absolute -top-4 -left-2 w-12 h-12 bg-parque-purple/10 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-parque-purple/60" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>

                      {/* Avatar */}
                      <div className="flex items-center space-x-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColors[index % 3]} flex items-center justify-center text-white font-semibold text-xl shadow-lg`}>
                          {getInitials(testimonial.author)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-lg">{testimonial.author}</p>
                          <p className="text-sm text-gray-500">{testimonial.level}</p>
                        </div>
                      </div>

                      {/* Testimonial Text */}
                      <p className="text-gray-700 text-base leading-relaxed italic">
                        &ldquo;{testimonial.text}&rdquo;
                      </p>

                      {/* Rating Stars */}
                      <div className="flex space-x-1 mt-4">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-parque-yellow" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-6">
              {content.items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    currentIndex === index 
                      ? 'w-8 h-2 bg-parque-purple rounded-full' 
                      : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-parque-purple to-parque-purple/70 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / content.items.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tablet/Desktop Grid View with Hover Effects */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {content.items.map((testimonial, index) => (
            <div 
              key={index} 
              className="group animate-fadeInUp relative" 
              style={{animationDelay: `${index * 150}ms`}}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 h-full relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-parque-purple/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                
                {/* Quote Icon */}
                <div className="mb-6 relative">
                  <svg className="w-10 h-10 lg:w-12 lg:h-12 text-parque-purple/20 group-hover:text-parque-purple/30 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-8 italic text-base lg:text-lg leading-relaxed relative z-10">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Author Info */}
                <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColors[index % 3]} flex items-center justify-center text-white font-semibold shadow-lg group-hover:scale-110 transition-transform`}>
                      {getInitials(testimonial.author)}
                    </div>
                    <div>
                      <p className="font-medium text-parque-purple text-lg">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.level}</p>
                    </div>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-parque-yellow group-hover:scale-110 transition-transform" style={{transitionDelay: `${i * 50}ms`}} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  )
}