export default function HowItWorksSection({ content }) {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">{content.subtitle}</p>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {content.steps.map((step, index) => (
              <div key={index} className="flex gap-6 group animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
                <div className="w-14 h-14 bg-gradient-to-br from-parque-purple to-parque-purple/80 text-white rounded-2xl flex items-center justify-center flex-shrink-0 font-medium text-xl shadow-lg group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-parque-purple mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 