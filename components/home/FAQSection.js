export default function FAQSection({ content }) {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-white/70 to-transparent relative">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-center text-parque-purple mb-20">
          {content.title}
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {content.items.map((item, index) => (
            <div key={index} className="animate-fadeInUp" style={{animationDelay: `${index * 100}ms`}}>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-medium text-parque-purple mb-3 flex items-start">
                  <span className="text-parque-green mr-3 text-2xl">•</span>
                  {item.q}
                </h3>
                <p className="text-gray-600 leading-relaxed ml-8">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 