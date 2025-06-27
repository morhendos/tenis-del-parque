import Image from 'next/image'

export default function HeroSection({ content }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-parque-yellow/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="text-center max-w-5xl mx-auto">
          <span className="inline-block bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-8 py-4 rounded-full text-sm font-medium mb-8 animate-fadeInUp shadow-xl">
            {content.badge}
          </span>
          
          {/* Logo */}
          <div className="mb-10 flex justify-center animate-fadeInUp animation-delay-200">
            <div className="relative w-64 h-64 md:w-80 md:h-80 transform hover:scale-105 transition-transform duration-500">
              <Image
                src="/logo.png"
                alt="Tenis del Parque"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-purple/70 mb-8 animate-fadeInUp animation-delay-400">
            {content.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 font-light leading-relaxed animate-fadeInUp animation-delay-600">
            {content.tagline}
          </p>
          
          <a href="#signup" className="inline-block bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-12 py-6 rounded-full text-lg font-medium hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fadeInUp animation-delay-800 group">
            {content.cta}
            <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-24 max-w-4xl mx-auto animate-fadeInUp animation-delay-1000">
            {content.stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-green mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                    {stat.number}
                  </div>
                  <div className="text-xs md:text-sm lg:text-base text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
} 