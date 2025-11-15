/**
 * NextAuth.js Configuration for DemoForge
 * 
 * Replaces our custom OAuth implementation with a proven, secure library
 * Handles Microsoft Entra ID authentication with proper session management
 */

import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

// Microsoft profile interface with tenant ID
interface MicrosoftProfile {
  sub: string;
  name: string;
  email: string;
  tid: string; // Tenant ID
  [key: string]: any;
}

const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.DEMOFORGE_CLIENT_ID!,
      clientSecret: process.env.DEMOFORGE_CLIENT_SECRET!,
      tenantId: 'common', // Multi-tenant support
      authorization: {
        params: {
          scope: 'openid profile email User.Read Files.ReadWrite.All offline_access',
        },
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist access token and tenant info in JWT
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // Microsoft profile includes tid (tenant ID)
        token.tenantId = (profile as MicrosoftProfile)?.tid;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.tenantId = token.tenantId as string;
      return session;
    },
    
    async signIn({ user, account, profile }) {
      // Log successful authentication for audit
      console.log(`✅ NextAuth: User signed in: ${user.email}`);
      console.log(`🏢 NextAuth: Tenant ID: ${(profile as MicrosoftProfile)?.tid}`);
      
      // TODO: Integrate OneDrive provisioning logic here
      // This is where we'll call our custom OneDrive service
      
      return true;
    },
  },
  
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
  },
  
  session: {
    strategy: 'jwt',
  },
  
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };