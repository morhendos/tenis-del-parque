import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import Player from '@/lib/models/Player'

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        try {
          await dbConnect()
          
          // Find user by email
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password')
          
          if (!user) {
            throw new Error('User not found')
          }

          // Check if account is active
          if (!user.isActive) {
            throw new Error('Account is inactive')
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )
          
          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

          // Get player data if linked
          let playerData = null
          if (user.playerId) {
            playerData = await Player.findById(user.playerId)
          }

          // Return user object for JWT - keep it simple!
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'player',
            name: playerData?.name || user.email.split('@')[0],
            playerId: user.playerId?.toString() || null
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error('Authentication failed')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          playerId: user.playerId,
          seenAt: Date.now()
        }
      }
      if (token.id && (!token.seenAt || Date.now() - token.seenAt > 6 * 60 * 60 * 1000)) {
        try {
          await dbConnect()
          await User.updateOne({ _id: token.id }, { $set: { lastLogin: new Date() } })
          token.seenAt = Date.now()
        } catch (e) {
          console.error('lastLogin update failed:', e.message)
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.user.id = token.id
      session.user.role = token.role
      session.user.playerId = token.playerId
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
