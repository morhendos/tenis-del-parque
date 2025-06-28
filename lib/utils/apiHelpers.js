// API Response utility for consistent API responses

export const apiResponse = {
  success: (data = {}, statusCode = 200) => {
    return Response.json(
      {
        success: true,
        ...data
      },
      { status: statusCode }
    )
  },

  error: (message, statusCode = 400, additionalData = {}) => {
    return Response.json(
      {
        success: false,
        error: message,
        ...additionalData
      },
      { status: statusCode }
    )
  },

  validationError: (errors, language = 'en') => {
    const message = language === 'es' 
      ? 'Error de validación' 
      : 'Validation error'
    
    return Response.json(
      {
        success: false,
        error: message,
        errors: Array.isArray(errors) ? errors : [errors]
      },
      { status: 400 }
    )
  },

  serverError: (language = 'en') => {
    const message = language === 'es'
      ? 'Error interno del servidor. Por favor, inténtalo más tarde.'
      : 'Internal server error. Please try again later.'
    
    return Response.json(
      {
        success: false,
        error: message
      },
      { status: 500 }
    )
  }
}

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  // Basic international phone validation
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/
  return phoneRegex.test(phone)
}

export const validatePlayerLevel = (level) => {
  const validLevels = ['beginner', 'intermediate', 'advanced']
  return validLevels.includes(level)
}