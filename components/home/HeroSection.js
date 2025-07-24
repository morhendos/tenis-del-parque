import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection({ content }) {
  const scrollToFeatures = (e) => {
    e.preventDefault()
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
      
      <div className="container mx-auto px-4 relative z-10 py-8 sm:py-12">
        <div className="text-center max-w-5xl mx-auto">
          {/* Premium badge with SOLID background - SMALLER ON MOBILE */}
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fadeInUp shadow-xl">
            <div className="w-4 h-4 sm:w-5 sm:h-5 "></div>
            {content.badge}
          </span>
          
          {/* Logo - RESPONSIVE SIZING */}
          <div className="mb-6 sm:mb-8 md:mb-10 flex justify-center animate-fadeInUp animation-delay-200">
            <div 
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] group cursor-pointer"
              onClick={() => {
                // Scroll to show the bottom of hero section (stats area)
                const heroSection = document.querySelector('section')
                if (heroSection) {
                  const heroHeight = heroSection.offsetHeight
                  const viewportHeight = window.innerHeight
                  const scrollTarget = heroHeight - viewportHeight + 100 // +100px padding to ensure stats are fully visible
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
                  src="/logo.png"
                  alt="Tenis del Parque"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                  sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, (max-width: 1024px) 384px, (max-width: 1280px) 448px, 512px"
                />
              </div>
            </div>
          </div>
          
          {/* Title - BETTER MOBILE SIZING */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-4 sm:mb-6 animate-fadeInUp animation-delay-400"
            dangerouslySetInnerHTML={{ __html: content.title }}
          />
          
          {/* Tagline - BETTER MOBILE SIZING */}
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto font-light leading-relaxed animate-fadeInUp animation-delay-600 mb-6 sm:mb-8 md:mb-10 px-2">
            {content.tagline}
          </p>
          
          {/* Enhanced CTA - MOBILE OPTIMIZED */}
          <Link href="/rules" className="inline-flex items-center bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-full text-base sm:text-lg font-medium hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fadeInUp animation-delay-800 group relative min-h-[48px] touch-manipulation overflow-hidden">
            <span className="relative z-10">{content.cta}</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {/* Glow effect - contained within button */}
            <div className="absolute inset-0 rounded-full glow-purple group-hover:glow transition-all duration-150"></div>
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-100">
              <div className="absolute inset-0 rounded-full shimmer"></div>
            </div>
          </Link>
          
          {/* Stats - MOBILE RESPONSIVE */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-12 sm:mt-16 md:mt-24 lg:mt-32 max-w-4xl mx-auto animate-fadeInUp animation-delay-1000">
            {content.stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden hover-lift border border-white/50">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/5 to-parque-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-green mb-1 md:mb-2 group-hover:scale-110 transition-transform relative z-10">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium relative z-10 leading-tight">{stat.label}</div>
                  
                  {/* Subtle floating animation on hover */}
                  <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-br from-parque-yellow/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:animate-float transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Enhanced scroll indicator - MOBILE SIZED */}
          <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20 flex justify-center">
            <button onClick={scrollToFeatures} className="relative inline-block group touch-manipulation">
              <div className="absolute inset-0 bg-parque-purple/20 rounded-full blur-lg animate-pulse scale-150"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-full p-2 sm:p-3 animate-bounce cursor-pointer hover:bg-white transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}