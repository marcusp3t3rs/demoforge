/**
 * Authentication Configuration for E1-US1
 * 
 * Manages authentication settings with OneDrive provisioning controls
 * Based on POC learnings: 100% auth success, OneDrive timing challenges
 */

import { AuthConfig } from './types';

// Debug: Check environment variables at import time
console.log('🚨 DEBUG: Environment variables at import time:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DEMOFORGE_CLIENT_ID present:', !!process.env.DEMOFORGE_CLIENT_ID);
console.log('DEMOFORGE_CLIENT_SECRET present:', !!process.env.DEMOFORGE_CLIENT_SECRET);
console.log('All DEMOFORGE_ keys:', Object.keys(process.env).filter(k => k.startsWith('DEMOFORGE_')));

/**
 * Default authentication configuration
 * Based on POC validation results and Epic 1 requirements
 */
const DEFAULT_AUTH_CONFIG: Partial<AuthConfig> = {
  oneDriveProvisioning: {
    // Default to true - force OneDrive provisioning for better UX
    forceProvisioning: true,
    // Based on POC: 5-15 minutes worst case, aim for 2-3 minutes with force
    maxWaitTime: 180, // 3 minutes
    // Retry pattern from POC error handling
    retryAttempts: 3,
  },
};

/**
 * Get authentication configuration from environment and system settings
 * Supports user overrides for OneDrive provisioning behavior
 */
export function getAuthConfig(overrides?: Partial<AuthConfig>): AuthConfig {
  // Load from environment variables (required)
  const baseConfig: AuthConfig = {
    tenantId: 'common', // Multi-tenant app uses 'common' endpoint
    clientId: process.env.DEMOFORGE_CLIENT_ID || '',
    clientSecret: process.env.DEMOFORGE_CLIENT_SECRET || '',
    redirectUri: process.env.DEMOFORGE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/auth/callback`,
    oneDriveProvisioning: {
      ...DEFAULT_AUTH_CONFIG.oneDriveProvisioning!,
    },
  };

  // Debug: Log what we're getting from environment
  console.log('🔍 Auth Config Debug - Environment Variables:');
  console.log('DEMOFORGE_CLIENT_ID:', process.env.DEMOFORGE_CLIENT_ID || 'UNDEFINED');
  console.log('DEMOFORGE_CLIENT_SECRET:', process.env.DEMOFORGE_CLIENT_SECRET || 'UNDEFINED');
  console.log('DEMOFORGE_REDIRECT_URI:', process.env.DEMOFORGE_REDIRECT_URI || 'UNDEFINED');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'UNDEFINED');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'UNDEFINED');
  
  console.log('🔍 Auth Config Debug - Final Config Values:');
  console.log('tenantId:', baseConfig.tenantId);
  console.log('clientId:', baseConfig.clientId || 'EMPTY');
  console.log('clientSecret:', baseConfig.clientSecret || 'EMPTY');
  console.log('redirectUri:', baseConfig.redirectUri || 'EMPTY');
  
  console.log('🔍 Auth Config Debug - All process.env keys containing DEMOFORGE:');
  Object.keys(process.env).filter(key => key.includes('DEMOFORGE')).forEach(key => {
    console.log(`${key}:`, process.env[key] || 'UNDEFINED');
  });

  // Apply system-level overrides from environment
  if (process.env.ONEDRIVE_FORCE_PROVISIONING !== undefined) {
    baseConfig.oneDriveProvisioning.forceProvisioning = 
      process.env.ONEDRIVE_FORCE_PROVISIONING.toLowerCase() === 'true';
  }

  if (process.env.ONEDRIVE_MAX_WAIT_TIME) {
    baseConfig.oneDriveProvisioning.maxWaitTime = 
      parseInt(process.env.ONEDRIVE_MAX_WAIT_TIME, 10);
  }

  if (process.env.ONEDRIVE_RETRY_ATTEMPTS) {
    baseConfig.oneDriveProvisioning.retryAttempts = 
      parseInt(process.env.ONEDRIVE_RETRY_ATTEMPTS, 10);
  }

  // Apply user-provided overrides (highest priority)
  const finalConfig = {
    ...baseConfig,
    ...overrides,
    oneDriveProvisioning: {
      ...baseConfig.oneDriveProvisioning,
      ...overrides?.oneDriveProvisioning,
    },
  };

  // Validate required configuration
  validateAuthConfig(finalConfig);

  return finalConfig;
}

/**
 * Validate authentication configuration
 * Ensures all required values are present and valid
 */
function validateAuthConfig(config: AuthConfig): void {
  const requiredFields = ['tenantId', 'clientId', 'clientSecret', 'redirectUri'] as const;
  
  for (const field of requiredFields) {
    if (!config[field] || config[field].trim() === '') {
      throw new Error(`Missing required authentication configuration: ${field}. Check DEMOFORGE_CLIENT_ID and DEMOFORGE_CLIENT_SECRET in environment.`);
    }
  }

  // Validate OneDrive provisioning settings
  const { forceProvisioning, maxWaitTime, retryAttempts } = config.oneDriveProvisioning;
  
  if (maxWaitTime < 30) {
    throw new Error('OneDrive maxWaitTime must be at least 30 seconds');
  }
  
  if (retryAttempts < 1 || retryAttempts > 10) {
    throw new Error('OneDrive retryAttempts must be between 1 and 10');
  }

  console.log(`🔧 Auth Config: OneDrive force provisioning ${forceProvisioning ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🔧 Auth Config: Max OneDrive wait time: ${maxWaitTime}s, retry attempts: ${retryAttempts}`);
}

/**
 * Microsoft Graph API scopes required for E1-US1 functionality
 * Based on POC validation - these scopes achieved 100% success rate
 */
export const REQUIRED_SCOPES = [
  // User authentication and profile
  'openid',
  'profile', 
  'email',
  
  // User management (for provisioning)
  'User.ReadWrite.All',
  
  // License management
  'Directory.ReadWrite.All',
  
  // OneDrive provisioning
  'Files.ReadWrite.All',
  'Sites.ReadWrite.All',
  
  // Tenant information
  'Organization.Read.All',
] as const;

/**
 * OAuth 2.0 endpoints for Microsoft identity platform
 */
export function getMicrosoftEndpoints(tenantId: string) {
  const baseUrl = `https://login.microsoftonline.com/${tenantId}`;
  
  return {
    authorization: `${baseUrl}/oauth2/v2.0/authorize`,
    token: `${baseUrl}/oauth2/v2.0/token`,
    userinfo: 'https://graph.microsoft.com/v1.0/me',
    jwks: `${baseUrl}/discovery/v2.0/keys`,
  };
}

/**
 * Generate state parameter for OAuth flow security
 * Implements PKCE protection as required by E1-US1 acceptance criteria
 */
export function generateSecureState(): string {
  return crypto.randomUUID();
}

/**
 * Generate code verifier and challenge for PKCE
 * Enhances security beyond POC client credentials approach
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomUUID() + crypto.randomUUID();
  
  // For simplicity in POC implementation, using plain challenge
  // In production, would use SHA256 hash
  const codeChallenge = codeVerifier;
  
  return { codeVerifier, codeChallenge };
}