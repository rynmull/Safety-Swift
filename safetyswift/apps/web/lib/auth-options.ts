import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type ApiOrg = {
  id: string;
  name: string;
  role: string;
};

type ApiUser = {
  id: string;
  email: string;
  name: string | null;
  locale: string;
  orgs: ApiOrg[];
};

type LoginResponse = {
  token: string;
  user: ApiUser;
};

const API_BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(parsed.data),
            cache: 'no-store'
          });

          if (!response.ok) {
            return null;
          }

          const data = (await response.json()) as LoginResponse;
          if (!data?.token || !data?.user) {
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            locale: data.user.locale,
            orgs: data.user.orgs,
            token: data.token
          } as unknown as ApiUser & { token: string };
        } catch (error) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { token: string }).token;
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          locale: (user as ApiUser).locale,
          orgs: (user as ApiUser).orgs
        } satisfies ApiUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (session && token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (session && token?.user) {
        session.user = token.user as typeof session.user;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};
