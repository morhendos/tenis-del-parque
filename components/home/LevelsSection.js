export default function LevelsSection({ content }) {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-parque-green/5 via-transparent to-parque-purple/5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-parque-purple mb-6">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">{content.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {content.categories.map((level, index) => (
            <div key={index} className="group animate-fadeInUp" style={{animationDelay: `${index * 150}ms`}}>
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 text-center border border-gray-100 hover:border-parque-purple/20 h-full">
                <div className="mb-6">
                  <h3 className="text-3xl font-light text-parque-purple mb-3">{level.name}</h3>
                  <p className="text-parque-green font-medium text-lg">{level.elo}</p>
                </div>
                <p className="text-gray-600 leading-relaxed">{level.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 