import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '../../../utils/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials.password) {
          throw new Error('Username and password are required');
        }

        // Find the manager by username
        const manager = await prisma.manager.findUnique({
          where: { username: credentials.username },
        });

        if (!manager) {
          throw new Error('Invalid username or password');
        }

        // Compare the password
        const isValid = await bcrypt.compare(credentials.password, manager.password);

        if (!isValid) {
          throw new Error('Invalid username or password');
        }

        // Return the manager object as a User
        return {
          id: manager.id.toString(), // Convert id to string
          name: manager.username,
          email: null, // NextAuth expects an email property
        };
      },
    }),
  ],
  pages: {
    signIn: '/manager/login', // Custom sign-in page
    error: '/manager/login',  // Redirect to login page on error
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Assign user.id to token.id
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string; // Assign token.id to session.user.id
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
