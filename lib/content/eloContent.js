export const eloContent = {
  es: {
    nav: {
      home: 'Inicio',
      rules: 'Reglamento',
      elo: 'Sistemas ELO y Suizo',
      about: 'Acerca de',
      contact: 'Contacto'
    },
    hero: {
      title: 'Sistemas ELO y Suizo',
      subtitle: 'La combinación perfecta para competir de forma justa e inteligente'
    },
    sections: [
      {
        id: 'swiss',
        title: '¿Qué es el Sistema Suizo?',
        content: [
          {
            type: 'text',
            text: 'El sistema suizo es un formato de torneo donde los jugadores no son eliminados después de perder. En cada ronda, juegas contra un oponente con resultados similares a los tuyos, asegurando partidos equilibrados durante toda la temporada.'
          },
          {
            type: 'cards',
            cards: [
              {
                title: 'Sin Eliminación',
                description: 'Juegas todas las rondas sin importar tus resultados',
                icon: 'no-elimination'
              },
              {
                title: 'Emparejamientos Justos',
                description: 'Siempre juegas contra alguien de tu nivel actual',
                icon: 'fair-pairing'
              },
              {
                title: 'Máxima Participación',
                description: 'Todos juegan el mismo número de partidos',
                icon: 'max-participation'
              }
            ]
          },
          {
            type: 'text',
            text: 'A diferencia de un torneo eliminatorio donde puedes quedar fuera en la primera ronda, el sistema suizo garantiza que juegues todas las 8 rondas de la temporada, dándote múltiples oportunidades para mejorar y competir.'
          }
        ]
      },
      {
        id: 'swiss-history',
        title: 'Historia del Sistema Suizo',
        content: [
          {
            type: 'text',
            text: 'El sistema suizo fue creado para torneos de ajedrez en Suiza a finales del siglo XIX. Su objetivo era permitir que muchos jugadores compitieran sin necesidad de que todos jugaran entre sí.'
          },
          {
            type: 'timeline',
            events: [
              {
                year: '1895',
                title: 'Origen',
                description: 'Primer uso en Zúrich, Suiza'
              },
              {
                year: '1900s',
                title: 'Ajedrez',
                description: 'Se populariza en torneos de ajedrez'
              },
              {
                year: '1970s',
                title: 'Expansión',
                description: 'Adoptado por otros deportes y juegos'
              },
              {
                year: '2025',
                title: 'Tenis del Parque',
                description: 'Perfectamente adaptado para nuestra liga'
              }
            ]
          },
          {
            type: 'text',
            text: 'Hoy en día, el sistema suizo es usado en deportes como tenis, golf, esports, y muchos más. Es ideal cuando quieres que todos los participantes jueguen múltiples rondas sin eliminación.'
          }
        ]
      },
      {
        id: 'swiss-why',
        title: '¿Por qué Sistema Suizo para nuestra liga?',
        content: [
          {
            type: 'text',
            text: 'Elegimos el sistema suizo porque queremos que todos nuestros jugadores tengan una experiencia completa durante toda la temporada, no solo los mejores.'
          },
          {
            type: 'comparison',
            title: 'Comparación con otros formatos',
            items: [
              {
                system: 'Eliminación directa',
                pros: ['Emocionante', 'Claro ganador'],
                cons: ['50% eliminados en primera ronda', 'Pocos partidos para mayoría', 'Sin segundas oportunidades']
              },
              {
                system: 'Sistema Suizo',
                pros: ['Todos juegan todas las rondas', 'Múltiples oportunidades', 'Emparejamientos equilibrados', 'Clasificación justa'],
                cons: ['Más complejo de organizar']
              }
            ]
          },
          {
            type: 'features',
            features: [
              {
                title: 'Flexibilidad perfecta',
                description: 'Con 8 rondas en la temporada, tienes tiempo para recuperarte de un mal inicio o mantener tu momentum.',
                icon: 'flexibility'
              },
              {
                title: 'Aprendizaje continuo',
                description: 'Cada semana juegas y aprendes, sin la presión de ser eliminado.',
                icon: 'learning'
              },
              {
                title: 'Social y competitivo',
                description: 'Conoces a más jugadores al no repetir oponentes innecesariamente.',
                icon: 'social'
              },
              {
                title: 'Combina con ELO',
                description: 'El sistema suizo usa los rankings ELO para crear los mejores emparejamientos posibles.',
                icon: 'combine'
              }
            ]
          }
        ]
      },
      {
        id: 'swiss-works',
        title: 'Cómo funciona el Sistema Suizo en nuestra liga',
        content: [
          {
            type: 'text',
            text: 'Aquí está cómo organizamos las 8 rondas de nuestra temporada usando el sistema suizo:'
          },
          {
            type: 'process',
            title: 'Proceso de emparejamiento',
            steps: [
              {
                title: 'Ronda 1',
                description: 'Emparejamientos aleatorios dentro de tu categoría (Principiante, Intermedio, Avanzado)'
              },
              {
                title: 'Rondas 2-8',
                description: 'Emparejamientos basados en puntos de liga y ELO similar'
              },
              {
                title: 'Sin repeticiones',
                description: 'Evitamos que juegues contra el mismo oponente dos veces'
              },
              {
                title: 'Equilibrio',
                description: 'Si tienes 6 puntos, juegas contra alguien con 5-7 puntos'
              }
            ]
          },
          {
            type: 'example',
            title: 'Ejemplo de progresión',
            scenario: {
              player: 'María',
              rounds: [
                { round: 1, opponent: 'Random', result: 'Pierde', points: 0 },
                { round: 2, opponent: 'Otro con 0 pts', result: 'Gana', points: 3 },
                { round: 3, opponent: 'Otro con 3 pts', result: 'Gana', points: 6 },
                { round: 4, opponent: 'Otro con 6 pts', result: 'Pierde', points: 6 },
                { round: 5, opponent: 'Otro con 6 pts', result: 'Gana', points: 9 }
              ]
            }
          }
        ]
      },
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
            text: 'En Tenis del Parque, comenzarás con un ELO base según tu nivel declarado: Principiante (1000), Intermedio (1200), o Avanzado (1300). Después de cada partido, tu ELO se ajustará basándose en el resultado y la fuerza de tu oponente.'
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
        id: 'together',
        title: 'ELO + Suizo = La combinación perfecta',
        content: [
          {
            type: 'text',
            text: 'La magia ocurre cuando combinamos ambos sistemas. El sistema suizo garantiza que juegues todas las rondas, mientras que el ELO asegura que cada partido sea equilibrado y emocionante.'
          },
          {
            type: 'cards',
            cards: [
              {
                title: 'Emparejamientos inteligentes',
                description: 'El suizo usa tu ELO para encontrar el mejor oponente cada semana',
                icon: 'smart'
              },
              {
                title: 'Doble motivación',
                description: 'Compites por puntos de liga Y por mejorar tu ranking ELO',
                icon: 'double'
              },
              {
                title: 'Experiencia completa',
                description: '8 rondas garantizadas con partidos siempre competitivos',
                icon: 'complete'
              }
            ]
          }
        ]
      }
    ],
    cta: {
      title: '¿Listo para competir?',
      subtitle: 'Únete a la liga y experimenta la mejor forma de jugar tenis amateur',
      button: 'Inscríbete ahora',
      link: '/#signup'
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
      elo: 'ELO & Swiss Systems',
      about: 'About',
      contact: 'Contact'
    },
    hero: {
      title: 'ELO & Swiss Systems',
      subtitle: 'The perfect combination for fair and intelligent competition'
    },
    sections: [
      {
        id: 'swiss',
        title: 'What is the Swiss System?',
        content: [
          {
            type: 'text',
            text: 'The Swiss system is a tournament format where players are not eliminated after losing. In each round, you play against an opponent with similar results to yours, ensuring balanced matches throughout the season.'
          },
          {
            type: 'cards',
            cards: [
              {
                title: 'No Elimination',
                description: 'You play all rounds regardless of your results',
                icon: 'no-elimination'
              },
              {
                title: 'Fair Pairings',
                description: 'Always play against someone at your current level',
                icon: 'fair-pairing'
              },
              {
                title: 'Maximum Participation',
                description: 'Everyone plays the same number of matches',
                icon: 'max-participation'
              }
            ]
          },
          {
            type: 'text',
            text: 'Unlike a knockout tournament where you can be eliminated in the first round, the Swiss system guarantees you play all 8 rounds of the season, giving you multiple opportunities to improve and compete.'
          }
        ]
      },
      {
        id: 'swiss-history',
        title: 'History of the Swiss System',
        content: [
          {
            type: 'text',
            text: 'The Swiss system was created for chess tournaments in Switzerland in the late 19th century. Its goal was to allow many players to compete without everyone having to play each other.'
          },
          {
            type: 'timeline',
            events: [
              {
                year: '1895',
                title: 'Origin',
                description: 'First used in Zurich, Switzerland'
              },
              {
                year: '1900s',
                title: 'Chess',
                description: 'Becomes popular in chess tournaments'
              },
              {
                year: '1970s',
                title: 'Expansion',
                description: 'Adopted by other sports and games'
              },
              {
                year: '2025',
                title: 'Tenis del Parque',
                description: 'Perfectly adapted for our league'
              }
            ]
          },
          {
            type: 'text',
            text: 'Today, the Swiss system is used in sports like tennis, golf, esports, and many more. It\'s ideal when you want all participants to play multiple rounds without elimination.'
          }
        ]
      },
      {
        id: 'swiss-why',
        title: 'Why Swiss System for our league?',
        content: [
          {
            type: 'text',
            text: 'We chose the Swiss system because we want all our players to have a complete experience throughout the season, not just the best ones.'
          },
          {
            type: 'comparison',
            title: 'Comparison with other formats',
            items: [
              {
                system: 'Knockout',
                pros: ['Exciting', 'Clear winner'],
                cons: ['50% eliminated in first round', 'Few matches for majority', 'No second chances']
              },
              {
                system: 'Swiss System',
                pros: ['Everyone plays all rounds', 'Multiple opportunities', 'Balanced pairings', 'Fair ranking'],
                cons: ['More complex to organize']
              }
            ]
          },
          {
            type: 'features',
            features: [
              {
                title: 'Perfect flexibility',
                description: 'With 8 rounds in the season, you have time to recover from a bad start or maintain your momentum.',
                icon: 'flexibility'
              },
              {
                title: 'Continuous learning',
                description: 'Every week you play and learn, without the pressure of being eliminated.',
                icon: 'learning'
              },
              {
                title: 'Social and competitive',
                description: 'Meet more players by not repeating opponents unnecessarily.',
                icon: 'social'
              },
              {
                title: 'Combines with ELO',
                description: 'The Swiss system uses ELO rankings to create the best possible pairings.',
                icon: 'combine'
              }
            ]
          }
        ]
      },
      {
        id: 'swiss-works',
        title: 'How the Swiss System works in our league',
        content: [
          {
            type: 'text',
            text: 'Here\'s how we organize the 8 rounds of our season using the Swiss system:'
          },
          {
            type: 'process',
            title: 'Pairing process',
            steps: [
              {
                title: 'Round 1',
                description: 'Random pairings within your category (Beginner, Intermediate, Advanced)'
              },
              {
                title: 'Rounds 2-8',
                description: 'Pairings based on league points and similar ELO'
              },
              {
                title: 'No repeats',
                description: 'We avoid having you play the same opponent twice'
              },
              {
                title: 'Balance',
                description: 'If you have 6 points, you play against someone with 5-7 points'
              }
            ]
          },
          {
            type: 'example',
            title: 'Progression example',
            scenario: {
              player: 'Maria',
              rounds: [
                { round: 1, opponent: 'Random', result: 'Loses', points: 0 },
                { round: 2, opponent: 'Another with 0 pts', result: 'Wins', points: 3 },
                { round: 3, opponent: 'Another with 3 pts', result: 'Wins', points: 6 },
                { round: 4, opponent: 'Another with 6 pts', result: 'Loses', points: 6 },
                { round: 5, opponent: 'Another with 6 pts', result: 'Wins', points: 9 }
              ]
            }
          }
        ]
      },
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
            text: 'At Tenis del Parque, you\'ll start with a base ELO according to your declared level: Beginner (1000), Intermediate (1200), or Advanced (1300). After each match, your ELO will adjust based on the result and your opponent\'s strength.'
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
        id: 'together',
        title: 'ELO + Swiss = The perfect combination',
        content: [
          {
            type: 'text',
            text: 'The magic happens when we combine both systems. The Swiss system guarantees you play all rounds, while ELO ensures each match is balanced and exciting.'
          },
          {
            type: 'cards',
            cards: [
              {
                title: 'Smart pairings',
                description: 'Swiss uses your ELO to find the best opponent each week',
                icon: 'smart'
              },
              {
                title: 'Double motivation',
                description: 'Compete for league points AND improve your ELO ranking',
                icon: 'double'
              },
              {
                title: 'Complete experience',
                description: '8 guaranteed rounds with always competitive matches',
                icon: 'complete'
              }
            ]
          }
        ]
      }
    ],
    cta: {
      title: 'Ready to compete?',
      subtitle: 'Join the league and experience the best way to play amateur tennis',
      button: 'Sign up now',
      link: '/#signup'
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