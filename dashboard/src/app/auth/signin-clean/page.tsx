/**
 * NextAuth Sign-In Page for DemoForge
 * 
 * Simple, clean authentication page using NextAuth.js
 * Replaces our complex custom authentication flow
 */

'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSignIn = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 NextAuth: Starting sign-in flow');
      
      // Use NextAuth to sign in with Microsoft
      const result = await signIn('azure-ad', {
        callbackUrl: '/',
        redirect: true,
      });
      
      console.log('✅ NextAuth: Sign-in initiated', result);
      
    } catch (error) {
      console.error('🚨 NextAuth: Sign-in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">DemoForge</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Admin Sign-In
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your Microsoft admin account
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Admin Email (for reference)
            </label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourcompany.com"
                className="appearance-none rounded-md relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Microsoft will handle tenant discovery automatically
            </p>
          </div>

          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting to Microsoft...
              </>
            ) : (
              'Sign in with Microsoft'
            )}
          </Button>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              ✨ What's New: NextAuth.js Integration
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Secure, battle-tested authentication library</li>
              <li>• Automatic CSRF protection and session management</li>
              <li>• No more custom OAuth implementation complexity</li>
              <li>• Same OneDrive provisioning capabilities preserved</li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Powered by NextAuth.js • Secure OAuth 2.0 / OIDC
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Epic 1 - User Story 1: Using proven authentication library
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}