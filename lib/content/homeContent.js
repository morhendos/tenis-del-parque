export const homeContent = {
  es: {
    nav: {
      home: 'Inicio',
      rules: 'Reglamento',
      elo: 'Sistema ELO',
      about: 'Acerca de',
      contact: 'Contacto'
    },
    hero: {
      badge: 'Temporada de verano 2025',
      title: 'Compite. Mejora. Disfruta.',
      tagline: 'La primera liga de tenis amateur en Sotogrande que combina competición seria con ambiente social.',
      cta: 'Únete a la Liga',
      stats: [
        { number: '8', label: 'Rondas por temporada' },
        { number: '3', label: 'Niveles de juego' },
        { number: '€0', label: 'Primera temporada' }
      ]
    },
    features: {
      title: '¿Por qué Tenis del Parque?',
      subtitle: 'Un sistema probado que funciona para jugadores amateur',
      items: [
        {
          title: 'Sistema Suizo',
          description: 'Juega contra oponentes de tu nivel. El sistema se ajusta automáticamente.',
          icon: 'swiss'
        },
        {
          title: 'Flexibilidad Total',
          description: 'Tú eliges cuándo jugar. Sistema de "wild cards" para máxima flexibilidad.',
          icon: 'calendar'
        },
        {
          title: 'Comunidad Local',
          description: 'Conoce a otros jugadores de Sotogrande. Eventos sociales incluidos.',
          icon: 'community'
        },
        {
          title: 'Rankings en Vivo',
          description: 'Sigue tu progreso con nuestro sistema de ranking Elo en tiempo real. <a href="/elo" class="text-parque-purple underline hover:text-parque-purple/80">Aprende más sobre ELO</a>',
          icon: 'ranking'
        }
      ]
    },
    howItWorks: {
      title: 'Cómo funciona',
      subtitle: 'Simple, flexible y diseñado para ti',
      steps: [
        {
          title: 'Inscríbete',
          description: 'Elige tu nivel: principiante, intermedio o avanzado. Gratis para la primera temporada.'
        },
        {
          title: 'Recibe tu emparejamiento',
          description: 'Cada domingo recibirás tu oponente para la semana. Contacta y acuerda el horario.'
        },
        {
          title: 'Juega tu partido',
          description: '2 sets + super tie-break si es necesario. Reserva la pista y divide los costos.'
        },
        {
          title: 'Reporta resultados',
          description: 'Sube los resultados en nuestra plataforma. Tu ranking se actualiza automáticamente.'
        }
      ]
    },
    levels: {
      title: 'Encuentra tu nivel',
      subtitle: 'Tres categorías para asegurar partidos equilibrados',
      categories: [
        {
          name: 'Principiante',
          elo: 'Elo 0-1199',
          description: 'Perfecto para jugadores casuales y aquellos retomando el tenis.'
        },
        {
          name: 'Intermedio',
          elo: 'Elo 1200-1299',
          description: 'Para jugadores regulares con técnica sólida buscando mejorar.'
        },
        {
          name: 'Avanzado',
          elo: 'Elo 1300+',
          description: 'Jugadores experimentados buscando competición seria.'
        }
      ]
    },
    platformPreview: {
      title: 'Descubre la Plataforma',
      subtitle: 'Todo lo que necesitas en un solo lugar',
      tabs: [
        { name: 'Clasificación', id: 'standings' },
        { name: 'Rankings', id: 'rankings' },
        { name: 'Resultados', id: 'results' },
        { name: 'Próximos', id: 'upcoming' },
        { name: 'Estadísticas', id: 'statistics' },
        { name: 'Bracket', id: 'bracket' }
      ]
    },
    testimonials: {
      title: 'Lo que dicen nuestros jugadores',
      items: [
        {
          text: 'La flexibilidad es perfecta para mi agenda. Puedo jugar cuando me conviene.',
          author: 'Carlos M.',
          level: 'Nivel Intermedio'
        },
        {
          text: 'He conocido a grandes jugadores y amigos. Es más que solo tenis.',
          author: 'Ana S.',
          level: 'Nivel Principiante'
        },
        {
          text: 'El sistema de ranking me motiva a mejorar cada semana. ¡Excelente concepto!',
          author: 'James W.',
          level: 'Nivel Avanzado'
        }
      ]
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          q: '¿Qué incluye la inscripción?',
          a: '8 rondas de competición, acceso a la plataforma, rankings en vivo, y eventos sociales de la liga. ¡La primera temporada es totalmente gratis!'
        },
        {
          q: '¿Quién paga las pistas?',
          a: 'Los jugadores dividen el costo de la pista 50/50. Puedes elegir cualquier club en Sotogrande.'
        },
        {
          q: '¿Qué pasa si no puedo jugar una semana?',
          a: 'Usa una de tus 4 "wild cards" para posponer el partido o sáltate la ronda.'
        },
        {
          q: '¿Hay playoffs?',
          a: 'Sí, los mejores 8 jugadores de cada categoría avanzan a los playoffs al final de la temporada.'
        }
      ]
    },
    signup: {
      title: 'Únete a la temporada inaugural',
      subtitle: 'Plazas limitadas para la temporada de verano 2025. Sé parte de algo especial desde el principio. ¡Primera temporada gratis!',
      form: {
        name: 'Nombre completo',
        email: 'Email',
        whatsapp: 'WhatsApp',
        whatsappPlaceholder: '+34 600 000 000',
        whatsappHelper: 'Lo usaremos para comunicaciones de la liga',
        level: 'Nivel de juego',
        levelOptions: {
          beginner: 'Principiante - Soy nuevo o juego ocasionalmente',
          intermediate: 'Intermedio - Juego regularmente y conozco lo básico',
          advanced: 'Avanzado - Tengo técnica sólida y experiencia en competición'
        },
        submit: 'Reservar mi plaza',
        submitting: 'Enviando...',
        errors: {
          required: 'Este campo es obligatorio',
          invalidEmail: 'Por favor, introduce un email válido',
          invalidPhone: 'Por favor, introduce un número válido',
          alreadyRegistered: 'Este email ya está registrado'
        }
      },
      success: {
        title: '¡Bienvenido a la Liga!',
        message: 'Te contactaremos pronto con los detalles de inscripción.'
      }
    },
    footer: {
      copyright: '© 2025 Tenis del Parque - Sotogrande. Todos los derechos reservados.',
      links: {
        rules: 'Reglamento',
        privacy: 'Privacidad',
        terms: 'Términos',
        contact: 'Contacto'
      }
    }
  },
  en: {
    nav: {
      home: 'Home',
      rules: 'Rules',
      elo: 'ELO System',
      about: 'About',
      contact: 'Contact'
    },
    hero: {
      badge: 'Summer Season 2025',
      title: 'Play. Progress. Enjoy.',
      tagline: 'The first amateur tennis league in Sotogrande combining serious competition with social atmosphere.',
      cta: 'Join the League',
      stats: [
        { number: '8', label: 'Rounds per season' },
        { number: '3', label: 'Playing levels' },
        { number: '€0', label: 'First season' }
      ]
    },
    features: {
      title: 'Why Tenis del Parque?',
      subtitle: 'A proven system that works for amateur players',
      items: [
        {
          title: 'Swiss System',
          description: 'Play against opponents at your level. The system adjusts automatically.',
          icon: 'swiss'
        },
        {
          title: 'Total Flexibility',
          description: 'You choose when to play. Wild card system for maximum flexibility.',
          icon: 'calendar'
        },
        {
          title: 'Local Community',
          description: 'Meet other Sotogrande players. Social events included.',
          icon: 'community'
        },
        {
          title: 'Live Rankings',
          description: 'Track your progress with our real-time Elo ranking system. <a href="/elo" class="text-parque-purple underline hover:text-parque-purple/80">Learn more about ELO</a>',
          icon: 'ranking'
        }
      ]
    },
    howItWorks: {
      title: 'How it works',
      subtitle: 'Simple, flexible, and designed for you',
      steps: [
        {
          title: 'Sign up',
          description: 'Choose your level: beginner, intermediate, or advanced. Free for the first season.'
        },
        {
          title: 'Get matched',
          description: 'Every Sunday receive your opponent for the week. Contact and agree on time.'
        },
        {
          title: 'Play your match',
          description: '2 sets + super tie-break if needed. Book the court and split costs.'
        },
        {
          title: 'Report results',
          description: 'Upload results on our platform. Your ranking updates automatically.'
        }
      ]
    },
    levels: {
      title: 'Find your level',
      subtitle: 'Three categories to ensure balanced matches',
      categories: [
        {
          name: 'Beginner',
          elo: 'Elo 0-1199',
          description: 'Perfect for casual players and those getting back into tennis.'
        },
        {
          name: 'Intermediate',
          elo: 'Elo 1200-1299',
          description: 'For regular players with solid technique looking to improve.'
        },
        {
          name: 'Advanced',
          elo: 'Elo 1300+',
          description: 'Experienced players seeking serious competition.'
        }
      ]
    },
    platformPreview: {
      title: 'Discover the Platform',
      subtitle: 'Everything you need in one place',
      tabs: [
        { name: 'Standings', id: 'standings' },
        { name: 'Rankings', id: 'rankings' },
        { name: 'Results', id: 'results' },
        { name: 'Upcoming', id: 'upcoming' },
        { name: 'Statistics', id: 'statistics' },
        { name: 'Bracket', id: 'bracket' }
      ]
    },
    testimonials: {
      title: 'What our players say',
      items: [
        {
          text: 'The flexibility is perfect for my schedule. I can play when it suits me.',
          author: 'Carlos M.',
          level: 'Intermediate Level'
        },
        {
          text: "I've met great players and friends. It's more than just tennis.",
          author: 'Ana S.',
          level: 'Beginner Level'
        },
        {
          text: 'The ranking system motivates me to improve every week. Excellent concept!',
          author: 'James W.',
          level: 'Advanced Level'
        }
      ]
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          q: "What's included in registration?",
          a: '8 rounds of competition, platform access, live rankings, and league social events. The first season is completely free!'
        },
        {
          q: 'Who pays for courts?',
          a: 'Players split court costs 50/50. You can choose any club in Sotogrande.'
        },
        {
          q: "What if I can't play one week?",
          a: 'Use one of your 4 wild cards to postpone the match or skip the round.'
        },
        {
          q: 'Are there playoffs?',
          a: 'Yes, the top 8 players in each category advance to playoffs at season end.'
        }
      ]
    },
    signup: {
      title: 'Join the inaugural season',
      subtitle: 'Limited spots for Summer 2025 season. Be part of something special from the beginning. First season free!',
      form: {
        name: 'Full name',
        email: 'Email',
        whatsapp: 'WhatsApp',
        whatsappPlaceholder: '+34 600 000 000',
        whatsappHelper: "We'll use this for league communications",
        level: 'Playing level',
        levelOptions: {
          beginner: "Beginner - I'm new to tennis or play occasionally",
          intermediate: "Intermediate - I play regularly and know the basics",
          advanced: "Advanced - I have strong technique and competition experience"
        },
        submit: 'Reserve my spot',
        submitting: 'Sending...',
        errors: {
          required: 'This field is required',
          invalidEmail: 'Please enter a valid email',
          invalidPhone: 'Please enter a valid phone number',
          alreadyRegistered: 'This email is already registered'
        }
      },
      success: {
        title: 'Welcome to the League!',
        message: "We'll contact you soon with registration details."
      }
    },
    footer: {
      copyright: '© 2025 Tenis del Parque - Sotogrande. All rights reserved.',
      links: {
        rules: 'Rules',
        privacy: 'Privacy',
        terms: 'Terms',
        contact: 'Contact'
      }
    }
  }
}