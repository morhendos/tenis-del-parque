import Image from 'next/image'
import Link from 'next/link'

export default function EmotionalHeroSection({ content, locale }) {
  const scrollToFeatures = (e) => {
    e.preventDefault()
    const problemSection = document.getElementById('problem')
    if (problemSection) {
      problemSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced gradient background with animated orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-parque-purple/10 to-transparent rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-parque-green/10 to-transparent rounded-full blur-3xl animate-blob animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-parque-yellow/5 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      {/* Subtle animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle particle-1 absolute top-10 left-[10%] w-2 h-2 bg-parque-purple/20 rounded-full"></div>
        <div className="particle particle-2 absolute top-20 right-[20%] w-3 h-3 bg-parque-green/20 rounded-full"></div>
        <div className="particle particle-3 absolute bottom-40 left-[30%] w-2 h-2 bg-parque-yellow/20 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-4 sm:py-6">
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo - BALANCED SIZING */}
          <div className="mb-4 sm:mb-5 flex justify-center animate-fadeInUp">
            <div 
              className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] group cursor-pointer"
              onClick={() => {
                // Scroll to show the bottom of hero section
                const heroSection = document.querySelector('section')
                if (heroSection) {
                  const heroHeight = heroSection.offsetHeight
                  const viewportHeight = window.innerHeight
                  const scrollTarget = heroHeight - viewportHeight + 100
                  window.scrollTo({ 
                    top: Math.max(0, scrollTarget), 
                    behavior: 'smooth' 
                  })
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/30 via-transparent to-parque-green/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-105"></div>
              <div className="relative w-full h-full transform transition-all duration-500 ease-out group-hover:scale-105">
                <Image
                  src="/logo-liga-costa-del-sol-big.webp"
                  alt="Tenis del Parque"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                  sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, (max-width: 1024px) 320px, (max-width: 1280px) 384px, 448px"
                />
              </div>
            </div>
          </div>
          
          {/* Primary CTA - Directly under logo - COMPACT */}
          <div className="mb-8 sm:mb-10 md:mb-12 animate-fadeInUp animation-delay-400">
            <a
              href="#cities"
              className="inline-flex items-center bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-4 rounded-full text-base sm:text-lg md:text-xl font-medium hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group relative min-h-[48px] touch-manipulation overflow-hidden"
            >
              <span className="relative z-10">{content.hero.cta.primary}</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {/* Glow effect - contained within button */}
              <div className="absolute inset-0 rounded-full glow-purple group-hover:glow transition-all duration-150"></div>
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-10">
                <div className="absolute inset-0 rounded-full shimmer"></div>
              </div>
            </a>
          </div>
          
          {/* Title - After CTA - SMALLER */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-parque-purple mb-3 sm:mb-4 animate-fadeInUp animation-delay-600 leading-tight">
            {content.hero.title}
          </h1>
          
          {/* Tagline - COMPACT */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto font-light leading-snug animate-fadeInUp animation-delay-800 mb-5 sm:mb-6 px-4">
            {content.hero.subtitle}
          </p>
          
          {/* Secondary CTA as subtle text link - COMPACT */}
          <div className="animate-fadeInUp animation-delay-1000 mb-6 sm:mb-8">
            <button
              onClick={scrollToFeatures}
              className="text-parque-purple text-sm sm:text-base font-medium hover:text-parque-purple/80 transition-colors group"
            >
              <span className="border-b-2 border-parque-purple/30 group-hover:border-parque-purple/60 transition-colors pb-1">
                {content.hero.cta.secondary}
              </span>
            </button>
          </div>
          
          {/* Enhanced scroll indicator - COMPACT */}
          <div className="mt-4 sm:mt-6 flex justify-center">
            <button onClick={scrollToFeatures} className="relative inline-block group touch-manipulation">
              <div className="absolute inset-0 bg-parque-purple/20 rounded-full blur-lg animate-pulse scale-150"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-full p-2 animate-bounce cursor-pointer hover:bg-white transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Add all the animations and effects from Sotogrande */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
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
        
        .animate-blob {
          animation: blob 20s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
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
        .animation-delay-2000 { animation-delay: 2000ms; }
        
        .glow-purple {
          box-shadow: 0 0 20px rgba(86, 51, 128, 0.3);
          opacity: 0;
          transition: opacity 0.15s ease-out;
        }
        
        .group:hover .glow-purple {
          opacity: 1;
          box-shadow: 0 0 30px rgba(86, 51, 128, 0.5);
        }
        
        .shimmer {
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255, 255, 255, 0.5) 50%,
            transparent 60%
          );
          transform: translateX(-100%);
          transition: transform 0.6s ease-out;
        }
        
        .group:hover .shimmer {
          transform: translateX(100%);
        }
        
        .particle {
          animation: float 10s ease-in-out infinite;
        }
        
        .particle-1 { animation-delay: 0s; }
        .particle-2 { animation-delay: 3s; }
        .particle-3 { animation-delay: 6s; }
      `}</style>
    </section>
  )
}