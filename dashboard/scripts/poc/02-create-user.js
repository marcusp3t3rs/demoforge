/**
 * POC Phase 2: User Creation Test
 * 
 * Tests creating demo users via Microsoft Graph API
 * using client_credentials authentication.
 * 
 * Issue: https://github.com/marcusp3t3rs/demoforge/issues/36
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { GraphAuthenticator } = require('./01-authenticate');

class UserProvisioner {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  /**
   * Create a test user via Microsoft Graph API
   * @param {Object} userDetails - User details for creation
   * @returns {Promise<Object>} Created user object
   */
  async createUser(userDetails) {
    const apiUrl = 'https://graph.microsoft.com/v1.0/users';
    
    const userData = JSON.stringify({
      accountEnabled: true,
      displayName: userDetails.displayName || 'POC Test User',
      mailNickname: userDetails.mailNickname || 'pocuser',
      userPrincipalName: userDetails.userPrincipalName,
      passwordProfile: {
        forceChangePasswordNextSignIn: false,
        password: userDetails.password || 'TempPassword123!'
      },
      usageLocation: userDetails.usageLocation || 'US'
    });

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(userData)
        }
      };

      const req = https.request(apiUrl, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 201) {
              resolve(response);
            } else {
              reject(new Error(`User creation failed (${res.statusCode}): ${response.error?.message || JSON.stringify(response)}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse user creation response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`User creation request error: ${error.message}`));
      });

      req.write(userData);
      req.end();
    });
  }

  /**
   * Get user details to verify creation
   * @param {string} userId - User ID to retrieve
   * @returns {Promise<Object>} User details
   */
  async getUser(userId) {
    const apiUrl = `https://graph.microsoft.com/v1.0/users/${userId}`;
    
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(apiUrl, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
              resolve(response);
            } else {
              reject(new Error(`Get user failed (${res.statusCode}): ${response.error?.message || JSON.stringify(response)}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse get user response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Get user request error: ${error.message}`));
      });

      req.end();
    });
  }
}

/**
 * Main POC execution function for user creation
 */
async function runUserCreationPOC() {
  console.log('🧪 POC Phase 2: User Creation Test');
  console.log('='.repeat(60));
  
  const results = {
    timestamp: new Date().toISOString(),
    phase: 'Phase 2: User Creation',
    issue: 'https://github.com/marcusp3t3rs/demoforge/issues/36',
    tests: []
  };

  try {
    // Step 1: Get authentication token
    console.log('🔑 Step 1: Getting authentication token...');
    const authenticator = new GraphAuthenticator();
    const tokenResponse = await authenticator.getAccessToken();
    console.log('   ✅ Token acquired');

    const provisioner = new UserProvisioner(tokenResponse.access_token);
    
    // Step 2: Create test user
    console.log('');
    console.log('👤 Step 2: Creating test user...');
    const createStart = Date.now();
    
    const testDomain = process.env.POC_TEST_DOMAIN || 'contoso.onmicrosoft.com';
    const timestamp = Date.now();
    
    const userDetails = {
      displayName: `POC Test User ${timestamp}`,
      mailNickname: `pocuser${timestamp}`,
      userPrincipalName: `pocuser${timestamp}@${testDomain}`,
      password: process.env.POC_TEST_PASSWORD || 'TempPassword123!',
      usageLocation: 'US'
    };
    
    console.log(`   📋 Creating user: ${userDetails.userPrincipalName}`);
    
    try {
      const createdUser = await provisioner.createUser(userDetails);
      const createTime = Date.now() - createStart;
      
      console.log(`   ✅ User created successfully (${createTime}ms)`);
      console.log(`   🆔 User ID: ${createdUser.id}`);
      console.log(`   📧 UPN: ${createdUser.userPrincipalName}`);
      console.log(`   📛 Display Name: ${createdUser.displayName}`);
      
      results.tests.push({
        name: 'User Creation',
        status: 'success',
        duration_ms: createTime,
        details: {
          id: createdUser.id,
          userPrincipalName: createdUser.userPrincipalName,
          displayName: createdUser.displayName,
          accountEnabled: createdUser.accountEnabled
        }
      });

      // Step 3: Verify user was created
      console.log('');
      console.log('🔍 Step 3: Verifying user creation...');
      const verifyStart = Date.now();
      
      try {
        const verifiedUser = await provisioner.getUser(createdUser.id);
        const verifyTime = Date.now() - verifyStart;
        
        console.log(`   ✅ User verification successful (${verifyTime}ms)`);
        console.log(`   📊 Account Status: ${verifiedUser.accountEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   📧 Mail: ${verifiedUser.mail || 'Not yet provisioned'}`);
        console.log(`   📅 Created: ${verifiedUser.createdDateTime}`);
        
        results.tests.push({
          name: 'User Verification',
          status: 'success',
          duration_ms: verifyTime,
          details: {
            accountEnabled: verifiedUser.accountEnabled,
            mail: verifiedUser.mail,
            createdDateTime: verifiedUser.createdDateTime,
            createdBy: verifiedUser.createdBy || 'Not available'
          }
        });

        // Store user ID for next scripts
        results.createdUserId = createdUser.id;
        results.createdUserUPN = createdUser.userPrincipalName;
        
      } catch (verifyError) {
        console.log(`   ❌ User verification failed: ${verifyError.message}`);
        
        results.tests.push({
          name: 'User Verification',
          status: 'failed',
          error: verifyError.message
        });
      }
      
    } catch (createError) {
      console.log(`   ❌ User creation failed: ${createError.message}`);
      
      results.tests.push({
        name: 'User Creation',
        status: 'failed',
        error: createError.message
      });
    }

  } catch (authError) {
    console.log(`❌ Authentication error: ${authError.message}`);
    
    results.tests.push({
      name: 'Authentication',
      status: 'failed',
      error: authError.message
    });
  }

  // Save results
  const resultsPath = path.join(__dirname, 'poc-results.json');
  const existingResults = fs.existsSync(resultsPath) ? 
    JSON.parse(fs.readFileSync(resultsPath, 'utf8')) : { phases: [] };
  
  existingResults.phases.push(results);
  fs.writeFileSync(resultsPath, JSON.stringify(existingResults, null, 2));

  console.log('');
  console.log('📊 Results Summary:');
  console.log(`   Tests completed: ${results.tests.length}`);
  console.log(`   Successful: ${results.tests.filter(t => t.status === 'success').length}`);
  console.log(`   Failed: ${results.tests.filter(t => t.status === 'failed').length}`);
  console.log(`   Results saved to: ${resultsPath}`);
  console.log('');
  console.log('🎯 Next Steps:');
  if (results.createdUserId) {
    console.log('   1. Proceed to 03-upload-file.js to test file operations');
    console.log(`   2. Use User ID: ${results.createdUserId}`);
  } else {
    console.log('   1. Fix user creation issues before proceeding');
    console.log('   2. Check Azure app permissions for User.ReadWrite.All');
  }
  console.log('   3. Update Issue #36 with results');
}

// Run the POC if this file is executed directly
if (require.main === module) {
  runUserCreationPOC().catch(console.error);
}

module.exports = { UserProvisioner };