/**
 * Authentication Types for E1-US1: Tenant Admin Authentication
 * 
 * Defines TypeScript interfaces based on POC learnings and Microsoft Graph patterns
 */

export interface AuthConfig {
  /** Microsoft Entra ID tenant configuration */
  tenantId: string;
  /** Application (client) ID from Azure app registration */
  clientId: string;
  /** Client secret for server-side token exchange */
  clientSecret: string;
  /** Redirect URI for OAuth callback */
  redirectUri: string;
  /** OneDrive provisioning configuration */
  oneDriveProvisioning: {
    /** Force OneDrive creation immediately after user creation (default: true) */
    forceProvisioning: boolean;
    /** Maximum wait time for OneDrive provisioning (seconds) */
    maxWaitTime: number;
    /** Retry attempts for OneDrive access */
    retryAttempts: number;
  };
}

export interface TenantContext {
  /** Tenant ID from Microsoft Entra ID */
  tenantId: string;
  /** Tenant display name */
  displayName: string;
  /** Tenant domain (e.g., contoso.onmicrosoft.com) */
  defaultDomain: string;
  /** Available license SKUs in tenant */
  availableLicenses: LicenseSku[];
}

export interface LicenseSku {
  /** SKU identifier (e.g., DEVELOPERPACK_E5) */
  skuId: string;
  /** Human-readable name */
  displayName: string;
  /** Available units for assignment */
  prepaidUnits: number;
  /** Currently consumed units */
  consumedUnits: number;
}

export interface TokenExchangeResult {
  /** Exchange success status */
  success: boolean;
  /** Token set (if successful) */
  tokens?: TokenSet;
  /** Error information (if failed) */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AuthenticatedUser {
  /** User object ID from Microsoft Graph */
  id: string;
  /** User principal name (email) */
  userPrincipalName: string;
  /** Display name */
  displayName: string;
  /** User roles in the tenant */
  roles: string[];
  /** Tenant context this user belongs to */
  tenant: TenantContext;
}

export interface TokenSet {
  /** Access token for Microsoft Graph API calls */
  accessToken: string;
  /** Refresh token for token renewal */
  refreshToken: string;
  /** ID token containing user claims */
  idToken: string;
  /** Token expiration timestamp */
  expiresAt: number;
  /** Token scopes granted */
  scope: string[];
}

export interface AuthResult {
  /** Authentication success status */
  success: boolean;
  /** Authenticated user information (if successful) */
  user?: AuthenticatedUser;
  /** Token set for API access (if successful) */
  tokens?: TokenSet;
  /** Error information (if failed) */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export enum OneDriveSetupStatus {
  /** OneDrive is fully provisioned and accessible */
  READY = 'ready',
  /** OneDrive provisioning is in progress */
  PROVISIONING = 'provisioning',
  /** OneDrive is not set up yet (new user scenario) */
  NOT_SETUP = 'not_setup',
  /** OneDrive setup failed or encountered errors */
  ERROR = 'error',
  /** OneDrive status unknown or inaccessible */
  UNKNOWN = 'unknown'
}

export interface OneDriveProvisioningResult {
  /** Provisioning success status */
  success: boolean;
  /** OneDrive setup status */
  status: OneDriveSetupStatus;
  /** OneDrive URL (if successful) */
  driveUrl?: string;
  /** Time taken for provisioning (seconds) */
  provisioningTime?: number;
  /** User-friendly message about OneDrive status */
  statusMessage?: string;
  /** Error information (if failed) */
  error?: {
    code: string;
    message: string;
    requiresAsync: boolean; // True if should fall back to background job
    isNewUserScenario?: boolean; // True for "not set up yet" cases
  };
}

export interface ProvisioningOptions {
  /** Force immediate OneDrive provisioning */
  forceOneDriveProvisioning?: boolean;
  /** Maximum wait time for OneDrive (overrides config) */
  maxOneDriveWait?: number;
  /** Skip OneDrive provisioning entirely */
  skipOneDriveProvisioning?: boolean;
}

/**
 * Common OneDrive provisioning error codes from POC observations
 */
export enum OneDriveErrorCode {
  /** OneDrive not set up yet - common for new users */
  NOT_SETUP_YET = 'OneDriveNotSetupYet',
  /** OneDrive provisioning in progress */
  PROVISIONING_IN_PROGRESS = 'OneDriveProvisioningInProgress',
  /** OneDrive access denied */
  ACCESS_DENIED = 'OneDriveAccessDenied',
  /** OneDrive service unavailable */
  SERVICE_UNAVAILABLE = 'OneDriveServiceUnavailable',
  /** Timeout waiting for OneDrive provisioning */
  PROVISIONING_TIMEOUT = 'OneDriveProvisioningTimeout',
  /** Unknown OneDrive error */
  UNKNOWN_ERROR = 'OneDriveUnknownError'
}

/**
 * Microsoft Graph API error response structure
 * Based on POC error handling patterns
 */
export interface GraphError {
  error: {
    code: string;
    message: string;
    innerError?: {
      code?: string;
      message?: string;
      'request-id'?: string;
      date?: string;
    };
  };
}

/**
 * Audit event for authentication operations
 * Supports E1-US1 acceptance criteria: "Session created with audit entry"
 */
export interface AuthAuditEvent {
  /** Event timestamp */
  timestamp: string;
  /** Event type */
  eventType: 'sign_in' | 'sign_out' | 'token_refresh' | 'consent_granted' | 'provisioning_started';
  /** User performing the action */
  userId: string;
  /** Tenant context */
  tenantId: string;
  /** Session ID */
  sessionId: string;
  /** Event success status */
  success: boolean;
  /** Audit event metadata */
  metadata?: Record<string, unknown>;
}