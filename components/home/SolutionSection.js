// Tennis-specific solution icons
const SolutionIcons = {
  PerfectMatching: ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Target/Bullseye */}
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      {/* Checkmark overlay */}
      <path d="M8 12l2 2 4-4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  ),
  
  RealCommunity: ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Three people */}
      <circle cx="12" cy="8" r="3" />
      <circle cx="6" cy="8" r="2.5" opacity="0.6" />
      <circle cx="18" cy="8" r="2.5" opacity="0.6" />
      <path d="M12 14c-3 0-5.5 1.5-5.5 3.5v2.5h11v-2.5c0-2-2.5-3.5-5.5-3.5z" />
      <path d="M6 13c-2 0-3.5 1-3.5 2.5V17h3" opacity="0.6" />
      <path d="M18 13c2 0 3.5 1 3.5 2.5V17h-3" opacity="0.6" />
    </svg>
  ),
  
  VisibleProgress: ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Upward trending chart */}
      <path d="M3 17l4-4 4 4 6-6 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 7v8h-8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Base line */}
      <line x1="3" y1="20" x2="21" y2="20" strokeWidth="1" opacity="0.3" />
      {/* Dots on chart */}
      <circle cx="7" cy="13" r="1.5" fill="currentColor" />
      <circle cx="11" cy="17" r="1.5" fill="currentColor" />
      <circle cx="17" cy="11" r="1.5" fill="currentColor" />
      <circle cx="21" cy="15" r="1.5" fill="currentColor" />
    </svg>
  ),
  
  Flexible: ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Calendar with clock */}
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
      {/* Clock in center */}
      <circle cx="12" cy="15" r="4" strokeWidth="1.5" />
      <path d="M12 13v2l1.5 1.5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
};

export default function SolutionSection({ content }) {
  const iconComponents = {
    'Emparejamiento Perfecto': SolutionIcons.PerfectMatching,
    'Perfect Matching': SolutionIcons.PerfectMatching,
    'Comunidad Real': SolutionIcons.RealCommunity,
    'Real Community': SolutionIcons.RealCommunity,
    'Progreso Visible': SolutionIcons.VisibleProgress,
    'Visible Progress': SolutionIcons.VisibleProgress,
    'Flexible y Sin Estrés': SolutionIcons.Flexible,
    'Flexible and Stress-Free': SolutionIcons.Flexible
  };

  return (
    <section id="solution" className="py-20 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {content.features.map((feature, index) => {
            const IconComponent = iconComponents[feature.title];
            
            return (
              <div 
                key={index}
                className="group bg-white rounded-xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
              >
                {/* Gradient overlay on hover - purple/green theme */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-green-50/0 group-hover:from-purple-50/50 group-hover:to-green-50/30 transition-all duration-300"></div>
                
                <div className="relative z-10">
                  {/* Icon with purple/green gradient for solutions */}
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                    {IconComponent ? (
                      <IconComponent className="w-8 h-8 text-purple-600" />
                    ) : (
                      <div className="text-3xl">{feature.icon}</div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Corner decoration - success colors */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Success checkmark that appears on hover */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                  <svg className="w-12 h-12 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
