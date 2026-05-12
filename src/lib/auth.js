import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { logAction } from './audit'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        encryptionPin: { label: 'Company Encryption PIN', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        // Verify company encryption PIN
        const company = await prisma.company.findFirst({
          where: { encryptionPin: credentials.encryptionPin },
        })
        if (!company) throw new Error('Invalid Company Encryption PIN')

        // Find user
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: { home: true },
        })
        if (!user) throw new Error('Invalid username or password')
        if (!user.active) throw new Error('Account is deactivated')
        if (user.companyId !== company.id) throw new Error('Invalid credentials')

        // Check password
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) throw new Error('Invalid username or password')

        await logAction({
          session: { user: { id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username, homeId: user.homeId, companyId: user.companyId } },
          action: 'LOGIN', entity: 'User', entityId: user.id,
          description: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username + ' logged in',
        })

        return {
          id: user.id.toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          homeId: user.homeId,
          homeName: user.home?.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.role = user.role
        token.companyId = user.companyId
        token.homeId = user.homeId
        token.homeName = user.homeName
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.username = token.username
      session.user.firstName = token.firstName
      session.user.lastName = token.lastName
      session.user.role = token.role
      session.user.companyId = token.companyId
      session.user.homeId = token.homeId
      session.user.homeName = token.homeName
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}
