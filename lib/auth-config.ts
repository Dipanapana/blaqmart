import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "./db"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] Authorize called with email:", credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials")
          return null
        }

        // Normalize email to lowercase for consistent lookup
        const normalizedEmail = (credentials.email as string).toLowerCase().trim()
        console.log("[AUTH] Looking up user:", normalizedEmail)

        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
        })

        console.log("[AUTH] User found:", user ? `${user.email} (${user.role})` : "NOT FOUND")

        if (!user || !user.passwordHash) {
          console.log("[AUTH] No user or no password hash")
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.passwordHash
        )

        console.log("[AUTH] Password valid:", isPasswordValid)

        if (!isPasswordValid) {
          return null
        }

        console.log("[AUTH] Login successful for:", user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  // Required for production behind proxies (Railway, Vercel, etc.)
  trustHost: true,
}
