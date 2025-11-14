/**
 * POC Phase 2: User Creation Test
 * 
 * Tests creating a user via Microsoft Graph API using client credentials flow.
 * Tests unattended provisioning capability and attribution tracking.
 * 
 * Issue: https://github.com/marcusp3t3rs/demoforge/issues/36
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { GraphAuthenticator, TokenResponse } from './01-authenticate';

// TypeScript interfaces
export interface UserCreationDetails {
  displayName: string;
  userPrincipalName: string;
  mailNickname: string;
  accountEnabled: boolean;
  passwordProfile: {
    forceChangePasswordNextSignIn: boolean;
    password: string;
  };
}

export interface CreatedUser {
  id: string;
  userPrincipalName: string;
  displayName: string;
  mail?: string;
  accountEnabled: boolean;
  createdDateTime: string;
  createdBy?: any;
}

interface TestResult {
  name: string;
  status: 'success' | 'failed';
  duration_ms?: number;
  details?: any;
  error?: string;
}

interface POCResults {
  timestamp: string;
  phase: string;
  issue: string;
  tests: TestResult[];
  createdUserId?: string;
  createdUserUPN?: string;
}

export class UserProvisioner {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createUser(userDetails: UserCreationDetails): Promise<CreatedUser> {
    const apiUrl = 'https://graph.microsoft.com/v1.0/users';

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise<CreatedUser>((resolve, reject) => {
      const req = https.request(apiUrl, options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 201) {
              resolve(response as CreatedUser);
            } else {
              reject(new Error(`User creation failed: ${response.error?.message || 'Unknown error'}`));
            }
          } catch (error: any) {
            reject(new Error(`Failed to parse user creation response: ${error.message}`));
          }
        });
      });

      req.on('error', (error: any) => {
        reject(new Error(`User creation request failed: ${error.message}`));
      });

      req.write(JSON.stringify(userDetails));
      req.end();
    });
  }

  async getUser(userId: string): Promise<CreatedUser> {
    const apiUrl = `https://graph.microsoft.com/v1.0/users/${userId}`;

    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise<CreatedUser>((resolve, reject) => {
      const req = https.request(apiUrl, options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
              resolve(response as CreatedUser);
            } else {
              reject(new Error(`Get user failed: ${response.error?.message || 'Unknown error'}`));
            }
          } catch (error: any) {
            reject(new Error(`Failed to parse get user response: ${error.message}`));
          }
        });
      });

      req.on('error', (error: any) => {
        reject(new Error(`Get user request failed: ${error.message}`));
      });

      req.end();
    });
  }
}

async function runUserCreationPOC(): Promise<void> {
  console.log('🧪 POC Phase 2: User Creation Test');
  console.log('='.repeat(60));

  const results: POCResults = {
    timestamp: new Date().toISOString(),
    phase: 'Phase 2 - User Creation',
    issue: 'https://github.com/marcusp3t3rs/demoforge/issues/36',
    tests: []
  };

  try {
    // First, authenticate to get access token
    console.log('🔑 Step 1: Authenticating with Microsoft Graph...');
    const authenticator = new GraphAuthenticator();
    const tokenResponse = await authenticator.getAccessToken();
    
    console.log('   ✅ Authentication successful');
    console.log('');

    const provisioner = new UserProvisioner(tokenResponse.access_token);

    // Generate unique test user details
    const timestamp = Date.now();
    const userDetails: UserCreationDetails = {
      displayName: `POC Test User ${timestamp}`,
      userPrincipalName: `poctest${timestamp}@${process.env.POC_TEST_DOMAIN || '53133n.onmicrosoft.com'}`,
      mailNickname: `poctest${timestamp}`,
      accountEnabled: true,
      passwordProfile: {
        forceChangePasswordNextSignIn: true,
        password: `TempPass${timestamp}!`
      }
    };

    try {
      // Test 1: Create User
      console.log('👤 Test 1: Creating test user...');
      console.log(`   📛 Display Name: ${userDetails.displayName}`);
      console.log(`   📧 UPN: ${userDetails.userPrincipalName}`);
      console.log('');

      const createStart = Date.now();
      const createdUser = await provisioner.createUser(userDetails);
      const createEnd = Date.now();

      console.log('   ✅ User created successfully!');
      console.log(`   🆔 User ID: ${createdUser.id}`);
      console.log(`   📧 UPN: ${createdUser.userPrincipalName}`);
      console.log(`   📛 Display Name: ${createdUser.displayName}`);

      results.tests.push({
        name: 'User Creation',
        status: 'success',
        duration_ms: createEnd - createStart,
        details: {
          id: createdUser.id,
          userPrincipalName: createdUser.userPrincipalName,
          displayName: createdUser.displayName,
          accountEnabled: createdUser.accountEnabled
        }
      });

      try {
        // Test 2: Verify User Creation and Check Attribution
        console.log('');
        console.log('🔍 Test 2: Verifying user creation and checking attribution...');

        const verifyStart = Date.now();
        const verifiedUser = await provisioner.getUser(createdUser.id);
        const verifyEnd = Date.now();

        console.log('   ✅ User verification successful!');
        console.log(`   📊 Account Status: ${verifiedUser.accountEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   📧 Mail: ${verifiedUser.mail || 'Not yet provisioned'}`);
        console.log(`   📅 Created: ${verifiedUser.createdDateTime}`);

        results.tests.push({
          name: 'User Verification',
          status: 'success',
          duration_ms: verifyEnd - verifyStart,
          details: {
            accountEnabled: verifiedUser.accountEnabled,
            mail: verifiedUser.mail,
            createdDateTime: verifiedUser.createdDateTime,
            createdBy: verifiedUser.createdBy || 'Not available'
          }
        });

        // Store created user info for cleanup/reference
        results.createdUserId = createdUser.id;
        results.createdUserUPN = createdUser.userPrincipalName;

      } catch (verifyError: any) {
        console.log(`   ❌ User verification failed: ${verifyError.message}`);

        results.tests.push({
          name: 'User Verification',
          status: 'failed',
          error: verifyError.message
        });
      }

    } catch (createError: any) {
      console.log(`   ❌ User creation failed: ${createError.message}`);

      results.tests.push({
        name: 'User Creation',
        status: 'failed',
        error: createError.message
      });
    }

  } catch (authError: any) {
    console.log(`❌ Authentication error: ${authError.message}`);

    results.tests.push({
      name: 'Authentication',
      status: 'failed',
      error: authError.message
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

  if (results.createdUserId) {
    console.log('\n🧹 Cleanup Instructions:');
    console.log(`   1. Use User ID: ${results.createdUserId}`);
    console.log(`   2. Delete via Graph Explorer or Azure Portal`);
    console.log(`   3. Or use DELETE https://graph.microsoft.com/v1.0/users/${results.createdUserId}`);
  }

  console.log('\nNext Steps:');
  console.log('   1. Review attribution data in results');
  console.log('   2. Update GitHub issue #36 with findings');
  console.log('   3. Proceed to Phase 3 (File Upload) if successful');
}

// Run the POC if this file is executed directly
if (require.main === module) {
  runUserCreationPOC().catch(console.error);
}