import Image from 'next/image'

export default function HeroSection({ content }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden tennis-ball-pattern">
      {/* Animated background shapes with tennis theme */}
      <div className="absolute inset-0">
        {/* Tennis ball floating animation */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-[#DFEF87] to-[#C5D560] rounded-full shadow-xl animate-tennis-bounce opacity-20"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-br from-[#DFEF87] to-[#C5D560] rounded-full shadow-lg animate-tennis-bounce animation-delay-500 opacity-15"></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-[#DFEF87] to-[#C5D560] rounded-full shadow-xl animate-tennis-bounce animation-delay-1000 opacity-10"></div>
        
        {/* Original gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-parque-yellow/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Tennis court lines pattern */}
        <div className="absolute inset-0 court-lines-pattern opacity-5"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Premium badge with tennis ball icon */}
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-8 py-4 rounded-full text-sm font-medium mb-8 animate-fadeInUp shadow-xl glass-premium">
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
          
          {/* Title with enhanced gradient */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-parque-purple via-parque-purple/80 to-parque-green mb-8 animate-fadeInUp animation-delay-400 animate-gradient">
            {content.title}
          </h1>
          
          {/* Tagline with tennis net divider */}
          <div className="relative mb-12">
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-light leading-relaxed animate-fadeInUp animation-delay-600 relative z-10">
              {content.tagline}
            </p>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          
          {/* CTA with tennis ball bounce effect */}
          <a href="#signup" className="inline-flex items-center bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white px-12 py-6 rounded-full text-lg font-medium hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fadeInUp animation-delay-800 group glass-premium">
            {content.cta}
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {/* Small tennis ball that bounces on hover */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-[#DFEF87] to-[#C5D560] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-tennis-bounce transition-opacity duration-300"></div>
          </a>
          
          {/* Stats with tennis-themed design */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-24 max-w-4xl mx-auto animate-fadeInUp animation-delay-1000">
            {content.stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 tennis-net-pattern relative overflow-hidden">
                  {/* Tennis ball accent */}
                  <div className={`absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-[#DFEF87] to-[#C5D560] rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${index === 1 ? 'animate-float' : ''}`}></div>
                  
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
      
      {/* Enhanced scroll indicator with tennis ball */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="relative">
          {/* Tennis ball as scroll indicator */}
          <div className="w-8 h-8 bg-gradient-to-br from-[#DFEF87] to-[#C5D560] rounded-full shadow-lg animate-bounce">
            <div className="absolute inset-0 rounded-full tennis-ball-texture opacity-30"></div>
          </div>
          <svg className="w-6 h-6 text-gray-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}