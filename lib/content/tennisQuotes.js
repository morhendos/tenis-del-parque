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
  },
  { text: { en: "A bad temper is a real key to failure.", es: "El mal genio es la verdadera clave del fracaso." }, author: "Rick Macci", mood: "mental" },
  { text: { en: "If you practice on your day off, you won't have an off day.", es: "Si entrenas en tu día libre, nunca tendrás un mal día." }, author: "Rick Macci", mood: "perseverance" },
  { text: { en: "Having the ability to forget is the real key to staying positive.", es: "Saber olvidar es la verdadera clave para mantenerse positivo." }, author: "Rick Macci", mood: "resilience" },
  { text: { en: "Use your legs to hit shots, not your hands.", es: "Usa las piernas para golpear, no las manos." }, author: "Rick Macci", mood: "intensity" },
  { text: { en: "Show me a player who hits the big shot when it counts and I'll show you courage.", es: "Enséñame a un jugador que pega el gran golpe cuando importa y te enseñaré lo que es el coraje." }, author: "Rick Macci", mood: "confidence" },
  { text: { en: "It's OK to get knocked down. What happens next says it all.", es: "Está bien caer. Lo que pasa después lo dice todo." }, author: "Rick Macci", mood: "resilience" },
  { text: { en: "Everybody isn't a winner, but everybody can be a winner.", es: "No todos son ganadores, pero todos pueden serlo." }, author: "Rick Macci", mood: "motivation" },
  { text: { en: "Believing is so, so powerful. So is doubt. Now you choose.", es: "Creer es muy, muy poderoso. La duda también. Ahora elige tú." }, author: "Rick Macci", mood: "confidence" },
  { text: { en: "Calmness and intensity are the ultimate combination in competition.", es: "La calma y la intensidad son la combinación definitiva en la competición." }, author: "Rick Macci", mood: "mental" },
  { text: { en: "Tennis is a game. Games are fun! Enjoy the battle.", es: "El tenis es un juego. ¡Los juegos son divertidos! Disfruta la batalla." }, author: "Rick Macci", mood: "motivation" },
  { text: { en: "You play with your skill, but you really win with your will.", es: "Juegas con tu talento, pero ganas de verdad con tu voluntad." }, author: "Rick Macci", mood: "perseverance" },
  { text: { en: "It is OK to be nervous, just don't ever, ever be afraid.", es: "Está bien estar nervioso, pero nunca, nunca tengas miedo." }, author: "Rick Macci", mood: "confidence" },
  { text: { en: "Sweat, pain, determination. That's a start.", es: "Sudor, dolor, determinación. Eso es solo el principio." }, author: "Rick Macci", mood: "perseverance" },
  { text: { en: "Mental toughness is hitting 3 double faults in a row, then hitting an ace.", es: "La fortaleza mental es hacer 3 dobles faltas seguidas y luego sacar un ace." }, author: "Rick Macci", mood: "mental" },
  { text: { en: "Some players see the clouds and storms of the match. Champions see the sun peeking through.", es: "Algunos jugadores ven las nubes y tormentas del partido. Los campeones ven el sol asomando." }, author: "Rick Macci", mood: "motivation" },
  { text: { en: "If you think someone is unbeatable, they have just become even better.", es: "Si crees que alguien es imbatible, acaba de volverse aún mejor." }, author: "Rick Macci", mood: "mental" },
  { text: { en: "Tennis is a game of inches from one ear to the other.", es: "El tenis es un juego de centímetros: los que hay de una oreja a la otra." }, author: "Rick Macci", mood: "mental" },
  { text: { en: "A true winner refuses to be denied. That is attitude.", es: "Un verdadero ganador se niega a rendirse. Eso es actitud." }, author: "Rick Macci", mood: "intensity" },
  { text: { en: "If you believe it, feel it, see it, smell it, it will happen.", es: "Si lo crees, lo sientes, lo ves y lo hueles, sucederá." }, author: "Rick Macci", mood: "confidence" },
  { text: { en: "The difference between ordinary and extraordinary is a little extra.", es: "La diferencia entre lo ordinario y lo extraordinario es un poco extra." }, author: "Rick Macci", mood: "motivation" },
  { text: { en: "Effortless is a myth.", es: "Jugar sin esfuerzo es un mito." }, author: "Roger Federer", mood: "perseverance" },
  { text: { en: "When you're playing a point, it has to be the most important thing in the world. But when it's behind you, it's behind you.", es: "Cuando juegas un punto, tiene que ser lo más importante del mundo. Pero cuando ya ha pasado, ha pasado." }, author: "Roger Federer", mood: "mental" },
  { text: { en: "I won almost 80% of my matches, but only 54% of the points.", es: "Gané casi el 80% de mis partidos, pero solo el 54% de los puntos." }, author: "Roger Federer", mood: "resilience" },
  { text: { en: "If you can meet with Triumph and Disaster and treat those two impostors just the same.", es: "Si puedes encontrarte con el Triunfo y el Desastre y tratar a esos dos impostores de la misma manera." }, author: "Rudyard Kipling", mood: "mental" },
  { text: { en: "Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.", es: "Lo intentaste. Fallaste. No importa. Inténtalo de nuevo. Falla otra vez. Falla mejor." }, author: "Samuel Beckett", mood: "resilience" },
  { text: { en: "Cabeza, corazón y cojones.", es: "Cabeza, corazón y cojones." }, author: "Carlos Alcaraz", mood: "intensity" },
  { text: { en: "Success is a journey, not a destination. The doing is often more important than the outcome.", es: "El éxito es un camino, no un destino. Hacer es a menudo más importante que el resultado." }, author: "Arthur Ashe", mood: "motivation" },
  { text: { en: "One important key to success is self-confidence. An important key to self-confidence is preparation.", es: "Una clave del éxito es la confianza en uno mismo. Una clave de la confianza es la preparación." }, author: "Arthur Ashe", mood: "confidence" },
  { text: { en: "The moment of victory is much too short to live for that and nothing else.", es: "El momento de la victoria es demasiado corto para vivir solo para eso." }, author: "Martina Navratilova", mood: "motivation" },
  { text: { en: "If you can react the same way to winning and losing, that quality stays with you the rest of your life.", es: "Si puedes reaccionar igual al ganar y al perder, esa cualidad te acompañará el resto de tu vida." }, author: "Chris Evert", mood: "mental" },
  { text: { en: "A champion is defined not by their wins but by how they can recover when they fall.", es: "A un campeón no lo definen sus victorias, sino cómo se recupera cuando cae." }, author: "Serena Williams", mood: "resilience" },
  { text: { en: "A champion is afraid of losing. Everyone else is afraid of winning.", es: "Un campeón tiene miedo de perder. Todos los demás tienen miedo de ganar." }, author: "Billie Jean King", mood: "confidence" }
]

function seededShuffle(length, seed) {
  const order = Array.from({ length }, (_, i) => i)
  let s = seed >>> 0
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

export const getDailyQuote = (language = 'en', date = new Date()) => {
  const n = tennisQuotes.length
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
  const cycle = Math.floor(day / n)
  const order = seededShuffle(n, cycle + 1)
  const q = tennisQuotes[order[day % n]]
  return { text: q.text[language] || q.text.en, author: q.author, mood: q.mood }
}

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
