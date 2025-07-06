export const homeContent = {
  es: {
    nav: {
      home: 'Inicio',
      rules: 'Reglamento',
      elo: 'ELO Puntos',
      about: 'Acerca de',
      contact: 'Contacto'
    },
    hero: {
      badge: '🚨 ¡INSCRIPCIONES CIERRAN MAÑANA!',
      title: 'Compite. Mejora. Disfruta.',
      tagline: 'La primera liga de tenis amateur en Sotogrande. ¡Las inscripciones cierran MAÑANA LUNES a las 23:00!',
      cta: '¡Inscríbete AHORA!',
      stats: [
        { number: '23:00', label: 'Cierre mañana' },
        { number: 'MAR', label: 'Emparejamientos' },
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
      subtitle: 'Simple, flexible y diseñado para ti. ¡INSCRIPCIONES CIERRAN MAÑANA!',
      steps: [
        {
          title: 'Inscríbete HOY',
          description: 'Elige tu nivel: principiante, intermedio o avanzado. Gratis para la primera temporada. ¡Las inscripciones cierran MAÑANA LUNES a las 23:00!'
        },
        {
          title: 'Recibe tu emparejamiento',
          description: 'El MARTES recibirás tu primer oponente. Contacta y acuerda el horario para jugar durante la semana.'
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
          elo: 'Elo menos de 1200',
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
      toggleAll: {
        openAll: 'Abrir todo',
        closeAll: 'Cerrar todo'
      },
      contact: {
        title: '¿Tienes más preguntas?',
        subtitle: 'Estamos aquí para ayudarte. Contáctanos y resolveremos todas tus dudas sobre la liga.',
        email: 'Enviar email',
        whatsapp: 'WhatsApp'
      },
      items: [
        {
          q: '¿Cuándo cierran las inscripciones?',
          a: '¡Las inscripciones cierran MAÑANA LUNES a las 23:00! Ya tenemos suficientes jugadores registrados y estamos listos para arrancar. Los primeros emparejamientos se enviarán el MARTES por la noche. No pierdas esta oportunidad.'
        },
        {
          q: '¿Qué incluye la inscripción?',
          a: '8 rondas de competición, acceso a la plataforma, rankings en vivo, y eventos sociales de la liga. ¡La primera temporada es totalmente gratis!'
        },
        {
          q: '¿Quién paga las pistas?',
          a: 'Los jugadores dividen el costo de la pista 50/50. Puedes elegir cualquier club en Sotogrande.'
        },
        {
          q: '¿Dónde se juegan los partidos?',
          a: 'Los jugadores se coordinan directamente entre ellos para reservar y jugar en cualquier club de tenis de Sotogrande. Los clubes más populares son Octágono, Racket Center, La Reserva Club y Faisan Court. También están disponibles el Real Club de Golf Sotogrande y SO/ Sotogrande Spa & Golf Resort. En cuanto a superficies, los jugadores son libres de acordar jugar en cualquier tipo que prefieran (tierra batida, pista dura, etc.). Tú eliges dónde, cuándo y en qué superficie jugar según tu conveniencia y la de tu oponente.'
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
      title: '🔥 ¡ÚLTIMAS HORAS PARA INSCRIBIRSE!',
      subtitle: 'Las inscripciones cierran MAÑANA LUNES a las 23:00. Los emparejamientos se envían el MARTES. ¡Esta es tu última oportunidad! ¡Primera temporada gratis!',
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
        message: '¡Ya estás dentro! Recibirás tu primer oponente el MARTES por la noche. ¡Prepárate para comenzar!'
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
      elo: 'ELO Points',
      about: 'About',
      contact: 'Contact'
    },
    hero: {
      badge: '🚨 REGISTRATION CLOSES TOMORROW!',
      title: 'Play. Progress. Enjoy.',
      tagline: 'The first amateur tennis league in Sotogrande. Registration closes TOMORROW MONDAY at 23:00!',
      cta: 'SIGN UP NOW!',
      stats: [
        { number: '23:00', label: 'Closes tomorrow' },
        { number: 'TUE', label: 'Pairings out' },
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
      subtitle: 'Simple, flexible, and designed for you. REGISTRATION CLOSES TOMORROW!',
      steps: [
        {
          title: 'Sign up TODAY',
          description: 'Choose your level: beginner, intermediate, or advanced. Free for the first season. Registration closes TOMORROW MONDAY at 23:00!'
        },
        {
          title: 'Get matched',
          description: 'On TUESDAY you\'ll receive your first opponent. Contact and agree on time to play during the week.'
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
          elo: 'Elo less than 1200',
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
      toggleAll: {
        openAll: 'Open all',
        closeAll: 'Close all'
      },
      contact: {
        title: 'Have more questions?',
        subtitle: 'We\'re here to help. Contact us and we\'ll resolve all your doubts about the league.',
        email: 'Send email',
        whatsapp: 'WhatsApp'
      },
      items: [
        {
          q: 'When does registration close?',
          a: 'Registration closes TOMORROW MONDAY at 23:00! We have enough registered players and are ready to launch. First round pairings will be sent out on TUESDAY evening. Don\'t miss this opportunity.'
        },
        {
          q: "What's included in registration?",
          a: '8 rounds of competition, platform access, live rankings, and league social events. The first season is completely free!'
        },
        {
          q: 'Who pays for courts?',
          a: 'Players split court costs 50/50. You can choose any club in Sotogrande.'
        },
        {
          q: 'Where do players play their matches?',
          a: 'Players coordinate directly with each other to book and play at any tennis club in Sotogrande. The most popular clubs are Octágono, Racket Center, La Reserva Club, and Faisan Court. Real Club de Golf Sotogrande and SO/ Sotogrande Spa & Golf Resort are also available. Regarding surfaces, players are free to agree on whatever court type they prefer (clay, hard court, etc.). You choose where, when, and on what surface to play based on your convenience and your opponent\'s availability.'
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
      title: '🔥 LAST HOURS TO REGISTER!',
      subtitle: 'Registration closes TOMORROW MONDAY at 23:00. Pairings go out on TUESDAY. This is your final chance! First season free!',
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
        message: "You're in! You'll receive your first opponent on TUESDAY evening. Get ready to play!"
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