/**
 * Tenant Discovery Service for E1-US1
 * 
 * Implements domain-based tenant discovery using Microsoft OpenID Connect discovery
 * Extracts tenant information from user email addresses dynamically
 */

export interface TenantDiscoveryResult {
  /** Discovery success status */
  success: boolean;
  /** Extracted domain from email */
  domain?: string;
  /** Discovered tenant ID */
  tenantId?: string;
  /** OpenID configuration endpoints */
  endpoints?: {
    authorization: string;
    token: string;
    userInfo: string;
    issuer: string;
  };
  /** Error information if discovery failed */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface DomainInfo {
  /** Original domain from email */
  domain: string;
  /** Whether domain appears to be a Microsoft tenant */
  isMicrosoftTenant: boolean;
  /** Custom domain vs onmicrosoft.com */
  isCustomDomain: boolean;
  /** Suggested tenant identifier for discovery */
  tenantIdentifier: string;
}

/**
 * Microsoft Tenant Discovery Service
 * Handles domain → tenant ID resolution for multi-tenant authentication
 */
export class TenantDiscoveryService {
  
  /**
   * Extract domain information from email address
   */
  static extractDomainInfo(email: string): DomainInfo {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address provided');
    }

    const domain = email.split('@')[1].toLowerCase();
    
    // Check if it's already a Microsoft tenant domain
    const isMicrosoftTenant = domain.endsWith('.onmicrosoft.com') || 
                            domain.endsWith('.microsoftonline.com');
    
    const isCustomDomain = !isMicrosoftTenant;
    
    // For discovery, use the domain directly
    // Microsoft will handle both custom domains and .onmicrosoft.com
    const tenantIdentifier = domain;

    return {
      domain,
      isMicrosoftTenant,
      isCustomDomain,
      tenantIdentifier,
    };
  }

  /**
   * Prepare authentication flow - no upfront discovery needed
   * Use the common endpoint and let Microsoft resolve the tenant during login
   */
  static async prepareAuthFlow(email: string): Promise<TenantDiscoveryResult> {
    try {
      const domainInfo = this.extractDomainInfo(email);
      
      console.log(`🚀 Preparing auth flow for email: ${email}`);
      console.log(`📧 Domain: ${domainInfo.domain}`);
      
      // Always use the common endpoint - let Microsoft handle tenant resolution
      // This avoids CORS issues and follows Microsoft's recommended pattern
      return {
        success: true,
        domain: domainInfo.domain,
        tenantId: 'common', // Microsoft will resolve the actual tenant during auth
        endpoints: {
          authorization: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          userInfo: 'https://graph.microsoft.com/oidc/userinfo',
          issuer: 'https://login.microsoftonline.com/common/v2.0',
        },
      };

    } catch (error) {
      console.error(`🚨 Auth flow preparation failed for ${email}:`, error);
      
      return {
        success: false,
        error: {
          code: 'AUTH_PREP_FAILED',
          message: `Failed to prepare authentication: ${error}`,
          details: error,
        },
      };
    }
  }

  /**
   * Extract tenant information from authentication callback
   * This is where we get the actual tenant info after successful login
   */
  static extractTenantFromCallback(idToken?: string, accessToken?: string): {
    tenantId?: string;
    tenantName?: string;
    domain?: string;
  } {
    try {
      // Parse ID token to extract tenant information
      if (idToken) {
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        
        return {
          tenantId: payload.tid, // Tenant ID
          tenantName: payload.iss?.match(/\/([^\/]+)\/v2.0$/)?.[1], // Extract from issuer
          domain: payload.email?.split('@')[1], // User's domain
        };
      }
      
      return {};
    } catch (error) {
      console.warn('Could not extract tenant info from tokens:', error);
      return {};
    }
  }



  /**
   * Validate that a discovered tenant can be used for authentication
   */
  static async validateTenantAccess(tenantId: string, clientId: string): Promise<boolean> {
    try {
      // Simple validation: check if we can access the tenant's OAuth endpoints
      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`;
      
      // Make a HEAD request to check if the endpoint is accessible
      const response = await fetch(authUrl, { 
        method: 'HEAD',
        // Add minimal required params to avoid 400 errors
        headers: {
          'Accept': 'application/json',
        }
      });
      
      // 200-399 range indicates the tenant endpoint is accessible
      return response.status < 400;
      
    } catch (error) {
      console.warn(`⚠️ Tenant validation failed for ${tenantId}:`, error);
      return false;
    }
  }

  /**
   * Get authentication URL with proper tenant context
   * This integrates discovered tenant info with OAuth flow
   */
  static buildAuthenticationUrl(
    discoveryResult: TenantDiscoveryResult,
    clientId: string,
    redirectUri: string,
    state: string,
    codeChallenge: string,
    loginHint?: string
  ): string {
    if (!discoveryResult.success || !discoveryResult.endpoints) {
      throw new Error('Cannot build auth URL from failed discovery result');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: 'openid profile email User.Read Files.ReadWrite.All offline_access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    // Add login hint for better UX and tenant resolution
    if (loginHint) {
      params.append('login_hint', loginHint);
    }

    // Add domain hint for custom domains
    if (discoveryResult.domain && !discoveryResult.domain.endsWith('.onmicrosoft.com')) {
      params.append('domain_hint', discoveryResult.domain);
    }

    return `${discoveryResult.endpoints.authorization}?${params.toString()}`;
  }
}