import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    // Verify connection is still alive (readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
    if (mongoose.connection.readyState === 1) {
      return cached.conn
    }
    // Connection is stale, reset and reconnect
    console.log('⚠️ MongoDB connection stale (readyState:', mongoose.connection.readyState, '), reconnecting...')
    cached.conn = null
    cached.promise = null
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Serverless-optimized connection settings
      maxPoolSize: 10,           // Max connections per function instance
      minPoolSize: 0,            // Don't keep idle connections in serverless
      maxIdleTimeMS: 10000,      // Close idle connections after 10s
      serverSelectionTimeoutMS: 7000,  // Wait up to 7s to find a server on cold start
      socketTimeoutMS: 30000,    // 30s socket timeout for operations
      connectTimeoutMS: 10000,   // 10s to establish initial connection
      heartbeatFrequencyMS: 30000, // Check connection health every 30s
      retryWrites: true,
      retryReads: true,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error)
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect