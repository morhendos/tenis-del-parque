export default function TestimonialsSection({ content }) {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-center text-parque-purple mb-20">
          {content.title}
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {content.items.map((testimonial, index) => (
            <div key={index} className="group animate-fadeInUp" style={{animationDelay: `${index * 150}ms`}}>
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 h-full">
                <div className="mb-8">
                  <svg className="w-12 h-12 text-parque-purple/20 group-hover:text-parque-purple/30 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-8 italic text-lg leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="border-t border-gray-100 pt-6">
                  <p className="font-medium text-parque-purple text-lg">{testimonial.author}</p>
                  <p className="text-sm text-gray-500 mt-1">{testimonial.level}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 