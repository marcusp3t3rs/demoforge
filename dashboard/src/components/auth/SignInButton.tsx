/**
 * Microsoft Sign-In Button Component for E1-US1
 * 
 * Implements the Microsoft authentication UI with OneDrive provisioning controls
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Settings } from 'lucide-react';
import { MicrosoftAuthService } from '@/lib/auth/microsoft-auth';

interface SignInButtonProps {
  /** Show advanced OneDrive provisioning options */
  showAdvancedOptions?: boolean;
  /** Custom callback after successful sign-in initiation */
  onSignInInitiated?: (authUrl: string) => void;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary';
  /** Button size */
  size?: 'default' | 'sm' | 'lg';
  /** Custom button text */
  buttonText?: string;
}

interface AdvancedOptions {
  forceOneDriveProvisioning: boolean;
  maxOneDriveWait: number;
  customScopes: string[];
}

export function SignInButton({
  showAdvancedOptions = false,
  onSignInInitiated,
  variant = 'default',
  size = 'default',
  buttonText = 'Sign in with Microsoft',
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<AdvancedOptions>({
    forceOneDriveProvisioning: true, // Default from config
    maxOneDriveWait: 180,
    customScopes: [],
  });

  const authService = new MicrosoftAuthService();

  const handleSignIn = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Initiating Microsoft sign-in...');
      
      const authFlow = await authService.initiateAuthFlow({
        forceOneDriveProvisioning: options.forceOneDriveProvisioning,
        customScopes: options.customScopes,
      });

      // Store state and code verifier for callback
      sessionStorage.setItem('auth_state', authFlow.state);
      sessionStorage.setItem('code_verifier', authFlow.codeVerifier);
      sessionStorage.setItem('onedrive_options', JSON.stringify({
        forceOneDriveProvisioning: options.forceOneDriveProvisioning,
        maxOneDriveWait: options.maxOneDriveWait,
      }));

      console.log(`✅ Auth URL generated, OneDrive force: ${options.forceOneDriveProvisioning}`);

      // Call custom callback if provided
      if (onSignInInitiated) {
        onSignInInitiated(authFlow.authUrl);
      } else {
        // Default behavior: redirect to Microsoft
        window.location.href = authFlow.authUrl;
      }

    } catch (error) {
      console.error('🚨 Sign-in initiation failed:', error);
      // TODO: Show error toast/notification
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Sign-In Button */}
      <Button
        onClick={handleSignIn}
        disabled={isLoading}
        variant={variant}
        size={size}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting to Microsoft...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              {/* Microsoft logo */}
              <path fill="#f25022" d="M1 1h10v10H1z"/>
              <path fill="#00a4ef" d="M13 1h10v10H13z"/>
              <path fill="#7fba00" d="M1 13h10v10H1z"/>
              <path fill="#ffb900" d="M13 13h10v10H13z"/>
            </svg>
            {buttonText}
          </>
        )}
      </Button>

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <div className="space-y-3">
          <Button
            onClick={() => setShowOptions(!showOptions)}
            variant="outline"
            size="sm"
            className="w-full text-muted-foreground"
          >
            <Settings className="mr-2 h-3 w-3" />
            Advanced Options
          </Button>

          {showOptions && (
            <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">OneDrive Provisioning</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="force-onedrive"
                    checked={options.forceOneDriveProvisioning}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      forceOneDriveProvisioning: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <label htmlFor="force-onedrive" className="text-sm">
                    Force immediate OneDrive provisioning
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {options.forceOneDriveProvisioning 
                    ? 'OneDrive will be provisioned immediately (2-3 min wait)'
                    : 'OneDrive provisioning will be handled in background'
                  }
                </p>
              </div>

              {options.forceOneDriveProvisioning && (
                <div className="space-y-2">
                  <label htmlFor="max-wait" className="text-sm font-medium">
                    Max Wait Time: {options.maxOneDriveWait}s
                  </label>
                  <input
                    type="range"
                    id="max-wait"
                    min="60"
                    max="300"
                    step="30"
                    value={options.maxOneDriveWait}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      maxOneDriveWait: parseInt(e.target.value)
                    }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 min</span>
                    <span>5 min</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 Force provisioning improves success rate from 20% to 80%+ based on POC testing
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}