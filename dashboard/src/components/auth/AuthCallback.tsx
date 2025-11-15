/**
 * Authentication Callback Handler Component for E1-US1
 * 
 * Handles the OAuth callback from Microsoft and processes authentication
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MicrosoftAuthService } from '@/lib/auth/microsoft-auth';
import { AuthResult, ProvisioningOptions } from '@/lib/auth/types';
import { useAuth } from '@/lib/auth';

interface CallbackState {
  status: 'processing' | 'success' | 'error' | 'onedrive_waiting';
  message: string;
  details?: string;
  result?: AuthResult;
  oneDriveStatus?: {
    isProvisioning: boolean;
    timeElapsed: number;
    maxWaitTime: number;
  };
}

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithMicrosoft } = useAuth();
  const [state, setState] = useState<CallbackState>({
    status: 'processing',
    message: 'Processing authentication...',
  });

  const authService = new MicrosoftAuthService();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get OAuth parameters from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle OAuth errors
      if (error) {
        setState({
          status: 'error',
          message: 'Authentication failed',
          details: errorDescription || error,
        });
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        setState({
          status: 'error',
          message: 'Invalid authentication response',
          details: 'Missing authorization code or state parameter',
        });
        return;
      }

      // Get stored auth state and options
      const storedState = sessionStorage.getItem('auth_state');
      const codeVerifier = sessionStorage.getItem('code_verifier');
      const oneDriveOptionsStr = sessionStorage.getItem('onedrive_options');

      if (!storedState || !codeVerifier) {
        setState({
          status: 'error',
          message: 'Authentication session expired',
          details: 'Please try signing in again',
        });
        return;
      }

      // Debug: Log what we received
      console.log('🔍 Auth callback debug:');
      console.log('- code:', code ? 'present' : 'missing');
      console.log('- state param:', state);
      console.log('- stored state:', storedState);
      console.log('- code verifier:', codeVerifier ? 'present' : 'missing');

      // Parse OneDrive options from session storage
      const oneDriveOptions: ProvisioningOptions = oneDriveOptionsStr 
        ? JSON.parse(oneDriveOptionsStr) 
        : {};

      // Validate state matches (state is a simple UUID string, not JSON)
      if (state !== storedState) {
        console.error('🚨 State mismatch:');
        console.error('- Received state:', state);
        console.error('- Stored state:', storedState);
        setState({
          status: 'error',
          message: 'Security validation failed',
          details: 'Authentication state mismatch - possible CSRF attack',
        });
        return;
      }

      console.log('✅ State validation passed');

      console.log('🔄 Processing auth callback with OneDrive options:', oneDriveOptions);

      // Update UI for OneDrive provisioning if enabled
      if (oneDriveOptions.forceOneDriveProvisioning) {
        setState({
          status: 'onedrive_waiting',
          message: 'Authenticating and provisioning OneDrive...',
          details: 'This may take 2-3 minutes for optimal setup',
          oneDriveStatus: {
            isProvisioning: true,
            timeElapsed: 0,
            maxWaitTime: oneDriveOptions.maxOneDriveWait || 180,
          },
        });

        // Start timer for OneDrive provisioning UI
        const startTime = Date.now();
        const timer = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setState(prev => ({
            ...prev,
            oneDriveStatus: prev.oneDriveStatus ? {
              ...prev.oneDriveStatus,
              timeElapsed: elapsed,
            } : undefined,
          }));
        }, 1000);

        // Process the callback
        const result = await authService.handleCallback(code, state, codeVerifier, oneDriveOptions);
        
        clearInterval(timer);
        
        if (result.success && result.user && result.tokens) {
          // Set up authentication context
          loginWithMicrosoft(result.user, result.tokens);

          setState({
            status: 'success',
            message: 'Authentication successful!',
            details: `Welcome ${result.user.displayName}`,
            result,
          });

          // Clean up session storage
          sessionStorage.removeItem('auth_state');
          sessionStorage.removeItem('code_verifier');
          sessionStorage.removeItem('onedrive_options');

          // Redirect to dashboard after brief success display
          setTimeout(() => {
            router.push('/');
          }, 2000);

        } else {
          setState({
            status: 'error',
            message: 'Authentication failed',
            details: result.error?.message || 'Unknown error occurred',
          });
        }

      } else {
        // Standard auth without OneDrive forcing
        const result = await authService.handleCallback(code, state, codeVerifier, oneDriveOptions);
        
        if (result.success && result.user && result.tokens) {
          // Set up authentication context
          loginWithMicrosoft(result.user, result.tokens);

          setState({
            status: 'success',
            message: 'Authentication successful!',
            details: `Welcome ${result.user.displayName}`,
            result,
          });

          // Clean up and redirect
          sessionStorage.removeItem('auth_state');
          sessionStorage.removeItem('code_verifier');
          sessionStorage.removeItem('onedrive_options');

          setTimeout(() => {
            router.push('/');
          }, 2000);

        } else {
          setState({
            status: 'error',
            message: 'Authentication failed',
            details: result.error?.message || 'Unknown error occurred',
          });
        }
      }

    } catch (error) {
      console.error('🚨 Auth callback error:', error);
      console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setState({
        status: 'error',
        message: 'Authentication processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const getStatusIcon = () => {
    switch (state.status) {
      case 'processing':
      case 'onedrive_waiting':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'processing':
      case 'onedrive_waiting':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          
          <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
            {state.message}
          </h2>
          
          {state.details && (
            <p className="mt-2 text-sm text-gray-600">
              {state.details}
            </p>
          )}

          {/* OneDrive Provisioning Progress */}
          {state.status === 'onedrive_waiting' && state.oneDriveStatus && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>
                  {state.oneDriveStatus.timeElapsed}s / {state.oneDriveStatus.maxWaitTime}s
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(
                      (state.oneDriveStatus.timeElapsed / state.oneDriveStatus.maxWaitTime) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>⚡ Forcing OneDrive provisioning for better experience</p>
                <p>📊 Success rate improvement: 20% → 80%+ (based on POC)</p>
              </div>
            </div>
          )}

          {/* Success Details */}
          {state.status === 'success' && state.result?.user && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="text-sm space-y-1">
                <p><strong>User:</strong> {state.result.user.displayName}</p>
                <p><strong>Email:</strong> {state.result.user.userPrincipalName}</p>
                <p><strong>Tenant:</strong> {state.result.user.tenant.displayName}</p>
              </div>
              <p className="text-xs text-green-600 mt-2">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {/* Error Actions */}
          {state.status === 'error' && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Return Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}