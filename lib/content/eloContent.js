export const eloContent = {
  es: {
    nav: {
      home: 'Inicio',
      rules: 'Reglamento',
      elo: 'ELO Puntos',
      swiss: 'Sistema Suizo',
      about: 'Acerca de',
      contact: 'Contacto'
    },
    hero: {
      title: 'Sistema de ELO Puntos',
      subtitle: 'Rankings dinámicos que reflejan tu nivel real de juego'
    },
    sections: [
      {
        id: 'what',
        title: '¿Qué son los puntos ELO?',
        content: [
          {
            type: 'text',
            text: 'El sistema ELO es un método matemático para calcular los niveles de habilidad relativos de los jugadores en juegos competitivos. Cada jugador tiene una puntuación numérica que representa su nivel de habilidad actual.'
          },
          {
            type: 'cards',
            cards: [
              {
                title: 'Dinámico',
                description: 'Tu puntuación cambia después de cada partido',
                icon: 'dynamic'
              },
              {
                title: 'Justo',
                description: 'Considera la fuerza de tu oponente',
                icon: 'fair'
              },
              {
                title: 'Preciso',
                description: 'Refleja tu nivel real de juego',
                icon: 'accurate'
              }
            ]
          },
          {
            type: 'text',
            text: 'A diferencia de los sistemas de puntos tradicionales donde ganas los mismos puntos por cada victoria, el sistema ELO considera la calidad de tu oponente. Vencer a un jugador más fuerte te da más puntos que vencer a uno más débil.'
          }
        ]
      },
      {
        id: 'history',
        title: 'Historia del Sistema ELO',
        content: [
          {
            type: 'text',
            text: 'El sistema ELO fue creado por Arpad Elo, un profesor de física húngaro-estadounidense, originalmente para clasificar jugadores de ajedrez. La Federación Mundial de Ajedrez (FIDE) lo adoptó en 1970.'
          },
          {
            type: 'timeline',
            events: [
              {
                year: '1960',
                title: 'Creación',
                description: 'Arpad Elo desarrolla el sistema'
              },
              {
                year: '1970',
                title: 'Ajedrez',
                description: 'FIDE adopta el sistema oficialmente'
              },
              {
                year: '2000s',
                title: 'Expansión',
                description: 'Se extiende a videojuegos y otros deportes'
              },
              {
                year: '2025',
                title: 'Tenis del Parque',
                description: 'Lo implementamos en nuestra liga'
              }
            ]
          },
          {
            type: 'text',
            text: 'Desde entonces, el sistema se ha adaptado para muchos deportes y juegos competitivos, incluyendo tenis, fútbol, videojuegos, y ahora nuestra liga de tenis amateur.'
          }
        ]
      },
      {
        id: 'why',
        title: '¿Por qué usamos ELO?',
        content: [
          {
            type: 'text',
            text: 'Elegimos el sistema ELO para nuestra liga porque queremos que cada partido sea emocionante y justo. Los sistemas tradicionales de liga pueden crear emparejamientos desequilibrados.'
          },
          {
            type: 'comparison',
            title: 'Comparación con otros sistemas',
            items: [
              {
                system: 'Sistema tradicional',
                pros: ['Simple de entender', 'Familiar'],
                cons: ['Partidos desequilibrados', 'No considera la fuerza del oponente', 'Puede desmotivar']
              },
              {
                system: 'Sistema ELO',
                pros: ['Emparejamientos justos', 'Motivación constante', 'Refleja el progreso real', 'Usado mundialmente'],
                cons: ['Requiere explicación inicial']
              }
            ]
          }
        ]
      },
      {
        id: 'perfect',
        title: '¿Por qué es perfecto para nosotros?',
        content: [
          {
            type: 'features',
            features: [
              {
                title: 'Liga amateur con diferentes niveles',
                description: 'Tenemos jugadores desde principiantes hasta avanzados. El ELO asegura que todos tengan partidos competitivos.',
                icon: 'levels'
              },
              {
                title: 'Sistema suizo flexible',
                description: 'Nuestro formato suizo se beneficia del ELO para crear emparejamientos óptimos cada ronda.',
                icon: 'swiss'
              },
              {
                title: 'Motivación continua',
                description: 'Siempre hay algo por lo que jugar. Incluso si no puedes ganar la liga, puedes mejorar tu ELO.',
                icon: 'motivation'
              },
              {
                title: 'Progreso visible',
                description: 'Los jugadores pueden ver su mejora a lo largo del tiempo, no solo en una temporada.',
                icon: 'progress'
              }
            ]
          },
          {
            type: 'text',
            text: 'En Tenis del Parque, comenzarás con un ELO base según tu nivel declarado: Principiante (1180), Intermedio (1200), o Avanzado (1250). Después de cada partido, tu ELO se ajustará basándose en el resultado y la fuerza de tu oponente.'
          }
        ]
      },
      {
        id: 'howItWorks',
        title: 'Cómo funciona ELO en nuestra liga',
        content: [
          {
            type: 'text',
            text: 'Aquí está cómo calculamos los cambios de ELO después de cada partido:'
          },
          {
            type: 'example',
            title: 'Ejemplo práctico',
            scenario: {
              player1: { name: 'Ana', elo: 1250 },
              player2: { name: 'Carlos', elo: 1150 },
              result: 'Ana gana 6-3, 6-4'
            },
            calculation: [
              'Ana tiene 100 puntos más de ELO',
              'El sistema espera que Ana gane ~64% de las veces',
              'Ana gana: +12 puntos (1262)',
              'Carlos pierde: -12 puntos (1138)',
              'Si Carlos hubiera ganado: +20/-20 puntos'
            ]
          },
          {
            type: 'formula',
            title: 'Factor K',
            description: 'Usamos un factor K de 32 para permitir cambios significativos pero no drásticos. Esto significa que el máximo que puedes ganar o perder en un partido es 32 puntos.'
          }
        ]
      },
      {
        id: 'benefits',
        title: 'Beneficios del Sistema ELO',
        content: [
          {
            type: 'text',
            text: 'El sistema ELO ofrece múltiples ventajas para jugadores y organizadores:'
          },
          {
            type: 'cards',
            cards: [
              {
                title: 'Competencia equilibrada',
                description: 'Los emparejamientos son más justos al considerar el nivel real de cada jugador',
                icon: 'balance'
              },
              {
                title: 'Motivación continua',
                description: 'Cada partido importa, manteniendo el interés durante toda la temporada',
                icon: 'motivation'
              },
              {
                title: 'Reconocimiento al mérito',
                description: 'Vencer a jugadores más fuertes se recompensa con más puntos',
                icon: 'merit'
              },
              {
                title: 'Transparencia total',
                description: 'El sistema es matemático y objetivo, sin interpretaciones subjetivas',
                icon: 'transparent'
              }
            ]
          }
        ]
      },
      {
        id: 'categories',
        title: 'Categorías ELO en nuestra liga',
        content: [
          {
            type: 'text',
            text: 'Aunque tenemos tres niveles de inscripción, tu ELO puede variar libremente dentro de cualquier rango:'
          },
          {
            type: 'table',
            headers: ['Categoría', 'ELO Inicial', 'Rango típico', 'Descripción'],
            rows: [
              ['Principiante', '1180', '1000-1199', 'Jugadores nuevos o casuales'],
              ['Intermedio', '1200', '1200-1249', 'Jugadores regulares con experiencia'],
              ['Avanzado', '1250', '1250+', 'Jugadores competitivos experimentados']
            ]
          },
          {
            type: 'text',
            text: 'Tu ELO inicial es solo un punto de partida. Después de algunos partidos, tu puntuación reflejará tu nivel real de juego, independientemente de la categoría en la que te inscribiste.'
          }
        ]
      }
    ],
    cta: {
      title: '¿Listo para mejorar tu ranking?',
      subtitle: 'Únete a la liga y comienza a construir tu historial ELO',
      button: 'Inscríbete ahora'
    },
    footer: {
      copyright: '© 2025 Tenis del Parque - Sotogrande. Todos los derechos reservados.',
      links: {
        rules: 'Reglamento',
        contact: 'Contacto'
      }
    }
  },
  en: {
    nav: {
      home: 'Home',
      rules: 'Rules',
      elo: 'ELO Points',
      swiss: 'Swiss System',
      about: 'About',
      contact: 'Contact'
    },
    hero: {
      title: 'ELO Points System',
      subtitle: 'Dynamic rankings that reflect your real playing level'
    },
    sections: [
      {
        id: 'what',
        title: 'What are ELO points?',
        content: [
          {
            type: 'text',
            text: 'The ELO system is a mathematical method for calculating the relative skill levels of players in competitive games. Each player has a numerical score that represents their current skill level.'
          },
          {
            type: 'cards',
            cards: [
              {
                title: 'Dynamic',
                description: 'Your score changes after each match',
                icon: 'dynamic'
              },
              {
                title: 'Fair',
                description: 'Considers your opponent\'s strength',
                icon: 'fair'
              },
              {
                title: 'Accurate',
                description: 'Reflects your real playing level',
                icon: 'accurate'
              }
            ]
          },
          {
            type: 'text',
            text: 'Unlike traditional point systems where you earn the same points for each victory, the ELO system considers your opponent\'s quality. Defeating a stronger player gives you more points than defeating a weaker one.'
          }
        ]
      },
      {
        id: 'history',
        title: 'History of the ELO System',
        content: [
          {
            type: 'text',
            text: 'The ELO system was created by Arpad Elo, a Hungarian-American physics professor, originally to rank chess players. The World Chess Federation (FIDE) adopted it in 1970.'
          },
          {
            type: 'timeline',
            events: [
              {
                year: '1960',
                title: 'Creation',
                description: 'Arpad Elo develops the system'
              },
              {
                year: '1970',
                title: 'Chess',
                description: 'FIDE officially adopts the system'
              },
              {
                year: '2000s',
                title: 'Expansion',
                description: 'Extends to video games and other sports'
              },
              {
                year: '2025',
                title: 'Tenis del Parque',
                description: 'We implement it in our league'
              }
            ]
          },
          {
            type: 'text',
            text: 'Since then, the system has been adapted for many sports and competitive games, including tennis, football, video games, and now our amateur tennis league.'
          }
        ]
      },
      {
        id: 'why',
        title: 'Why do we use ELO?',
        content: [
          {
            type: 'text',
            text: 'We chose the ELO system for our league because we want every match to be exciting and fair. Traditional league systems can create unbalanced pairings.'
          },
          {
            type: 'comparison',
            title: 'Comparison with other systems',
            items: [
              {
                system: 'Traditional system',
                pros: ['Simple to understand', 'Familiar'],
                cons: ['Unbalanced matches', 'Doesn\'t consider opponent strength', 'Can be demotivating']
              },
              {
                system: 'ELO System',
                pros: ['Fair pairings', 'Constant motivation', 'Reflects real progress', 'Used worldwide'],
                cons: ['Requires initial explanation']
              }
            ]
          }
        ]
      },
      {
        id: 'perfect',
        title: 'Why is it perfect for us?',
        content: [
          {
            type: 'features',
            features: [
              {
                title: 'Amateur league with different levels',
                description: 'We have players from beginners to advanced. ELO ensures everyone has competitive matches.',
                icon: 'levels'
              },
              {
                title: 'Flexible Swiss system',
                description: 'Our Swiss format benefits from ELO to create optimal pairings each round.',
                icon: 'swiss'
              },
              {
                title: 'Continuous motivation',
                description: 'There\'s always something to play for. Even if you can\'t win the league, you can improve your ELO.',
                icon: 'motivation'
              },
              {
                title: 'Visible progress',
                description: 'Players can see their improvement over time, not just in one season.',
                icon: 'progress'
              }
            ]
          },
          {
            type: 'text',
            text: 'At Tenis del Parque, you\'ll start with a base ELO according to your declared level: Beginner (1180), Intermediate (1200), or Advanced (1250). After each match, your ELO will adjust based on the result and your opponent\'s strength.'
          }
        ]
      },
      {
        id: 'howItWorks',
        title: 'How ELO works in our league',
        content: [
          {
            type: 'text',
            text: 'Here\'s how we calculate ELO changes after each match:'
          },
          {
            type: 'example',
            title: 'Practical example',
            scenario: {
              player1: { name: 'Ana', elo: 1250 },
              player2: { name: 'Carlos', elo: 1150 },
              result: 'Ana wins 6-3, 6-4'
            },
            calculation: [
              'Ana has 100 more ELO points',
              'The system expects Ana to win ~64% of the time',
              'Ana wins: +12 points (1262)',
              'Carlos loses: -12 points (1138)',
              'If Carlos had won: +20/-20 points'
            ]
          },
          {
            type: 'formula',
            title: 'K Factor',
            description: 'We use a K factor of 32 to allow significant but not drastic changes. This means the maximum you can gain or lose in a match is 32 points.'
          }
        ]
      },
      {
        id: 'benefits',
        title: 'Benefits of the ELO System',
        content: [
          {
            type: 'text',
            text: 'The ELO system offers multiple advantages for players and organizers:'
          },
          {
            type: 'cards',
            cards: [
              {
                title: 'Balanced competition',
                description: 'Pairings are fairer by considering each player\'s real level',
                icon: 'balance'
              },
              {
                title: 'Continuous motivation',
                description: 'Every match matters, maintaining interest throughout the season',
                icon: 'motivation'
              },
              {
                title: 'Merit recognition',
                description: 'Beating stronger players is rewarded with more points',
                icon: 'merit'
              },
              {
                title: 'Total transparency',
                description: 'The system is mathematical and objective, without subjective interpretations',
                icon: 'transparent'
              }
            ]
          }
        ]
      },
      {
        id: 'categories',
        title: 'ELO Categories in our league',
        content: [
          {
            type: 'text',
            text: 'Although we have three registration levels, your ELO can vary freely within any range:'
          },
          {
            type: 'table',
            headers: ['Category', 'Initial ELO', 'Typical Range', 'Description'],
            rows: [
              ['Beginner', '1180', '1000-1199', 'New or casual players'],
              ['Intermediate', '1200', '1200-1249', 'Regular players with experience'],
              ['Advanced', '1250', '1250+', 'Experienced competitive players']
            ]
          },
          {
            type: 'text',
            text: 'Your initial ELO is just a starting point. After a few matches, your score will reflect your real playing level, regardless of the category you registered in.'
          }
        ]
      }
    ],
    cta: {
      title: 'Ready to improve your ranking?',
      subtitle: 'Join the league and start building your ELO history',
      button: 'Sign up now'
    },
    footer: {
      copyright: '© 2025 Tenis del Parque - Sotogrande. All rights reserved.',
      links: {
        rules: 'Rules',
        contact: 'Contact'
      }
    }
  }
}