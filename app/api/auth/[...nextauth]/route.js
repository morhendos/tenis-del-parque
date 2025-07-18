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

          // Get player data if linked
          let playerData = null
          if (user.playerId) {
            playerData = await Player.findById(user.playerId)
          }

          // Return user object for JWT
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'player',
            name: playerData?.name || user.email.split('@')[0],
            playerId: user.playerId?.toString() || null,
            seenAnnouncements: user.preferences?.seenAnnouncements || [],
            hasSeenWelcomeModal: user.preferences?.hasSeenWelcomeModal || false
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error('Authentication failed')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          playerId: user.playerId,
          seenAnnouncements: user.seenAnnouncements,
          hasSeenWelcomeModal: user.hasSeenWelcomeModal
        }
      }
      
      // Update token if we update the session
      if (trigger === "update" && session) {
        if (session.seenAnnouncements !== undefined) {
          token.seenAnnouncements = session.seenAnnouncements
        }
        if (session.hasSeenWelcomeModal !== undefined) {
          token.hasSeenWelcomeModal = session.hasSeenWelcomeModal
        }
      }
      
      // Refresh user data from database on each request
      if (token.id) {
        try {
          await dbConnect()
          const user = await User.findById(token.id)
          if (user) {
            token.seenAnnouncements = user.preferences?.seenAnnouncements || []
            token.hasSeenWelcomeModal = user.preferences?.hasSeenWelcomeModal || false
          }
        } catch (error) {
          console.error('Error refreshing user data:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.user.id = token.id
      session.user.role = token.role
      session.user.playerId = token.playerId
      session.user.seenAnnouncements = token.seenAnnouncements || []
      session.user.hasSeenWelcomeModal = token.hasSeenWelcomeModal || false
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in query string as ?error=
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
