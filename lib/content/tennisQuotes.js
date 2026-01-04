/**
 * Tennis Quotes Collection
 * Inspirational quotes from tennis legends for use throughout the app
 * 
 * Usage:
 *   import { getRandomQuote, getQuotesByMood } from '@/lib/content/tennisQuotes'
 *   const quote = getRandomQuote('en')
 *   const quote = getRandomQuote('es', 'resilience')
 */

export const tennisQuotes = [
  // Billie Jean King
  {
    text: {
      en: "Pressure is a privilege.",
      es: "La presión es un privilegio."
    },
    author: "Billie Jean King",
    mood: "motivation"
  },
  {
    text: {
      en: "Champions keep playing until they get it right.",
      es: "Los campeones siguen jugando hasta hacerlo bien."
    },
    author: "Billie Jean King",
    mood: "perseverance"
  },
  
  // Andre Agassi
  {
    text: {
      en: "What makes something special is not just what you have to gain, but what you feel there is to lose.",
      es: "Lo que hace algo especial no es solo lo que puedes ganar, sino lo que sientes que puedes perder."
    },
    author: "Andre Agassi",
    mood: "motivation"
  },
  
  // Serena Williams
  {
    text: {
      en: "You have to believe in yourself when no one else does.",
      es: "Tienes que creer en ti mismo cuando nadie más lo hace."
    },
    author: "Serena Williams",
    mood: "confidence"
  },
  
  // Rafael Nadal
  {
    text: {
      en: "Losing is not my enemy… fear of losing is my enemy.",
      es: "Perder no es mi enemigo… el miedo a perder es mi enemigo."
    },
    author: "Rafael Nadal",
    mood: "resilience"
  },
  {
    text: {
      en: "I play each point like my life depends on it.",
      es: "Juego cada punto como si mi vida dependiera de ello."
    },
    author: "Rafael Nadal",
    mood: "intensity"
  },
  
  // Roger Federer
  {
    text: {
      en: "I fear no one, but respect everyone.",
      es: "No le temo a nadie, pero respeto a todos."
    },
    author: "Roger Federer",
    mood: "confidence"
  },
  {
    text: {
      en: "There's no way around hard work. Embrace it.",
      es: "No hay forma de evitar el trabajo duro. Acéptalo."
    },
    author: "Roger Federer",
    mood: "perseverance"
  },
  
  // Venus Williams
  {
    text: {
      en: "Tennis is mostly mental. You win or lose the match before you even go out there.",
      es: "El tenis es principalmente mental. Ganas o pierdes el partido antes de salir a la pista."
    },
    author: "Venus Williams",
    mood: "mental"
  },
  
  // Novak Djokovic
  {
    text: {
      en: "Every match is a new opportunity.",
      es: "Cada partido es una nueva oportunidad."
    },
    author: "Novak Djokovic",
    mood: "motivation"
  },
  
  // Boris Becker
  {
    text: {
      en: "The fifth set is not about tennis, it's about nerves.",
      es: "El quinto set no se trata de tenis, se trata de nervios."
    },
    author: "Boris Becker",
    mood: "mental"
  },
  
  // Arthur Ashe
  {
    text: {
      en: "Start where you are. Use what you have. Do what you can.",
      es: "Empieza donde estás. Usa lo que tienes. Haz lo que puedas."
    },
    author: "Arthur Ashe",
    mood: "motivation"
  },
  
  // Jimmy Connors
  {
    text: {
      en: "I hate to lose more than I love to win.",
      es: "Odio perder más de lo que amo ganar."
    },
    author: "Jimmy Connors",
    mood: "intensity"
  }
]

/**
 * Get a random quote, optionally filtered by mood
 * @param {string} language - 'en' or 'es'
 * @param {string} mood - Optional mood filter: 'motivation', 'resilience', 'confidence', 'perseverance', 'mental', 'intensity'
 * @returns {{ text: string, author: string, mood: string }}
 */
export const getRandomQuote = (language = 'en', mood = null) => {
  const filtered = mood 
    ? tennisQuotes.filter(q => q.mood === mood)
    : tennisQuotes
  
  if (filtered.length === 0) return { 
    text: tennisQuotes[0].text[language] || tennisQuotes[0].text.en, 
    author: tennisQuotes[0].author, 
    mood: tennisQuotes[0].mood 
  }
  
  const randomIndex = Math.floor(Math.random() * filtered.length)
  const quote = filtered[randomIndex]
  
  return {
    text: quote.text[language] || quote.text.en,
    author: quote.author,
    mood: quote.mood
  }
}

/**
 * Get all quotes by a specific mood
 * @param {string} language - 'en' or 'es'
 * @param {string} mood - Mood filter
 * @returns {Array<{ text: string, author: string, mood: string }>}
 */
export const getQuotesByMood = (language = 'en', mood) => {
  return tennisQuotes
    .filter(q => q.mood === mood)
    .map(q => ({
      text: q.text[language] || q.text.en,
      author: q.author,
      mood: q.mood
    }))
}

/**
 * Get all quotes by a specific author
 * @param {string} language - 'en' or 'es'
 * @param {string} author - Author name (partial match)
 * @returns {Array<{ text: string, author: string, mood: string }>}
 */
export const getQuotesByAuthor = (language = 'en', author) => {
  return tennisQuotes
    .filter(q => q.author.toLowerCase().includes(author.toLowerCase()))
    .map(q => ({
      text: q.text[language] || q.text.en,
      author: q.author,
      mood: q.mood
    }))
}

/**
 * Available moods for filtering
 */
export const quoteMoods = [
  'motivation',
  'resilience', 
  'confidence',
  'perseverance',
  'mental',
  'intensity'
]
