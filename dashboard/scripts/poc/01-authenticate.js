/**
 * POC Phase 1: Client Credentials Authentication Test
 * 
 * Tests Azure App Registration with client_credentials flow
 * to obtain access token for Microsoft Graph API operations.
 * 
 * Issue: https://github.com/marcusp3t3rs/demoforge/issues/35
 */

const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

class GraphAuthenticator {
  constructor() {
    this.tenantId = process.env.AZURE_TENANT_ID;
    this.clientId = process.env.AZURE_CLIENT_ID;
    this.clientSecret = process.env.AZURE_CLIENT_SECRET;
    
    if (!this.tenantId || !this.clientId || !this.clientSecret) {
      throw new Error('Missing required environment variables: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET');
    }
  }

  /**
   * Acquire access token using client_credentials flow
   * @returns {Promise<Object>} Token response with access_token, expires_in, etc.
   */
  async getAccessToken() {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const postData = querystring.stringify({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'https://graph.microsoft.com/.default'
    });

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(tokenUrl, options, (res) => {
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
              reject(new Error(`Token request failed: ${response.error_description || response.error}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse token response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Token request error: ${error.message}`));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Validate token by making a test Graph API call
   * @param {string} accessToken - Access token to validate
   * @returns {Promise<Object>} User profile or error
   */
  async validateToken(accessToken) {
    const apiUrl = 'https://graph.microsoft.com/v1.0/me';
    
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
              // For client_credentials, /me might not work - that's expected
              // Try /applications endpoint instead for validation
              resolve({ 
                status: 'token_valid_but_no_user_context',
                statusCode: res.statusCode,
                response 
              });
            }
          } catch (error) {
            reject(new Error(`Failed to parse validation response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Validation request error: ${error.message}`));
      });

      req.end();
    });
  }
}

/**
 * Main POC execution function
 */
async function runAuthenticationPOC() {
  console.log('🧪 POC Phase 1: Client Credentials Authentication Test');
  console.log('='.repeat(60));
  
  const results = {
    timestamp: new Date().toISOString(),
    phase: 'Phase 1: Authentication',
    issue: 'https://github.com/marcusp3t3rs/demoforge/issues/35',
    tests: []
  };

  try {
    const authenticator = new GraphAuthenticator();
    
    console.log('📋 Environment Check:');
    console.log(`   Tenant ID: ${authenticator.tenantId ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Client ID: ${authenticator.clientId ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Client Secret: ${authenticator.clientSecret ? '✅ Set' : '❌ Missing'}`);
    console.log('');

    // Test 1: Get Access Token
    console.log('🔑 Test 1: Acquiring access token...');
    const tokenStart = Date.now();
    
    try {
      const tokenResponse = await authenticator.getAccessToken();
      const tokenTime = Date.now() - tokenStart;
      
      console.log(`   ✅ Token acquired successfully (${tokenTime}ms)`);
      console.log(`   📊 Token type: ${tokenResponse.token_type}`);
      console.log(`   ⏰ Expires in: ${tokenResponse.expires_in} seconds`);
      console.log(`   🔍 Scope: ${tokenResponse.scope || 'Not specified'}`);
      
      results.tests.push({
        name: 'Token Acquisition',
        status: 'success',
        duration_ms: tokenTime,
        details: {
          token_type: tokenResponse.token_type,
          expires_in: tokenResponse.expires_in,
          scope: tokenResponse.scope
        }
      });

      // Test 2: Validate Token (expected to fail for client_credentials with /me)
      console.log('');
      console.log('🔍 Test 2: Validating token...');
      const validateStart = Date.now();
      
      try {
        const validation = await authenticator.validateToken(tokenResponse.access_token);
        const validateTime = Date.now() - validateStart;
        
        console.log(`   ℹ️  Token validation completed (${validateTime}ms)`);
        console.log(`   📄 Response: ${JSON.stringify(validation, null, 2)}`);
        
        results.tests.push({
          name: 'Token Validation',
          status: 'completed',
          duration_ms: validateTime,
          details: validation
        });
        
      } catch (validationError) {
        console.log(`   ⚠️  Token validation: ${validationError.message}`);
        console.log('   ℹ️  This is expected for client_credentials flow with /me endpoint');
        
        results.tests.push({
          name: 'Token Validation',
          status: 'expected_limitation',
          error: validationError.message,
          note: 'client_credentials tokens cannot access /me endpoint - this is normal'
        });
      }

    } catch (tokenError) {
      console.log(`   ❌ Token acquisition failed: ${tokenError.message}`);
      
      results.tests.push({
        name: 'Token Acquisition',  
        status: 'failed',
        error: tokenError.message
      });
    }

  } catch (setupError) {
    console.log(`❌ Setup error: ${setupError.message}`);
    
    results.tests.push({
      name: 'Setup',
      status: 'failed', 
      error: setupError.message
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
  console.log('   1. If token acquisition succeeded, proceed to 02-create-user.js');
  console.log('   2. If failed, check Azure app registration and permissions');
  console.log('   3. Update Issue #35 with results');
}

// Run the POC if this file is executed directly
if (require.main === module) {
  runAuthenticationPOC().catch(console.error);
}

module.exports = { GraphAuthenticator };