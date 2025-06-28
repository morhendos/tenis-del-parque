export default function SignupSection({ content, formData, isSubmitted, isSubmitting, onSubmit, onChange, language, errors = {} }) {
  return (
    <section id="signup" className="py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-72 h-72 sm:w-96 sm:h-96 bg-parque-purple/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-60 h-60 sm:w-72 sm:h-72 bg-parque-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-center text-parque-purple mb-6 sm:mb-8 px-2">
            {content.title}
          </h2>
          <p className="text-center text-gray-600 mb-10 sm:mb-12 md:mb-16 text-base sm:text-lg font-light leading-relaxed px-2">
            {content.subtitle}
          </p>
          
          {isSubmitted ? (
            <div className="bg-gradient-to-br from-parque-green/20 to-parque-green/10 border-2 border-parque-green/30 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center animate-fadeIn mx-2">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-parque-green mx-auto mb-6 sm:mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl sm:text-3xl font-light text-parque-purple mb-3 sm:mb-4">{content.success.title}</h3>
              <p className="text-gray-600 text-base sm:text-lg font-light">{content.success.message}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
              {/* Name Field */}
              <div className="group">
                <label htmlFor="name" className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 px-1">
                  {content.form.name}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  required
                  className={`w-full px-4 py-3 sm:px-6 sm:py-4 border-2 ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-parque-purple/20 focus:border-parque-purple outline-none transition-all text-base sm:text-lg bg-white/80 backdrop-blur-sm min-h-[48px] touch-manipulation`}
                  placeholder={language === 'es' ? 'Juan García' : 'John Smith'}
                />
                {errors.name && <p className="mt-2 text-sm text-red-600 px-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 px-1">
                  {content.form.email}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  required
                  className={`w-full px-4 py-3 sm:px-6 sm:py-4 border-2 ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-parque-purple/20 focus:border-parque-purple outline-none transition-all text-base sm:text-lg bg-white/80 backdrop-blur-sm min-h-[48px] touch-manipulation`}
                  placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600 px-1">{errors.email}</p>}
              </div>

              {/* WhatsApp Field */}
              <div className="group">
                <label htmlFor="whatsapp" className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 px-1">
                  {content.form.whatsapp}
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={onChange}
                  required
                  className={`w-full px-4 py-3 sm:px-6 sm:py-4 border-2 ${errors.whatsapp ? 'border-red-500' : 'border-gray-200'} rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-parque-purple/20 focus:border-parque-purple outline-none transition-all text-base sm:text-lg bg-white/80 backdrop-blur-sm min-h-[48px] touch-manipulation`}
                  placeholder={content.form.whatsappPlaceholder}
                />
                <p className="mt-2 text-xs sm:text-sm text-gray-500 px-1">{content.form.whatsappHelper}</p>
                {errors.whatsapp && <p className="mt-2 text-sm text-red-600 px-1">{errors.whatsapp}</p>}
              </div>

              {/* Level Field - MOBILE OPTIMIZED */}
              <div className="group">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-3 sm:mb-4 px-1">
                  {content.form.level}
                </label>
                <div className="space-y-3">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <label
                      key={level}
                      className={`flex items-start p-3 sm:p-4 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all hover:bg-parque-purple/5 touch-manipulation min-h-[56px] ${
                        formData.level === level
                          ? 'border-parque-purple bg-parque-purple/10'
                          : errors.level ? 'border-red-500' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="level"
                        value={level}
                        checked={formData.level === level}
                        onChange={onChange}
                        className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-parque-purple border-gray-300 focus:ring-parque-purple touch-manipulation"
                      />
                      <span className="ml-3 text-sm sm:text-base leading-relaxed">
                        {content.form.levelOptions[level]}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.level && <p className="mt-2 text-sm text-red-600 px-1">{errors.level}</p>}
              </div>

              {/* Submit Button - MOBILE OPTIMIZED */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-parque-purple to-parque-purple/80 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-medium text-base sm:text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group min-h-[56px] touch-manipulation"
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
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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