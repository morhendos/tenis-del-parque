export default function SignupSection({ content, formData, isSubmitted, isSubmitting, onSubmit, onChange, language }) {
  return (
    <section id="signup" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-center text-parque-purple mb-8">
            {content.title}
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg font-light leading-relaxed">
            {content.subtitle}
          </p>
          
          {isSubmitted ? (
            <div className="bg-gradient-to-br from-parque-green/20 to-parque-green/10 border-2 border-parque-green/30 rounded-3xl p-16 text-center animate-fadeIn">
              <svg className="w-24 h-24 text-parque-green mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-3xl font-light text-parque-purple mb-4">{content.success.title}</h3>
              <p className="text-gray-600 text-lg font-light">{content.success.message}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="group">
                <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-3">
                  {content.form.name}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  required
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-parque-purple/20 focus:border-parque-purple outline-none transition-all text-lg bg-white/80 backdrop-blur-sm"
                  placeholder={language === 'es' ? 'Juan García' : 'John Smith'}
                />
              </div>
              <div className="group">
                <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-3">
                  {content.form.email}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  required
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-parque-purple/20 focus:border-parque-purple outline-none transition-all text-lg bg-white/80 backdrop-blur-sm"
                  placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white py-5 rounded-2xl font-medium text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {content.form.submitting}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {content.form.submit}
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
} 