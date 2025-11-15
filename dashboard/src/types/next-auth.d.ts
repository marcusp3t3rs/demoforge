/**
 * NextAuth.js Type Extensions for DemoForge
 * 
 * Extends default NextAuth types to include our custom session properties
 */

import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    tenantId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    tenantId?: string;
  }
}