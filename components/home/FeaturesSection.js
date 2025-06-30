import Link from 'next/link'

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
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6 md:mb-8">
            {content.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto">{content.subtitle}</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          {content.items.map((feature, index) => {
            const isRankingFeature = feature.icon === 'ranking'
            const cleanDescription = isRankingFeature 
              ? feature.description.replace(/<a[^>]*>.*?<\/a>/gi, 'Learn more about ELO')
              : feature.description

            const CardContent = () => (
              <div className="glass-premium rounded-3xl p-6 md:p-8 hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 h-full relative overflow-hidden hover-lift">
                {/* Modern gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/5 via-transparent to-parque-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Floating orb effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-parque-yellow/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:animate-float transition-opacity duration-700"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-parque-purple/20 to-parque-purple/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative">
                    {/* Icon glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/30 to-parque-green/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      {getIcon(feature.icon)}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-parque-purple mb-3 md:mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-parque-purple group-hover:to-parque-green transition-all duration-500">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed transition-colors duration-500 group-hover:text-gray-700" 
                     dangerouslySetInnerHTML={{ __html: cleanDescription }} />
                </div>
                
                {/* Subtle shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 shimmer rounded-3xl"></div>
                </div>
              </div>
            )

            return (
              <div key={index} className="group animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
                {isRankingFeature ? (
                  <Link href="/elo" className="block">
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
