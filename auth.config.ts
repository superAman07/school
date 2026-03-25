import type { NextAuthConfig } from 'next-auth';

// Pure configuration - NO Prisma imports here!
export const authConfig = {
  providers: [], // we will inject the Node-only Credentials provider in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.schoolId = (user as any).schoolId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).schoolId = token.schoolId;
      }
      return session;
    }
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' }
} satisfies NextAuthConfig;