/**
 * User Information Component
 * 
 * Displays current user and tenant information from NextAuth session
 */

'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, Building2, LogOut, Loader2 } from 'lucide-react';

export default function UserInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{session.user.name}</h3>
              <p className="text-sm text-gray-600">{session.user.email}</p>
            </div>
          </div>
          
          {session.tenantId && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Building2 className="h-4 w-4" />
              <span>Tenant: {session.tenantId}</span>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            ✅ Authenticated with NextAuth.js + Microsoft Entra ID
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="ml-4"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}