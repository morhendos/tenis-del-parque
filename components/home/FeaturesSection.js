export default function FeaturesSection({ content }) {
  const getIcon = (iconName) => {
    const icons = {
      swiss: (
        <svg className="w-8 h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      calendar: (
        <svg className="w-8 h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      community: (
        <svg className="w-8 h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      ranking: (
        <svg className="w-8 h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
    return icons[iconName] || null
  }

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent"></div>
      
      {/* Static tennis balls - decorative elements */}
      <div className="absolute top-10 left-[10%] w-12 h-12 tennis-ball opacity-5"></div>
      <div className="absolute bottom-20 right-[15%] w-16 h-16 tennis-ball opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          {/* Tennis ball accent above title */}
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 tennis-ball opacity-20"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6 md:mb-8">
            {content.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto">{content.subtitle}</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          {content.items.map((feature, index) => (
            <div key={index} className="group animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 h-full border border-gray-100 hover:border-parque-purple/20 relative overflow-hidden">
                {/* Tennis net pattern overlay on hover */}
                <div className="absolute inset-0 tennis-net-pattern opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Small tennis ball accent */}
                <div className="absolute -top-4 -right-4 w-12 h-12 tennis-ball opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-parque-purple/20 to-parque-purple/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative">
                    {getIcon(feature.icon)}
                    {/* Small tennis ball indicator on first card */}
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 tennis-ball"></div>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-parque-purple mb-3 md:mb-4">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: feature.description }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}