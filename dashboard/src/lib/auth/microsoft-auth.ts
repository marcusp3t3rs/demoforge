/**
 * Microsoft Authentication Service for E1-US1
 * 
 * Implements POC authentication concepts in proper TypeScript architecture
 * - Client credentials flow → OIDC authorization code flow
 * - Standalone script → Next.js integrated service  
 * - 100% POC success rate → Production-ready error handling
 */

import type {
  AuthConfig,
  AuthResult,
  TokenSet,
  AuthenticatedUser,
  OneDriveProvisioningResult,
  ProvisioningOptions,
  TenantContext,
  GraphError,
  AuthAuditEvent,
} from './types';
import { TenantDiscoveryService } from './tenant-discovery';
import { OneDriveSetupStatus, OneDriveErrorCode } from './types';

export { OneDriveSetupStatus, OneDriveErrorCode } from './types';
import { getMicrosoftEndpoints, REQUIRED_SCOPES } from './auth-config';

export class MicrosoftAuthService {
  private config: any = null;

  /**
   * Load authentication configuration from server-side API
   * Environment variables are only available server-side in Next.js
   */
  private async loadConfig() {
    if (this.config) {
      return this.config;
    }

    try {
      const response = await fetch('/api/auth/config');
      if (!response.ok) {
        throw new Error(`Failed to load auth config: ${response.status}`);
      }
      
      this.config = await response.json();
      console.log('🔧 Client: Loaded auth config from API');
      return this.config;
      
    } catch (error) {
      console.error('🚨 Client: Failed to load auth config:', error);
      throw new Error('Failed to load authentication configuration');
    }
  }

  /**
   * Initiate Microsoft OAuth 2.0 authorization flow
   * Implements E1-US1 acceptance criteria: "Redirect to Microsoft login with PKCE/state protection"
   */
  async initiateAuthFlow(options?: ProvisioningOptions & {
    tenantId?: string;
    loginHint?: string;
    domainHint?: string;
  }): Promise<string> {
    const config = await this.loadConfig();
        const shouldForceOneDrive = options?.forceOneDriveProvisioning ?? 
                                  config.oneDriveProvisioning.forceProvisioning;
    
    // Use provided tenant ID or fall back to config (usually 'common')
    const tenantId = options?.tenantId || config.tenantId;
    
    console.log(`🚀 Starting authentication flow for tenant: ${tenantId}`);
    console.log(`⚡ OneDrive force provisioning: ${shouldForceOneDrive}`);
    if (options?.loginHint) {
      console.log(`👤 Login hint: ${options.loginHint}`);
    }
    
    // Generate PKCE parameters
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const state = crypto.randomUUID();
    
    // Store PKCE parameters for callback
    sessionStorage.setItem('code_verifier', codeVerifier);
    sessionStorage.setItem('auth_state', state);
    
    // Store OneDrive options for callback
    if (options) {
      sessionStorage.setItem('onedrive_options', JSON.stringify(options));
    }
    
    // Build authorization URL with dynamic tenant
    const authParams = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      response_mode: 'query',
      scope: 'openid profile email User.Read Files.ReadWrite.All offline_access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    
    // Add login hint for better UX and tenant resolution
    if (options?.loginHint) {
      authParams.append('login_hint', options.loginHint);
    }
    
    // Add domain hint for custom domains
    if (options?.domainHint) {
      authParams.append('domain_hint', options.domainHint);
    }
    
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${authParams.toString()}`;
    
    console.log(`📍 Redirecting to: ${authUrl}`);
    return authUrl;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   * Implements E1-US1 acceptance criteria: "Handle Microsoft OIDC authentication flow"
   */
  async handleCallback(
    code: string, 
    state: string, 
    codeVerifier: string,
    options?: ProvisioningOptions
  ): Promise<AuthResult> {
    try {
      const config = await this.loadConfig();
      
      // Get OneDrive provisioning preferences from options or config
      // Note: state is just a CSRF protection UUID, not JSON data
      const shouldForceOneDrive = options?.forceOneDriveProvisioning ?? 
                                  config.oneDriveProvisioning.forceProvisioning;

      console.log(`🔄 Processing callback with OneDrive force: ${shouldForceOneDrive}`);

      // Step 1: Exchange code for tokens (based on POC token exchange patterns)
      const tokens = await this.exchangeCodeForTokens(code, codeVerifier);
      if (!tokens.success) {
        return tokens;
      }

      // Step 2: Get user and tenant information (based on POC user creation patterns)
      const user = await this.getUserInfo(tokens.tokens!.accessToken);
      if (!user.success) {
        return user;
      }

      // Step 3: Force OneDrive provisioning if enabled (new capability beyond POC)
      let oneDriveResult: OneDriveProvisioningResult | undefined;
      if (shouldForceOneDrive && !options?.skipOneDriveProvisioning) {
        console.log(`⚡ Forcing OneDrive provisioning for user: ${user.user!.userPrincipalName}`);
        oneDriveResult = await this.forceOneDriveProvisioning(
          user.user!.id, 
          tokens.tokens!.accessToken,
          {
            maxWaitTime: options?.maxOneDriveWait ?? config.oneDriveProvisioning.maxWaitTime,
            retryAttempts: config.oneDriveProvisioning.retryAttempts,
          }
        );
      }

      // Step 4: Create audit entry (E1-US1 requirement)
      await this.createAuthAuditEvent({
        eventType: 'sign_in',
        userId: user.user!.id,
        tenantId: user.user!.tenant.tenantId,
        success: true,
        sessionId: crypto.randomUUID(),
        metadata: {
          oneDriveForced: shouldForceOneDrive,
          oneDriveSuccess: oneDriveResult?.success,
          oneDriveTime: oneDriveResult?.provisioningTime,
        },
      });

      return {
        success: true,
        user: user.user,
        tokens: tokens.tokens,
      };

    } catch (error) {
      console.error('🚨 Auth callback error:', error);
      return {
        success: false,
        error: {
          code: 'CALLBACK_ERROR',
          message: 'Failed to process authentication callback',
          details: error,
        },
      };
    }
  }

  /**
   * Exchange authorization code for access tokens
   * Based on POC client credentials flow, adapted for authorization code flow
   */
  private async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<AuthResult> {
    try {
      const config = await this.loadConfig();
      
      // Build token request parameters
      const tokenParams = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: 'openid profile email User.Read Files.ReadWrite.All offline_access',
        code: code,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      });
      
      // Extract tenant ID from the authorization code response or use common
      // For multi-tenant apps, we often need to use the tenant from the auth response
      const tenantForToken = config.tenantId === 'common' ? 'common' : config.tenantId;
      
      const response = await fetch(`https://login.microsoftonline.com/${tenantForToken}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      });      if (!response.ok) {
        const errorData = await response.json() as GraphError;
        console.error('🚨 Token exchange failed:', errorData);
        return {
          success: false,
          error: {
            code: errorData.error.code,
            message: errorData.error.message,
            details: errorData,
          },
        };
      }

      const tokenData = await response.json();
      
      const tokens: TokenSet = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        idToken: tokenData.id_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        scope: tokenData.scope.split(' '),
      };

      console.log(`✅ Token exchange successful, expires in ${tokenData.expires_in}s`);

      return {
        success: true,
        tokens,
      };

    } catch (error) {
      console.error('🚨 Token exchange error:', error);
      return {
        success: false,
        error: {
          code: 'TOKEN_EXCHANGE_ERROR',
          message: 'Failed to exchange code for tokens',
          details: error,
        },
      };
    }
  }

  /**
   * Get authenticated user information
   * Based on POC user validation patterns
   */
  private async getUserInfo(accessToken: string): Promise<AuthResult> {
    try {
      // Get user information
      const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json() as GraphError;
        return {
          success: false,
          error: {
            code: errorData.error.code,
            message: errorData.error.message,
            details: errorData,
          },
        };
      }

      const userData = await userResponse.json();

      // Get tenant information (based on POC tenant validation)
      const tenantResponse = await fetch('https://graph.microsoft.com/v1.0/organization', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const tenantData = await tenantResponse.json();
      const tenant = tenantData.value[0];

      // Get available licenses (from POC license checking patterns)
      const licensesResponse = await fetch('https://graph.microsoft.com/v1.0/subscribedSkus', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const licensesData = await licensesResponse.json();

      const tenantContext: TenantContext = {
        tenantId: tenant.id,
        displayName: tenant.displayName,
        defaultDomain: tenant.verifiedDomains.find((d: any) => d.isDefault)?.name || '',
        availableLicenses: licensesData.value.map((sku: any) => ({
          skuId: sku.skuId,
          displayName: sku.skuPartNumber,
          prepaidUnits: sku.prepaidUnits.enabled,
          consumedUnits: sku.consumedUnits,
        })),
      };

      const user: AuthenticatedUser = {
        id: userData.id,
        userPrincipalName: userData.userPrincipalName,
        displayName: userData.displayName,
        roles: [], // TODO: Extract from token claims
        tenant: tenantContext,
      };

      console.log(`✅ User info retrieved: ${user.displayName} (${user.userPrincipalName})`);

      return {
        success: true,
        user,
      };

    } catch (error) {
      console.error('🚨 Get user info error:', error);
      return {
        success: false,
        error: {
          code: 'USER_INFO_ERROR',
          message: 'Failed to retrieve user information',
          details: error,
        },
      };
    }
  }

  /**
   * Force OneDrive provisioning - NEW capability beyond POC
   * Addresses POC limitation: 5-15 minute OneDrive delay
   */
  private async forceOneDriveProvisioning(
    userId: string, 
    accessToken: string,
    options: { maxWaitTime: number; retryAttempts: number }
  ): Promise<OneDriveProvisioningResult> {
    const startTime = Date.now();
    
    try {
      console.log(`⚡ Starting forced OneDrive provisioning for user ${userId}`);

      // Method 1: Access user's drive to trigger creation
      for (let attempt = 1; attempt <= options.retryAttempts; attempt++) {
        try {
          const driveResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${userId}/drive`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (driveResponse.ok) {
            const driveData = await driveResponse.json();
            const provisioningTime = (Date.now() - startTime) / 1000;
            
            console.log(`✅ OneDrive provisioned in ${provisioningTime}s (attempt ${attempt})`);
            
            return {
              success: true,
              status: OneDriveSetupStatus.READY,
              driveUrl: driveData.webUrl,
              provisioningTime,
              statusMessage: 'OneDrive is ready and accessible',
            };
          }

          // Check for specific "not set up yet" scenario
          if (driveResponse.status === 404) {
            const errorData = await driveResponse.json().catch(() => null);
            
            // This is the scenario you observed in the tenant
            if (errorData?.error?.message?.includes('not be set up yet') || 
                errorData?.error?.message?.includes('Try again in a few minutes')) {
              console.log(`🔄 OneDrive not set up yet for new user (attempt ${attempt})`);
              
              // For first attempt, return immediate feedback about new user scenario
              if (attempt === 1) {
                return {
                  success: false,
                  status: OneDriveSetupStatus.NOT_SETUP,
                  statusMessage: 'OneDrive is not set up yet. This is normal for new users and may take a few minutes.',
                  error: {
                    code: OneDriveErrorCode.NOT_SETUP_YET,
                    message: 'OneDrive not set up yet - this is expected for new users',
                    requiresAsync: true,
                    isNewUserScenario: true,
                  },
                };
              }
            }
          }

          // If not ready, wait before retry
          if (attempt < options.retryAttempts) {
            const waitTime = Math.min(attempt * 10, 30); // Progressive backoff, max 30s
            console.log(`⏳ OneDrive not ready, waiting ${waitTime}s before retry ${attempt + 1}`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
          }

        } catch (error) {
          console.warn(`⚠️ OneDrive provisioning attempt ${attempt} failed:`, error);
          
          if (attempt === options.retryAttempts) {
            throw error;
          }
        }

        // Check if we've exceeded max wait time
        if ((Date.now() - startTime) / 1000 > options.maxWaitTime) {
          break;
        }
      }

      // If we get here, provisioning didn't complete in time
      const provisioningTime = (Date.now() - startTime) / 1000;
      
      console.log(`⏰ OneDrive provisioning timeout after ${provisioningTime}s`);
      
      return {
        success: false,
        status: OneDriveSetupStatus.PROVISIONING,
        provisioningTime,
        statusMessage: 'OneDrive provisioning is taking longer than expected. This is normal for new users.',
        error: {
          code: OneDriveErrorCode.PROVISIONING_TIMEOUT,
          message: `OneDrive provisioning timeout after ${provisioningTime}s`,
          requiresAsync: true,
          isNewUserScenario: true,
        },
      };

    } catch (error) {
      const provisioningTime = (Date.now() - startTime) / 1000;
      console.error(`🚨 OneDrive provisioning failed after ${provisioningTime}s:`, error);
      
      return {
        success: false,
        status: OneDriveSetupStatus.ERROR,
        provisioningTime,
        error: {
          code: 'ONEDRIVE_ERROR',
          message: 'OneDrive provisioning failed',
          requiresAsync: true,
        },
      };
    }
  }

  /**
   * Generate code verifier for PKCE
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generate code challenge for PKCE
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Create authentication audit entry for compliance tracking
   * Supports E1-US1 acceptance criteria: "Session created with audit entry"
   */
  private async createAuthAuditEvent(event: Omit<AuthAuditEvent, 'timestamp'>): Promise<void> {
    const auditEvent: AuthAuditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // TODO: Integrate with actual audit logging system
    console.log(`📋 Auth audit event:`, {
      type: auditEvent.eventType,
      user: auditEvent.userId,
      tenant: auditEvent.tenantId,
      success: auditEvent.success,
      session: auditEvent.sessionId,
    });

    // In production, this would write to database/audit log
    // For now, just console logging for POC validation
  }
}