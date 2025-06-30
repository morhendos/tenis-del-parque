import Link from 'next/link'
import { useState } from 'react'

export default function FeaturesSection({ content }) {
  // Track which card is active on mobile (for tap interactions)
  const [activeCard, setActiveCard] = useState(null)
  
  const getIcon = (iconName) => {
    const icons = {
      swiss: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      calendar: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      community: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      ranking: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-parque-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
    return icons[iconName] || null
  }

  const handleCardClick = (index) => {
    // Toggle active card on mobile
    setActiveCard(activeCard === index ? null : index)
  }

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle gradient overlay - lighter on mobile for better performance */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 sm:from-white/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section - Optimized for mobile */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-4 sm:mb-6 md:mb-8 leading-tight">
            {content.title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto px-4 sm:px-0">
            {content.subtitle}
          </p>
        </div>
        
        {/* Features Grid - Single column on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
          {content.items.map((feature, index) => {
            const isRankingFeature = feature.icon === 'ranking'
            const cleanDescription = isRankingFeature 
              ? feature.description.replace(/<a[^>]*>.*?<\/a>/gi, 'Learn more about ELO')
              : feature.description
            const isActive = activeCard === index

            const CardContent = () => (
              <div 
                className={`
                  glass-premium rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 
                  transition-all duration-300 h-full relative overflow-hidden
                  ${isActive ? 'shadow-xl sm:shadow-2xl transform -translate-y-1 sm:-translate-y-2' : 'shadow-md'}
                  md:hover:shadow-2xl md:hover:-translate-y-3
                  cursor-pointer md:cursor-default
                  mobile-card-active
                `}
                onClick={() => handleCardClick(index)}
              >
                {/* Simplified gradient overlay for mobile */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br from-parque-purple/5 via-transparent to-parque-green/5 
                  transition-opacity duration-500
                  ${isActive ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}
                `}></div>
                
                {/* Simplified floating orb for mobile */}
                <div className={`
                  absolute -top-10 -right-10 w-24 sm:w-32 h-24 sm:h-32 
                  bg-gradient-to-br from-parque-yellow/10 to-transparent rounded-full blur-2xl 
                  transition-opacity duration-500
                  ${isActive ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}
                `}></div>
                
                <div className="relative z-10">
                  {/* Icon container - smaller on mobile */}
                  <div className={`
                    w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 
                    bg-gradient-to-br from-parque-purple/20 to-parque-purple/10 
                    rounded-2xl flex items-center justify-center 
                    mb-4 sm:mb-5 md:mb-6 
                    transition-all duration-300
                    ${isActive ? 'scale-110 rotate-3' : 'md:group-hover:scale-110 md:group-hover:rotate-3'}
                  `}>
                    {/* Simplified icon glow for mobile */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-br from-parque-purple/30 to-parque-green/30 
                      rounded-2xl blur-xl transition-opacity duration-300
                      ${isActive ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}
                    `}></div>
                    <div className="relative z-10">
                      {getIcon(feature.icon)}
                    </div>
                  </div>
                  
                  {/* Title - responsive text size */}
                  <h3 className={`
                    text-base sm:text-lg md:text-xl font-medium text-parque-purple 
                    mb-2 sm:mb-3 md:mb-4 transition-all duration-300
                    ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-parque-purple to-parque-green' : 
                      'md:group-hover:text-transparent md:group-hover:bg-clip-text md:group-hover:bg-gradient-to-r md:group-hover:from-parque-purple md:group-hover:to-parque-green'}
                  `}>
                    {feature.title}
                  </h3>
                  
                  {/* Description - responsive text and line height */}
                  <p 
                    className={`
                      text-sm sm:text-base text-gray-600 leading-relaxed transition-colors duration-300
                      ${isActive ? 'text-gray-700' : 'md:group-hover:text-gray-700'}
                    `}
                    dangerouslySetInnerHTML={{ __html: cleanDescription }} 
                  />
                  
                  {/* Mobile tap indicator */}
                  <div className={`
                    md:hidden absolute bottom-2 right-2 w-6 h-6 
                    flex items-center justify-center rounded-full
                    bg-parque-purple/10 transition-all duration-300
                    ${isActive ? 'opacity-0' : 'opacity-100'}
                  `}>
                    <svg className="w-4 h-4 text-parque-purple/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                
                {/* Removed complex shimmer effect for better mobile performance */}
              </div>
            )

            return (
              <div 
                key={index} 
                className="group animate-fadeInUp touch-manipulation" 
                style={{
                  animationDelay: `${Math.min(index * 100, 300)}ms`,
                  animationFillMode: 'both'
                }}
              >
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
        
        {/* Mobile swipe hint */}
        <p className="md:hidden text-center text-sm text-gray-500 mt-6">
          Tap on cards to explore features
        </p>
      </div>
      
      {/* Add mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-card-active {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
          
          /* Ensure smooth scrolling on mobile */
          .container {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Optimize animations for mobile */
          @media (prefers-reduced-motion: reduce) {
            .animate-fadeInUp {
              animation: none;
              opacity: 1;
            }
          }
        }
      `}</style>
    </section>
  )
}