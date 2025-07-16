export const swissContent = {
  es: {
    nav: {
      home: 'Inicio',
      rules: 'Reglamento',
      swiss: 'Sistema Suizo',
      elo: 'ELO Puntos',
      about: 'Acerca de',
      contact: 'Contacto'
    },
    hero: {
      title: 'Sistema Suizo',
      subtitle: 'El formato de torneo perfecto para nuestra liga amateur'
    },
    sections: [
      {
        id: 'what',
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
        id: 'history',
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
        id: 'why',
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
        id: 'works',
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
        id: 'benefits',
        title: 'Beneficios del Sistema Suizo',
        content: [
          {
            type: 'text',
            text: 'El sistema suizo ofrece ventajas únicas que lo hacen perfecto para ligas amateur:'
          },
          {
            type: 'cards',
            cards: [
              {
                title: 'Todos juegan todo',
                description: 'Garantizas 8 partidos en la temporada, sin importar los resultados',
                icon: 'guaranteed'
              },
              {
                title: 'Competencia justa',
                description: 'Los emparejamientos se ajustan según tu rendimiento actual',
                icon: 'fair'
              },
              {
                title: 'Recuperación posible',
                description: 'Un mal inicio no arruina tu temporada completa',
                icon: 'recovery'
              },
              {
                title: 'Más social',
                description: 'Conoces y juegas contra más personas de la liga',
                icon: 'social'
              }
            ]
          },
          {
            type: 'text',
            text: 'Con el sistema suizo combinado con ELO, cada partido cuenta pero ningún partido te elimina. Es la manera perfecta de disfrutar del tenis competitivo sin la presión de la eliminación.'
          }
        ]
      }
    ],
    cta: {
      title: '¿Listo para jugar todas las rondas?',
      subtitle: 'Únete a la liga y disfruta de 8 partidos garantizados con el sistema suizo',
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
      swiss: 'Swiss System',
      elo: 'ELO Points',
      about: 'About',
      contact: 'Contact'
    },
    hero: {
      title: 'Swiss System',
      subtitle: 'The perfect tournament format for our amateur league'
    },
    sections: [
      {
        id: 'what',
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
        id: 'history',
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
        id: 'why',
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
        id: 'works',
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
        id: 'benefits',
        title: 'Benefits of the Swiss System',
        content: [
          {
            type: 'text',
            text: 'The Swiss system offers unique advantages that make it perfect for amateur leagues:'
          },
          {
            type: 'cards',
            cards: [
              {
                title: 'Everyone plays everything',
                description: 'Guaranteed 8 matches in the season, regardless of results',
                icon: 'guaranteed'
              },
              {
                title: 'Fair competition',
                description: 'Pairings adjust based on your current performance',
                icon: 'fair'
              },
              {
                title: 'Recovery possible',
                description: 'A bad start doesn\'t ruin your entire season',
                icon: 'recovery'
              },
              {
                title: 'More social',
                description: 'Meet and play against more people in the league',
                icon: 'social'
              }
            ]
          },
          {
            type: 'text',
            text: 'With the Swiss system combined with ELO, every match counts but no match eliminates you. It\'s the perfect way to enjoy competitive tennis without the pressure of elimination.'
          }
        ]
      }
    ],
    cta: {
      title: 'Ready to play all rounds?',
      subtitle: 'Join the league and enjoy 8 guaranteed matches with the Swiss system',
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