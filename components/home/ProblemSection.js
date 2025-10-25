// Tennis-specific problem icons
const ProblemIcons = {
  NoOpponents: ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" opacity="0.2" />
      <path d="M12 8v4" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
      <path d="M8 4l-4 4m12-4l4 4" strokeLinecap="round" opacity="0.5" />
    </svg>
  ),
  
  Coordination: ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M8 2v4m8-4v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" />
      <path d="M14 16l4 4m0-4l-4 4" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),
  
  NoImprovement: ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h18" />
      <path d="M3 12c0-3 2-5 4-5s4 2 4 5-2 5-4 5-4-2-4-5z" opacity="0.3" />
      <path d="M13 12c0-3 2-5 4-5s4 2 4 5-2 5-4 5-4-2-4-5z" opacity="0.3" />
      <circle cx="7" cy="12" r="1.5" fill="currentColor" />
      <circle cx="17" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  
  NoMotivation: ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" opacity="0.2" />
      <line x1="9" y1="6" x2="15" y2="6" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
};

export default function ProblemSection({ content }) {
  const iconComponents = {
    'No Opponents at Your Level': ProblemIcons.NoOpponents,
    'Sin Rivales de Tu Nivel': ProblemIcons.NoOpponents,
    'Hard to Coordinate Matches': ProblemIcons.Coordination,
    'Difícil Coordinar Partidos': ProblemIcons.Coordination,
    'Your Game Isn\'t Improving': ProblemIcons.NoImprovement,
    'No Mejoras Tu Juego': ProblemIcons.NoImprovement,
    'No Extra Motivation': ProblemIcons.NoMotivation,
    'Sin Motivación Extra': ProblemIcons.NoMotivation
  };

  // Smooth scroll to solution section
  const scrollToSolution = () => {
    const solutionSection = document.getElementById('solution');
    if (solutionSection) {
      solutionSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section id="problem" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
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
          {content.problems.map((problem, index) => {
            const IconComponent = iconComponents[problem.title];
            
            return (
              <div 
                key={index}
                className="group bg-white rounded-xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/0 to-orange-50/0 group-hover:from-red-50/50 group-hover:to-orange-50/30 transition-all duration-300"></div>
                
                <div className="relative z-10">
                  {/* Icon with red/orange theme for problems */}
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {IconComponent ? (
                      <IconComponent className="w-8 h-8 text-red-600" />
                    ) : (
                      <div className="text-3xl">{problem.icon}</div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-red-700 transition-colors">
                    {problem.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
                
                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-200/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            );
          })}
        </div>
        
        {/* Enhanced transition arrow with pulsing animation - NOW CLICKABLE */}
        <div className="flex justify-center mt-16">
          <button
            onClick={scrollToSolution}
            className="relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-parque-purple/50 rounded-full transition-all hover:scale-110"
            aria-label="Scroll to solution section"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-parque-purple/20 to-parque-green/20 rounded-full blur-xl animate-pulse group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-white rounded-full p-4 shadow-lg group-hover:shadow-2xl transition-all">
              <svg 
                className="w-8 h-8 text-parque-purple animate-bounce group-hover:text-parque-green transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
