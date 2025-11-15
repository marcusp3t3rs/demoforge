/**
 * Dynamic Sign-In Test Page for E1-US1
 * 
 * Standalone page for testing domain discovery authentication
 */

'use client';

import { DynamicSignIn } from '@/components/auth/DynamicSignIn';

export default function DynamicSignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">DemoForge</h1>
          <p className="mt-2 text-sm text-gray-600">
            Epic 1 - Tenant Connection Testing
          </p>
        </div>
        
        <DynamicSignIn 
          showAdvancedOptions={true}
        />
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Test with your MS Developer Tenant credentials
          </p>
        </div>
      </div>
    </div>
  );
}