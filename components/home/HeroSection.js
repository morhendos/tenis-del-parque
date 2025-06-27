import Image from 'next/image'

export default function HeroSection({ content }) {
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
      
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Premium badge with SOLID background */}
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white px-8 py-4 rounded-full text-sm font-medium mb-8 animate-fadeInUp shadow-xl">
            <div className="w-5 h-5 tennis-ball"></div>
            {content.badge}
          </span>
          
          {/* Logo with enhanced hover effects */}
          <div className="mb-10 flex justify-center animate-fadeInUp animation-delay-200">
            <div className="relative w-64 h-64 md:w-80 md:h-80 group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/30 via-transparent to-parque-green/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-110"></div>
              <div className="transform-3d">
                <Image
                  src="/logo.png"
                  alt="Tenis del Parque"
                  fill
                  className="object-contain drop-shadow-2xl relative z-10"
                  priority
                />
              </div>
            </div>
          </div>
          
          {/* Title with animated gradient */}
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple via-parque-purple to-parque-green animate-gradient bg-[length:200%_200%] mb-8 pb-6 animate-fadeInUp animation-delay-400"
            dangerouslySetInnerHTML={{ __html: content.title }}
          />
          
          {/* Tagline with subtle animation */}
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-light leading-relaxed animate-fadeInUp animation-delay-600 mb-12">
            {content.tagline}
          </p>
          
          {/* Enhanced CTA with glow effect */}
          <a href="#signup" className="inline-flex items-center bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white px-12 py-6 rounded-full text-lg font-medium hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fadeInUp animation-delay-800 group relative glow-purple hover:glow">
            <span className="relative z-10">{content.cta}</span>
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 rounded-full shimmer"></div>
            </div>
          </a>
          
          {/* Stats with enhanced glass effect */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-24 max-w-4xl mx-auto animate-fadeInUp animation-delay-1000">
            {content.stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden hover-lift border border-white/50">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/5 to-parque-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="text-3xl md:text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-green mb-2 md:mb-3 group-hover:scale-110 transition-transform relative z-10">
                    {stat.number}
                  </div>
                  <div className="text-xs md:text-sm lg:text-base text-gray-600 font-medium relative z-10">{stat.label}</div>
                  
                  {/* Subtle floating animation on hover */}
                  <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-br from-parque-yellow/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:animate-float transition-opacity duration-500"></div>
                </div>
              </div>
            ))}</div>
        </div>
      </div>
      
      {/* Enhanced scroll indicator with pulse effect */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="relative">
          <div className="absolute inset-0 bg-parque-purple/20 rounded-full blur-lg animate-pulse"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-full p-3 animate-bounce">
            <svg className="w-6 h-6 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
