/**
 * Auth Configuration API Endpoint
 * 
 * Provides authentication configuration to client-side components
 * Environment variables are only available server-side in Next.js
 */

import { NextResponse } from 'next/server';
import { getAuthConfig } from '@/lib/auth/auth-config';

export async function GET() {
  try {
    console.log('🔧 API: Getting auth config for client');
    
    const config = getAuthConfig();
    
    // Only return non-sensitive configuration to client
    const clientConfig = {
      tenantId: config.tenantId,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      oneDriveProvisioning: config.oneDriveProvisioning,
    };
    
    console.log('🔧 API: Returning client config:', {
      tenantId: clientConfig.tenantId,
      clientId: clientConfig.clientId ? '***set***' : 'NOT SET',
      redirectUri: clientConfig.redirectUri,
    });
    
    return NextResponse.json(clientConfig);
    
  } catch (error) {
    console.error('🚨 API: Failed to get auth config:', error);
    
    return NextResponse.json(
      { error: 'Failed to load authentication configuration' },
      { status: 500 }
    );
  }
}