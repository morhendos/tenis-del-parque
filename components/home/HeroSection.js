import Image from 'next/image'

export default function HeroSection({ content }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background orbs - kept subtle */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-parque-purple/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-parque-green/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-parque-yellow/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Premium badge with tennis ball icon */}
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white px-8 py-4 rounded-full text-sm font-medium mb-8 animate-fadeInUp shadow-xl">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3c-1.5 3-1.5 6 0 9s1.5 6 0 9" />
              <path d="M12 3c1.5 3 1.5 6 0 9s-1.5 6 0 9" />
            </svg>
            {content.badge}
          </span>
          
          {/* Logo with subtle glow */}
          <div className="mb-10 flex justify-center animate-fadeInUp animation-delay-200">
            <div className="relative w-64 h-64 md:w-80 md:h-80 transform hover:scale-105 transition-transform duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/20 to-parque-green/20 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
              <Image
                src="/logo.png"
                alt="Tenis del Parque"
                fill
                className="object-contain drop-shadow-2xl relative z-10"
                priority
              />
            </div>
          </div>
          
          {/* Title - visible with proper gradient */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-purple mb-8 animate-fadeInUp animation-delay-400">
            {content.title}
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-light leading-relaxed animate-fadeInUp animation-delay-600 mb-12">
            {content.tagline}
          </p>
          
          {/* CTA - solid background */}
          <a href="#signup" className="inline-flex items-center bg-gradient-to-r from-parque-purple to-parque-purple/90 text-white px-12 py-6 rounded-full text-lg font-medium hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fadeInUp animation-delay-800 group relative">
            {content.cta}
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          
          {/* Stats with clean design - NO tennis balls */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-24 max-w-4xl mx-auto animate-fadeInUp animation-delay-1000">
            {content.stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-green mb-2 md:mb-3 group-hover:scale-110 transition-transform relative z-10">
                    {stat.number}
                  </div>
                  <div className="text-xs md:text-sm lg:text-base text-gray-600 font-medium relative z-10">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Simple scroll indicator - just an arrow, no tennis ball */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}