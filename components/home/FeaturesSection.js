import Link from 'next/link'

export default function FeaturesSection({ content }) {
  const getIcon = (iconName) => {
    const icons = {
      swiss: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      calendar: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      community: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      ranking: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
    return icons[iconName] || null
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section - More compact on mobile */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-parque-purple mb-3 sm:mb-4 md:mb-6">
            {content.title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-light max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </div>
        
        {/* Features Grid - Optimized for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
          {content.items.map((feature, index) => {
            const isRankingFeature = feature.icon === 'ranking'
            
            const CardContent = () => (
              <div className="
                bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl 
                p-4 sm:p-5 md:p-6 lg:p-8
                shadow-sm hover:shadow-lg
                transform hover:-translate-y-1 
                transition-all duration-300 
                h-full border border-white/50
                group cursor-pointer
              ">
                <div className="flex items-start space-x-3 sm:space-x-0 sm:flex-col">
                  {/* Icon - inline on mobile, stacked on larger screens */}
                  <div className="
                    flex-shrink-0
                    w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 
                    bg-gradient-to-br from-parque-purple/15 to-parque-purple/5 
                    rounded-lg sm:rounded-xl
                    flex items-center justify-center 
                    sm:mb-3 md:mb-4
                    group-hover:scale-105 transition-transform duration-300
                  ">
                    {getIcon(feature.icon)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="
                      text-base sm:text-lg md:text-xl 
                      font-medium text-parque-purple 
                      mb-1 sm:mb-2 md:mb-3
                      group-hover:text-parque-purple/90 transition-colors
                    ">
                      {feature.title}
                    </h3>
                    
                    {/* Description - with better text handling */}
                    <p 
                      className="
                        text-sm sm:text-base 
                        text-gray-600 leading-relaxed
                        line-clamp-3 sm:line-clamp-none
                      "
                      dangerouslySetInnerHTML={{ 
                        __html: isRankingFeature 
                          ? feature.description.replace(/<a[^>]*>.*?<\/a>/gi, '<span class="text-parque-purple font-medium">Learn more about ELO</span>')
                          : feature.description 
                      }} 
                    />
                  </div>
                </div>
              </div>
            )

            return (
              <div 
                key={index} 
                className="animate-fadeInUp" 
                style={{
                  animationDelay: `${Math.min(index * 50, 150)}ms`,
                  animationFillMode: 'both'
                }}
              >
                {isRankingFeature ? (
                  <Link href="/elo" className="block h-full">
                    <CardContent />
                  </Link>
                ) : (
                  <CardContent />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}