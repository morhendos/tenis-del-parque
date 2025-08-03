export const forgotPasswordContent = {
  es: {
    title: 'Restablecer Contraseña',
    subtitle: 'Introduce tu email y te enviaremos un enlace para restablecer tu contraseña',
    form: {
      emailLabel: 'Correo Electrónico',
      emailPlaceholder: 'tu@email.com',
      submit: 'Enviar Enlace de Restablecimiento',
      submitting: 'Enviando...',
      errors: {
        emailRequired: 'El correo electrónico es obligatorio',
        invalidEmail: 'Correo electrónico inválido',
        generic: 'Ocurrió un error. Por favor, inténtalo de nuevo.',
        connection: 'Error de conexión. Por favor, inténtalo de nuevo.'
      }
    },
    backToLogin: 'Volver al inicio de sesión',
    success: {
      title: 'Enlace enviado',
      message: 'Si existe una cuenta con este email, recibirás un enlace para restablecer tu contraseña en unos minutos.',
      checkSpam: 'Revisa tu carpeta de spam si no ves el email.',
      resendLink: 'Reenviar enlace'
    }
  },
  en: {
    title: 'Reset Password',
    subtitle: 'Enter your email and we\'ll send you a link to reset your password',
    form: {
      emailLabel: 'Email Address',
      emailPlaceholder: 'your@email.com',
      submit: 'Send Reset Link',
      submitting: 'Sending...',
      errors: {
        emailRequired: 'Email is required',
        invalidEmail: 'Invalid email address',
        generic: 'An error occurred. Please try again.',
        connection: 'Connection error. Please try again.'
      }
    },
    backToLogin: 'Back to login',
    success: {
      title: 'Link sent',
      message: 'If an account with this email exists, you will receive a password reset link within a few minutes.',
      checkSpam: 'Check your spam folder if you don\'t see the email.',
      resendLink: 'Resend link'
    }
  }
}

export const resetPasswordContent = {
  es: {
    title: 'Nueva Contraseña',
    subtitle: 'Introduce tu nueva contraseña',
    form: {
      passwordLabel: 'Nueva Contraseña',
      passwordPlaceholder: 'Introduce tu nueva contraseña',
      confirmPasswordLabel: 'Confirmar Nueva Contraseña',
      confirmPasswordPlaceholder: 'Confirma tu nueva contraseña',
      submit: 'Actualizar Contraseña',
      submitting: 'Actualizando...',
      errors: {
        passwordRequired: 'La contraseña es obligatoria',
        confirmPasswordRequired: 'La confirmación de contraseña es obligatoria',
        passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
        passwordsMismatch: 'Las contraseñas no coinciden',
        invalidToken: 'El enlace de restablecimiento es inválido o ha expirado',
        generic: 'Ocurrió un error. Por favor, inténtalo de nuevo.',
        connection: 'Error de conexión. Por favor, inténtalo de nuevo.'
      }
    },
    backToLogin: 'Volver al inicio de sesión',
    success: {
      title: 'Contraseña actualizada',
      message: 'Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
      loginButton: 'Iniciar Sesión'
    },
    invalidToken: {
      title: 'Enlace inválido',
      message: 'Este enlace de restablecimiento es inválido o ha expirado.',
      requestNew: 'Solicitar nuevo enlace'
    }
  },
  en: {
    title: 'New Password',
    subtitle: 'Enter your new password',
    form: {
      passwordLabel: 'New Password',
      passwordPlaceholder: 'Enter your new password',
      confirmPasswordLabel: 'Confirm New Password',
      confirmPasswordPlaceholder: 'Confirm your new password',
      submit: 'Update Password',
      submitting: 'Updating...',
      errors: {
        passwordRequired: 'Password is required',
        confirmPasswordRequired: 'Password confirmation is required',
        passwordTooShort: 'Password must be at least 8 characters long',
        passwordsMismatch: 'Passwords do not match',
        invalidToken: 'The reset link is invalid or has expired',
        generic: 'An error occurred. Please try again.',
        connection: 'Connection error. Please try again.'
      }
    },
    backToLogin: 'Back to login',
    success: {
      title: 'Password updated',
      message: 'Your password has been updated successfully. You can now log in with your new password.',
      loginButton: 'Log In'
    },
    invalidToken: {
      title: 'Invalid Link',
      message: 'This reset link is invalid or has expired.',
      requestNew: 'Request new link'
    }
  }
}