/**
 * POC Phase 1: Client Credentials Authentication Test
 * 
 * Tests Azure App Registration with client_credentials flow
 * to obtain access token for Microsoft Graph API operations.
 * 
 * Issue: https://github.com/marcusp3t3rs/demoforge/issues/35
 */

import * as https from 'https';
import * as querystring from 'querystring';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env.local') });

// TypeScript interfaces for response types
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  ext_expires_in?: number;
  scope?: string;
}

interface GraphError {
  error: {
    code: string;
    message: string;
  };
}

interface TestResult {
  name: string;
  status: 'success' | 'failed';
  duration_ms?: number;
  details?: any;
  error?: string;
  note?: string;
}

interface POCResults {
  timestamp: string;
  phase: string;
  issue: string;
  tests: TestResult[];
}

interface ValidationResult {
  valid: boolean;
  organization?: string;
  statusCode: number;
}

export class GraphAuthenticator {
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.tenantId = process.env.AZURE_TENANT_ID || '';
    this.clientId = process.env.AZURE_CLIENT_ID || '';
    this.clientSecret = process.env.AZURE_CLIENT_SECRET || '';

    if (!this.tenantId || !this.clientId || !this.clientSecret) {
      throw new Error('Missing required environment variables: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET');
    }
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
              reject(new Error(`Token request failed: ${response.error_description || response.error || 'Unknown error'}`));
              return;
            }

            if (!response.access_token) {
              reject(new Error('No access token in response'));
              return;
            }

            resolve(response as TokenResponse);
          } catch (error: any) {
            reject(new Error(`Failed to parse token response: ${error.message}`));
          }
        });
      });

      req.on('error', (error: any) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.write(params);
      req.end();
    });
  }

  async validateToken(accessToken: string): Promise<ValidationResult> {
    // Try to validate token by making a simple Graph API call
    // Note: client_credentials tokens cannot access /me endpoint
    // We'll try a different endpoint that should work with app-only permissions
    const apiUrl = 'https://graph.microsoft.com/v1.0/organization';

    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise<ValidationResult>((resolve, reject) => {
      const req = https.request(apiUrl, options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
              resolve({
                valid: true,
                organization: response.value?.[0]?.displayName || 'Organization data available',
                statusCode: res.statusCode
              });
            } else {
              reject(new Error(`Validation failed: ${response.error?.message || 'Unknown error'}`));
            }
          } catch (error: any) {
            reject(new Error(`Failed to parse validation response: ${error.message}`));
          }
        });
      });

      req.on('error', (error: any) => {
        reject(new Error(`Validation request failed: ${error.message}`));
      });

      req.end();
    });
  }
}

async function runAuthenticationPOC(): Promise<void> {
  console.log('🧪 POC Phase 1: Microsoft Graph Authentication Test');
  console.log('='.repeat(60));

  const results: POCResults = {
    timestamp: new Date().toISOString(),
    phase: 'Phase 1 - Authentication',
    issue: 'https://github.com/marcusp3t3rs/demoforge/issues/35',
    tests: []
  };

  try {
    // Initialize authenticator
    console.log('📋 Environment Configuration Check:');
    const authenticator = new GraphAuthenticator();
    console.log(`   Tenant ID: ${process.env.AZURE_TENANT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Client ID: ${process.env.AZURE_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Client Secret: ${process.env.AZURE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log('');

    try {
      // Test 1: Get Access Token
      console.log('🔑 Test 1: Obtaining Access Token...');
      const startTime = Date.now();
      
      const tokenResponse = await authenticator.getAccessToken();
      const endTime = Date.now();
      
      console.log('   ✅ Token acquired successfully!');
      console.log(`   📊 Token type: ${tokenResponse.token_type}`);
      console.log(`   ⏰ Expires in: ${tokenResponse.expires_in} seconds`);
      console.log(`   🔍 Scope: ${tokenResponse.scope || 'Not specified'}`);

      results.tests.push({
        name: 'Token Acquisition',
        status: 'success',
        duration_ms: endTime - startTime,
        details: {
          token_type: tokenResponse.token_type,
          expires_in: tokenResponse.expires_in,
          scope: tokenResponse.scope
        }
      });

      try {
        // Test 2: Validate Token
        console.log('');
        console.log('🔍 Test 2: Validating Access Token...');
        const validationStart = Date.now();
        
        const validation = await authenticator.validateToken(tokenResponse.access_token);
        const validationEnd = Date.now();
        
        console.log('   ✅ Token validation successful!');
        console.log(`   🏢 Organization: ${validation.organization}`);

        results.tests.push({
          name: 'Token Validation',
          status: 'success',
          duration_ms: validationEnd - validationStart,
          details: validation
        });

      } catch (validationError: any) {
        console.log(`   ⚠️  Token validation: ${validationError.message}`);
        console.log('   ℹ️  This may be normal for client_credentials tokens with certain endpoints');

        results.tests.push({
          name: 'Token Validation',
          status: 'failed',
          error: validationError.message,
          note: 'client_credentials tokens cannot access /me endpoint - this is normal'
        });
      }

    } catch (tokenError: any) {
      console.log(`   ❌ Token acquisition failed: ${tokenError.message}`);

      results.tests.push({
        name: 'Token Acquisition',
        status: 'failed',
        error: tokenError.message
      });
    }

  } catch (setupError: any) {
    console.log(`❌ Setup error: ${setupError.message}`);

    results.tests.push({
      name: 'Setup',
      status: 'failed',
      error: setupError.message
    });
  }

  // Write results to file
  const resultsPath = path.join(process.cwd(), 'poc-results.json');
  try {
    await fs.promises.writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Results saved to: ${resultsPath}`);
  } catch (writeError: any) {
    console.log(`\n⚠️  Could not save results: ${writeError.message}`);
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   Successful: ${results.tests.filter(t => t.status === 'success').length}`);
  console.log(`   Failed: ${results.tests.filter(t => t.status === 'failed').length}`);
  console.log('');
  console.log('Next Steps:');
  console.log('   1. If authentication succeeded, proceed to Phase 2 (User Creation)');
  console.log('   2. Update GitHub issue #35 with results');
  console.log('   3. Configure additional Graph API permissions if needed');
}

// Run the POC if this file is executed directly
if (require.main === module) {
  runAuthenticationPOC().catch(console.error);
}