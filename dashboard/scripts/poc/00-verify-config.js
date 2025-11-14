/**
 * POC Phase 0: Configuration Verification Script
 * 
 * Verifies Azure App Registration configuration and permissions
 * without requiring manual inspection of the Azure portal.
 * 
 * This script will be useful for both POC testing and the final product
 * to help users troubleshoot their Azure setup.
 */

import * as https from 'https';
import * as querystring from 'querystring';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env.local') });

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface PermissionCheck {
  name: string;
  required: boolean;
  description: string;
  endpoint: string;
  method: string;
}

interface VerificationResult {
  timestamp: string;
  tenant_id: string;
  client_id: string;
  authentication: {
    success: boolean;
    token_acquired: boolean;
    token_expires_in?: number;
    granted_scopes?: string[];
    error?: string;
  };
  permissions: {
    name: string;
    required: boolean;
    available: boolean;
    tested: boolean;
    error?: string;
  }[];
  summary: {
    total_permissions: number;
    available_permissions: number;
    missing_required: string[];
    ready_for_poc: boolean;
  };
}

class AzureConfigVerifier {
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.tenantId = process.env.AZURE_TENANT_ID || '';
    this.clientId = process.env.AZURE_CLIENT_ID || '';
    this.clientSecret = process.env.AZURE_CLIENT_SECRET || '';
  }

  async getAccessToken(): Promise<TokenResponse> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;

    const params = querystring.stringify({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'https://graph.microsoft.com/.default'
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params)
      }
    };

    return new Promise<TokenResponse>((resolve, reject) => {
      const req = https.request(tokenUrl, options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode !== 200) {
              reject(new Error(`Authentication failed: ${response.error_description || response.error || 'Unknown error'}`));
              return;
            }

            resolve(response as TokenResponse);
          } catch (error: any) {
            reject(new Error(`Failed to parse token response: ${error.message}`));
          }
        });
      });

      req.on('error', (error: any) => {
        reject(new Error(`Token request failed: ${error.message}`));
      });

      req.write(params);
      req.end();
    });
  }

  async testPermission(accessToken: string, permission: PermissionCheck): Promise<{ available: boolean; error?: string }> {
    const options = {
      method: permission.method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve) => {
      const req = https.request(permission.endpoint, options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          // Success codes indicate permission is available
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve({ available: true });
          } 
          // 403 typically means permission denied
          else if (res.statusCode === 403) {
            try {
              const response = JSON.parse(data);
              resolve({ 
                available: false, 
                error: `Permission denied: ${response.error?.message || 'Insufficient privileges'}`
              });
            } catch {
              resolve({ available: false, error: 'Permission denied (403)' });
            }
          }
          // Other errors might indicate different issues
          else {
            try {
              const response = JSON.parse(data);
              resolve({ 
                available: false, 
                error: `HTTP ${res.statusCode}: ${response.error?.message || 'Unknown error'}`
              });
            } catch {
              resolve({ available: false, error: `HTTP ${res.statusCode}` });
            }
          }
        });
      });

      req.on('error', (error: any) => {
        resolve({ available: false, error: `Network error: ${error.message}` });
      });

      // For POST requests that create resources, we might need a body
      if (permission.method === 'POST' && permission.name.includes('User')) {
        // Test user creation with minimal payload
        const testUserPayload = JSON.stringify({
          displayName: "Config Test User (Do Not Create)",
          userPrincipalName: `configtest-${Date.now()}@${this.tenantId}.onmicrosoft.com`,
          mailNickname: `configtest${Date.now()}`,
          accountEnabled: false,
          passwordProfile: {
            forceChangePasswordNextSignIn: true,
            password: "TempPass123!"
          }
        });
        req.write(testUserPayload);
      }

      req.end();
    });
  }

  async verifyConfiguration(): Promise<VerificationResult> {
    const result: VerificationResult = {
      timestamp: new Date().toISOString(),
      tenant_id: this.tenantId,
      client_id: this.clientId,
      authentication: {
        success: false,
        token_acquired: false
      },
      permissions: [],
      summary: {
        total_permissions: 0,
        available_permissions: 0,
        missing_required: [],
        ready_for_poc: false
      }
    };

    // Define permissions to test
    const permissionsToTest: PermissionCheck[] = [
      {
        name: 'User.ReadWrite.All',
        required: true,
        description: 'Create and manage users',
        endpoint: 'https://graph.microsoft.com/v1.0/users',
        method: 'GET'
      },
      {
        name: 'Directory.ReadWrite.All',
        required: true,
        description: 'Read and write directory data',
        endpoint: 'https://graph.microsoft.com/v1.0/organization',
        method: 'GET'
      },
      {
        name: 'Mail.ReadWrite',
        required: true,
        description: 'Read and write mail',
        endpoint: 'https://graph.microsoft.com/v1.0/users',
        method: 'GET'
      },
      {
        name: 'Files.ReadWrite.All',
        required: true,
        description: 'Read and write files',
        endpoint: 'https://graph.microsoft.com/v1.0/sites',
        method: 'GET'
      },
      {
        name: 'Chat.ReadWrite.All',
        required: false,
        description: 'Read and write chats',
        endpoint: 'https://graph.microsoft.com/v1.0/chats',
        method: 'GET'
      }
    ];

    try {
      // Test authentication
      console.log('🔍 Testing Azure App Configuration...');
      console.log(`   Tenant: ${this.tenantId}`);
      console.log(`   Client: ${this.clientId}`);
      console.log('');

      const tokenResponse = await this.getAccessToken();
      
      result.authentication.success = true;
      result.authentication.token_acquired = true;
      result.authentication.token_expires_in = tokenResponse.expires_in;
      result.authentication.granted_scopes = tokenResponse.scope?.split(' ') || [];

      console.log('✅ Authentication successful!');
      console.log(`   Token expires in: ${tokenResponse.expires_in} seconds`);
      console.log(`   Granted scopes: ${tokenResponse.scope || 'Default scope'}`);
      console.log('');

      // Test each permission
      console.log('🔐 Testing Permissions...');
      
      for (const permission of permissionsToTest) {
        console.log(`   Testing ${permission.name}...`);
        
        const permissionResult = await this.testPermission(tokenResponse.access_token, permission);
        
        const permissionCheck = {
          name: permission.name,
          required: permission.required,
          available: permissionResult.available,
          tested: true,
          error: permissionResult.error
        };

        result.permissions.push(permissionCheck);

        if (permissionResult.available) {
          console.log(`   ✅ ${permission.name} - Available`);
          result.summary.available_permissions++;
        } else {
          const status = permission.required ? '❌' : '⚠️';
          console.log(`   ${status} ${permission.name} - ${permissionResult.error || 'Not available'}`);
          
          if (permission.required) {
            result.summary.missing_required.push(permission.name);
          }
        }
      }

      result.summary.total_permissions = permissionsToTest.length;
      result.summary.ready_for_poc = result.summary.missing_required.length === 0;

    } catch (error: any) {
      result.authentication.success = false;
      result.authentication.error = error.message;
      console.log(`❌ Authentication failed: ${error.message}`);
    }

    return result;
  }
}

async function runConfigVerification(): Promise<void> {
  console.log('🧪 Azure Configuration Verification');
  console.log('='.repeat(50));

  // Check environment variables
  if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
    console.log('❌ Missing environment variables!');
    console.log('   Please ensure .env.local contains:');
    console.log('   - AZURE_TENANT_ID');
    console.log('   - AZURE_CLIENT_ID');
    console.log('   - AZURE_CLIENT_SECRET');
    console.log('');
    console.log('   Copy .env.template to .env.local and fill in your values.');
    return;
  }

  const verifier = new AzureConfigVerifier();
  const result = await verifier.verifyConfiguration();

  // Summary
  console.log('');
  console.log('📊 Verification Summary:');
  console.log(`   Available permissions: ${result.summary.available_permissions}/${result.summary.total_permissions}`);
  
  if (result.summary.missing_required.length > 0) {
    console.log(`   ❌ Missing required permissions: ${result.summary.missing_required.join(', ')}`);
    console.log('');
    console.log('🔧 Required Actions:');
    console.log('   1. Go to entra.microsoft.com');
    console.log('   2. Navigate to your app registration');
    console.log('   3. Add missing permissions under API permissions');
    console.log('   4. Grant admin consent for all permissions');
  }

  if (result.summary.ready_for_poc) {
    console.log('   ✅ Configuration ready for POC testing!');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Run: npx ts-node scripts/poc/01-authenticate.ts');
    console.log('   2. Run: npx ts-node scripts/poc/02-create-user.ts');
  } else {
    console.log('   ❌ Configuration needs fixes before POC testing');
  }

  // Save detailed results
  const resultsPath = path.join(process.cwd(), 'config-verification.json');
  try {
    await fs.promises.writeFile(resultsPath, JSON.stringify(result, null, 2));
    console.log(`   📄 Detailed results saved to: ${resultsPath}`);
  } catch (writeError: any) {
    console.log(`   ⚠️  Could not save results: ${writeError.message}`);
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  runConfigVerification().catch(console.error);
}

export { AzureConfigVerifier };