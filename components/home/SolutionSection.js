export default function SolutionSection({ content }) {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-gradient-to-br from-parque-purple/5 to-parque-green/5 rounded-xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Icon with gradient background */}
              <div className="w-16 h-16 bg-gradient-to-br from-parque-purple to-parque-green rounded-full flex items-center justify-center text-white text-3xl mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover effect decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-parque-purple/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
        
        {/* Success metrics or social proof */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Sistema probado con jugadores reales en Sotogrande</span>
          </div>
        </div>
      </div>
    </section>
  );
}