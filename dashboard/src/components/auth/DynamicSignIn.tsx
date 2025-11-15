/**
 * Dynamic Microsoft Sign-In Component for E1-US1
 * 
 * Implements domain-based tenant discovery authentication flow
 * User enters email → System discovers tenant → Microsoft OAuth flow
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, User, AlertCircle, CheckCircle } from 'lucide-react';
import { TenantDiscoveryService, TenantDiscoveryResult } from '@/lib/auth/tenant-discovery';
import { MicrosoftAuthService } from '@/lib/auth/microsoft-auth';

interface DynamicSignInProps {
  /** Custom callback after successful authentication initiation */
  onAuthInitiated?: (authUrl: string, email: string) => void;
  /** Show advanced OneDrive provisioning options */
  showAdvancedOptions?: boolean;
}

interface SignInState {
  step: 'email' | 'discovering' | 'discovered' | 'authenticating' | 'error';
  email: string;
  discoveryResult?: TenantDiscoveryResult;
  error?: string;
}

export function DynamicSignIn({ 
  onAuthInitiated,
  showAdvancedOptions = true 
}: DynamicSignInProps) {
  const [state, setState] = useState<SignInState>({
    step: 'email',
    email: '',
  });

  const [oneDriveOptions, setOneDriveOptions] = useState({
    forceProvisioning: true,
    maxWaitTime: 180,
    skipProvisioning: false,
  });

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input and prepare auth flow
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(state.email)) {
      setState(prev => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }

    setState(prev => ({ ...prev, step: 'discovering', error: undefined }));

    try {
      console.log(`🚀 Preparing auth flow for: ${state.email}`);
      
      const authPrepResult = await TenantDiscoveryService.prepareAuthFlow(state.email);
      
      if (authPrepResult.success) {
        setState(prev => ({ 
          ...prev, 
          step: 'discovered', 
          discoveryResult: authPrepResult 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          step: 'error',
          error: authPrepResult.error?.message || 'Failed to prepare authentication'
        }));
      }
    } catch (error) {
      console.error('Auth preparation error:', error);
      setState(prev => ({ 
        ...prev, 
        step: 'error',
        error: 'An unexpected error occurred during authentication preparation'
      }));
    }
  };

  // Handle authentication with discovered tenant
  const handleAuthenticate = async () => {
    if (!state.discoveryResult?.success) {
      setState(prev => ({ ...prev, error: 'No valid tenant discovered' }));
      return;
    }

    setState(prev => ({ ...prev, step: 'authenticating' }));

    try {
      const authService = new MicrosoftAuthService();
      
      // Use the discovered tenant information for authentication
      const authUrl = await authService.initiateAuthFlow({
        tenantId: state.discoveryResult.tenantId!,
        loginHint: state.email,
        forceOneDriveProvisioning: oneDriveOptions.forceProvisioning,
        maxOneDriveWait: oneDriveOptions.maxWaitTime,
        skipOneDriveProvisioning: oneDriveOptions.skipProvisioning,
      });

      console.log(`🚀 Redirecting to authentication: ${authUrl}`);
      
      if (onAuthInitiated) {
        onAuthInitiated(authUrl, state.email);
      } else {
        // Default behavior: redirect to auth URL
        console.log(`🚀 Authentication initiated for ${state.email}`);
        console.log(`📍 Redirecting to: ${authUrl}`);
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Authentication initiation error:', error);
      setState(prev => ({ 
        ...prev, 
        step: 'error',
        error: 'Failed to initiate authentication'
      }));
    }
  };

  // Reset to start over
  const handleReset = () => {
    setState({
      step: 'email',
      email: '',
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Microsoft Admin Sign-In
        </h2>
        <p className="text-gray-600">
          Enter your admin email to sign in with Microsoft
        </p>
      </div>

      {/* Step 1: Email Input */}
      {state.step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={state.email}
                onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@yourcompany.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Microsoft will automatically resolve your tenant during sign-in
            </p>
          </div>

          {state.error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{state.error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">
            Continue to Microsoft
          </Button>
        </form>
      )}

      {/* Step 2: Discovering Tenant */}
      {state.step === 'discovering' && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Preparing Sign-In
          </h3>
          <p className="text-gray-600">
            Preparing Microsoft authentication for {state.email}...
          </p>
        </div>
      )}

      {/* Step 3: Tenant Discovered */}
      {state.step === 'discovered' && state.discoveryResult && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800 mb-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Ready to Sign In!</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{state.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Domain:</span>
                <span className="font-medium">{state.discoveryResult.domain}</span>
              </div>
              <div className="bg-blue-50 rounded p-2 mt-2">
                <p className="text-xs text-blue-800">
                  🎯 Your tenant will be automatically resolved during Microsoft sign-in
                </p>
              </div>
            </div>
          </div>

          {/* OneDrive Options */}
          {showAdvancedOptions && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">OneDrive Provisioning Options</h4>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={oneDriveOptions.forceProvisioning}
                  onChange={(e) => setOneDriveOptions(prev => ({ 
                    ...prev, 
                    forceProvisioning: e.target.checked 
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Force OneDrive provisioning (improves success rate)</span>
              </label>

              <div className="space-y-1">
                <label className="block text-sm text-gray-700">
                  Max wait time: {oneDriveOptions.maxWaitTime}s
                </label>
                <input
                  type="range"
                  min="60"
                  max="300"
                  value={oneDriveOptions.maxWaitTime}
                  onChange={(e) => setOneDriveOptions(prev => ({ 
                    ...prev, 
                    maxWaitTime: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={oneDriveOptions.skipProvisioning}
                  onChange={(e) => setOneDriveOptions(prev => ({ 
                    ...prev, 
                    skipProvisioning: e.target.checked 
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Skip OneDrive provisioning entirely</span>
              </label>

              <p className="text-xs text-gray-500">
                ✨ Based on POC learnings: Force provisioning increases success rate from 20% to 80%+
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Change Email
            </Button>
            <Button onClick={handleAuthenticate} className="flex-1">
              Sign In with Microsoft
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Authenticating */}
      {state.step === 'authenticating' && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Redirecting to Microsoft
          </h3>
          <p className="text-gray-600">
            Please complete authentication in the popup window...
          </p>
        </div>
      )}

      {/* Error State */}
      {state.step === 'error' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Discovery Failed</span>
            </div>
            
            <div className="space-y-2 mb-3">
              <p className="text-sm text-red-700">{state.error}</p>
              <div className="bg-red-100 rounded p-2">
                <p className="text-xs text-red-800">
                  <span className="font-medium">Email used:</span> {state.email}
                </p>
              </div>
            </div>
            
            <p className="text-xs text-red-600">
              Please verify your email address is correct and associated with a Microsoft tenant (Azure AD).
            </p>
          </div>

          <Button onClick={handleReset} variant="outline" className="w-full">
            Try Different Email
          </Button>
        </div>
      )}
    </div>
  );
}