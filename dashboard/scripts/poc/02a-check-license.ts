/**
 * POC License Verification Script
 * 
 * Checks the license status of the created test user to verify
 * if they can access Microsoft 365 services for content creation.
 */

import * as https from 'https';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { GraphAuthenticator } from './01-authenticate';

dotenv.config({ path: path.join(__dirname, '.env.local') });

interface LicenseDetails {
  skuId: string;
  skuPartNumber: string;
  servicePlans: {
    servicePlanId: string;
    servicePlanName: string;
    provisioningStatus: string;
    appliesTo: string;
  }[];
}

interface UserLicenseInfo {
  id: string;
  userPrincipalName: string;
  assignedLicenses: LicenseDetails[];
  licenseAssignmentStates: any[];
  usageLocation?: string;
}

async function checkUserLicense(accessToken: string, userId: string): Promise<UserLicenseInfo> {
  const apiUrl = `https://graph.microsoft.com/v1.0/users/${userId}?$select=id,userPrincipalName,assignedLicenses,licenseAssignmentStates,usageLocation`;

  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise<UserLicenseInfo>((resolve, reject) => {
    const req = https.request(apiUrl, options, (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            resolve(response as UserLicenseInfo);
          } else {
            reject(new Error(`License check failed: ${response.error?.message || 'Unknown error'}`));
          }
        } catch (error: any) {
          reject(new Error(`Failed to parse license response: ${error.message}`));
        }
      });
    });

    req.on('error', (error: any) => {
      reject(new Error(`License check request failed: ${error.message}`));
    });

    req.end();
  });
}

async function getAvailableLicenses(accessToken: string): Promise<any[]> {
  const apiUrl = 'https://graph.microsoft.com/v1.0/subscribedSkus';

  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise<any[]>((resolve, reject) => {
    const req = https.request(apiUrl, options, (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            resolve(response.value || []);
          } else {
            reject(new Error(`Available licenses check failed: ${response.error?.message || 'Unknown error'}`));
          }
        } catch (error: any) {
          reject(new Error(`Failed to parse available licenses response: ${error.message}`));
        }
      });
    });

    req.on('error', (error: any) => {
      reject(new Error(`Available licenses request failed: ${error.message}`));
    });

    req.end();
  });
}

async function runLicenseCheck(): Promise<void> {
  console.log('🧪 POC License Verification');
  console.log('='.repeat(50));

  // Get the user ID from the previous test results
  const lastCreatedUserId = 'c6df8239-17ac-4d1b-b98a-f00423137206'; // From previous test

  try {
    console.log('🔑 Authenticating...');
    const authenticator = new GraphAuthenticator();
    const tokenResponse = await authenticator.getAccessToken();
    console.log('   ✅ Authentication successful');
    console.log('');

    // Check available licenses in the tenant
    console.log('📋 Checking available licenses in tenant...');
    try {
      const availableLicenses = await getAvailableLicenses(tokenResponse.access_token);
      
      console.log(`   📊 Found ${availableLicenses.length} license types:`);
      availableLicenses.forEach(license => {
        const available = license.prepaidUnits.enabled - license.consumedUnits;
        console.log(`   • ${license.skuPartNumber}: ${available}/${license.prepaidUnits.enabled} available`);
      });
      console.log('');
    } catch (licenseError: any) {
      console.log(`   ⚠️  Could not get available licenses: ${licenseError.message}`);
      console.log('');
    }

    // Check specific user license
    console.log(`🔍 Checking license for user: ${lastCreatedUserId}`);
    const userLicense = await checkUserLicense(tokenResponse.access_token, lastCreatedUserId);

    console.log(`   👤 User: ${userLicense.userPrincipalName}`);
    console.log(`   🌍 Usage Location: ${userLicense.usageLocation || 'Not set'}`);
    console.log(`   📋 Assigned Licenses: ${userLicense.assignedLicenses.length}`);

    if (userLicense.assignedLicenses.length === 0) {
      console.log('   ❌ NO LICENSES ASSIGNED!');
      console.log('');
      console.log('🚨 CRITICAL ISSUE:');
      console.log('   The test user has no Microsoft 365 licenses assigned.');
      console.log('   This means the user CANNOT:');
      console.log('   • Access OneDrive (file operations will fail)');
      console.log('   • Access Exchange (email operations will fail)');
      console.log('   • Access Teams (chat operations will fail)');
      console.log('');
      console.log('🔧 REQUIRED ACTIONS:');
      console.log('   1. Assign a license to the test user, OR');
      console.log('   2. Create users with licenses in your POC scripts, OR');
      console.log('   3. Verify if your tenant has available licenses');

    } else {
      console.log('   ✅ User has licenses assigned:');
      
      userLicense.assignedLicenses.forEach((license, index) => {
        console.log(`   📜 License ${index + 1}: ${license.skuPartNumber || license.skuId}`);
        
        // Check key services for content creation
        const keyServices = license.servicePlans.filter(sp => 
          sp.servicePlanName.includes('ONEDRIVE') || 
          sp.servicePlanName.includes('EXCHANGE') || 
          sp.servicePlanName.includes('TEAMS') ||
          sp.servicePlanName.includes('SHAREPOINT')
        );
        
        if (keyServices.length > 0) {
          console.log('      Key services for content creation:');
          keyServices.forEach(service => {
            const status = service.provisioningStatus === 'Success' ? '✅' : '❌';
            console.log(`      ${status} ${service.servicePlanName}: ${service.provisioningStatus}`);
          });
        }
      });

      console.log('');
      console.log('✅ LICENSE VERIFICATION COMPLETE');
      console.log('   The user should be able to access M365 services for content creation.');
    }

  } catch (error: any) {
    console.log(`❌ License verification failed: ${error.message}`);
  }

  console.log('');
  console.log('🎯 NEXT STEPS:');
  console.log('   1. If licenses are OK: Continue with Phase 3 (File Upload)');
  console.log('   2. If no licenses: Assign licenses or modify POC approach');
  console.log('   3. Consider license assignment in final Epic 1 implementation');
}

// Run license check if this file is executed directly
if (require.main === module) {
  runLicenseCheck().catch(console.error);
}

export { checkUserLicense, getAvailableLicenses };