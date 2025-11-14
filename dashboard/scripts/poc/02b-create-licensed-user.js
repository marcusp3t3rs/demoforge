/**
 * POC Phase 2B: User Creation with License Assignment
 * 
 * Creates a user and automatically assigns available licenses
 * for complete POC testing of content provisioning.
 */

import * as https from 'https';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { GraphAuthenticator, TokenResponse } from './01-authenticate';

dotenv.config({ path: path.join(__dirname, '.env.local') });

interface UserCreationDetails {
  displayName: string;
  userPrincipalName: string;
  mailNickname: string;
  accountEnabled: boolean;
  usageLocation: string; // Required for license assignment
  passwordProfile: {
    forceChangePasswordNextSignIn: boolean;
    password: string;
  };
}

interface LicenseAssignment {
  addLicenses: {
    skuId: string;
    disabledPlans?: string[];
  }[];
  removeLicenses: string[];
}

class LicensedUserProvisioner {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAvailableLicenses(): Promise<any[]> {
    const apiUrl = 'https://graph.microsoft.com/v1.0/subscribedSkus';

    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
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
              reject(new Error(`Get licenses failed: ${response.error?.message || 'Unknown error'}`));
            }
          } catch (error: any) {
            reject(new Error(`Failed to parse licenses response: ${error.message}`));
          }
        });
      });

      req.on('error', (error: any) => {
        reject(new Error(`Get licenses request failed: ${error.message}`));
      });

      req.end();
    });
  }

  async createUser(userDetails: UserCreationDetails): Promise<any> {
    const apiUrl = 'https://graph.microsoft.com/v1.0/users';

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise<any>((resolve, reject) => {
      const req = https.request(apiUrl, options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 201) {
              resolve(response);
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

  async assignLicense(userId: string, licenseAssignment: LicenseAssignment): Promise<any> {
    const apiUrl = `https://graph.microsoft.com/v1.0/users/${userId}/assignLicense`;

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise<any>((resolve, reject) => {
      const req = https.request(apiUrl, options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 200) {
              resolve(response);
            } else {
              reject(new Error(`License assignment failed: ${response.error?.message || 'Unknown error'}`));
            }
          } catch (error: any) {
            reject(new Error(`Failed to parse license assignment response: ${error.message}`));
          }
        });
      });

      req.on('error', (error: any) => {
        reject(new Error(`License assignment request failed: ${error.message}`));
      });

      req.write(JSON.stringify(licenseAssignment));
      req.end();
    });
  }

  async createLicensedUser(userDetails: UserCreationDetails): Promise<any> {
    // Step 1: Get available licenses
    const availableLicenses = await this.getAvailableLicenses();
    
    // Find a suitable license (prioritize E5 developer pack)
    const suitableLicense = availableLicenses.find(license => {
      const available = license.prepaidUnits.enabled - license.consumedUnits;
      return available > 0 && (
        license.skuPartNumber.includes('DEVELOPERPACK') ||
        license.skuPartNumber.includes('E5') ||
        license.skuPartNumber.includes('E3')
      );
    });

    if (!suitableLicense) {
      throw new Error('No suitable licenses available for user creation');
    }

    console.log(`   📋 Selected license: ${suitableLicense.skuPartNumber}`);
    console.log(`   📊 Available: ${suitableLicense.prepaidUnits.enabled - suitableLicense.consumedUnits}`);

    // Step 2: Create user
    const createdUser = await this.createUser(userDetails);
    console.log(`   ✅ User created: ${createdUser.id}`);

    // Step 3: Assign license
    const licenseAssignment: LicenseAssignment = {
      addLicenses: [{
        skuId: suitableLicense.skuId
      }],
      removeLicenses: []
    };

    try {
      await this.assignLicense(createdUser.id, licenseAssignment);
      console.log(`   ✅ License assigned: ${suitableLicense.skuPartNumber}`);
      
      // Return user with license info
      return {
        ...createdUser,
        assignedLicense: {
          skuId: suitableLicense.skuId,
          skuPartNumber: suitableLicense.skuPartNumber
        }
      };
    } catch (licenseError: any) {
      console.log(`   ⚠️  License assignment failed: ${licenseError.message}`);
      console.log(`   ℹ️  User created but not licensed - manual assignment may be needed`);
      return createdUser;
    }
  }
}

async function runLicensedUserCreation(): Promise<void> {
  console.log('🧪 POC Phase 2B: Licensed User Creation');
  console.log('='.repeat(50));

  try {
    // Authenticate
    console.log('🔑 Authenticating...');
    const authenticator = new GraphAuthenticator();
    const tokenResponse = await authenticator.getAccessToken();
    console.log('   ✅ Authentication successful');
    console.log('');

    const provisioner = new LicensedUserProvisioner(tokenResponse.access_token);

    // Generate unique test user details
    const timestamp = Date.now();
    const userDetails: UserCreationDetails = {
      displayName: `POC Licensed User ${timestamp}`,
      userPrincipalName: `poclicensed${timestamp}@${process.env.POC_TEST_DOMAIN || '53133n.onmicrosoft.com'}`,
      mailNickname: `poclicensed${timestamp}`,
      accountEnabled: true,
      usageLocation: 'US', // Required for license assignment
      passwordProfile: {
        forceChangePasswordNextSignIn: true,
        password: `TempPass${timestamp}!`
      }
    };

    console.log('👤 Creating licensed user...');
    console.log(`   📛 Display Name: ${userDetails.displayName}`);
    console.log(`   📧 UPN: ${userDetails.userPrincipalName}`);
    console.log(`   🌍 Usage Location: ${userDetails.usageLocation}`);
    console.log('');

    const licensedUser = await provisioner.createLicensedUser(userDetails);

    console.log('');
    console.log('✅ LICENSED USER CREATION COMPLETE!');
    console.log(`   🆔 User ID: ${licensedUser.id}`);
    console.log(`   📧 UPN: ${licensedUser.userPrincipalName}`);
    
    if (licensedUser.assignedLicense) {
      console.log(`   📋 License: ${licensedUser.assignedLicense.skuPartNumber}`);
      console.log('   🚀 Ready for content provisioning!');
    } else {
      console.log('   ⚠️  License assignment pending - check manually');
    }

    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('   1. Wait 5-10 minutes for license provisioning');
    console.log('   2. Run content provisioning tests (files, emails)');
    console.log('   3. Verify services are accessible');
    console.log('');
    console.log('🧹 CLEANUP:');
    console.log(`   DELETE https://graph.microsoft.com/v1.0/users/${licensedUser.id}`);

  } catch (error: any) {
    console.log(`❌ Licensed user creation failed: ${error.message}`);
    
    console.log('');
    console.log('🔧 TROUBLESHOOTING:');
    console.log('   1. Check available licenses in tenant');
    console.log('   2. Verify User.ReadWrite.All permission');
    console.log('   3. Check usage location requirements');
  }
}

// Run if executed directly
if (require.main === module) {
  runLicensedUserCreation().catch(console.error);
}

export { LicensedUserProvisioner };