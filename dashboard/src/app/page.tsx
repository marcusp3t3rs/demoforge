'use client';

import { ConnectTenantCard } from '../components/dashboard/connect-tenant-card';
import { EmptyStateCard } from '../components/dashboard/empty-state-card';
import { TenantCard } from '../components/dashboard/tenant-card';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: session, status } = useSession();
  
  // Show authenticated state if user is logged in
  const isAuthenticated = !!session?.user;
  
  // If user is authenticated and has a tenant ID, consider them connected
  // In the future, this will check a proper tenant connection state
  const hasConnectedTenant = isAuthenticated && !!session?.tenantId;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your DemoForge environment
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-8">
          {/* Not authenticated - show sign in */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">🚀 Get Started with DemoForge</h3>
            <p className="text-blue-700 mb-4">Sign in with your Microsoft account to connect your tenant:</p>
            <div className="space-y-3">
              <Link href="/auth/signin" className="inline-block">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Sign In with Microsoft
                </Button>
              </Link>
              <p className="text-sm text-blue-600">✨ Secure authentication with NextAuth.js</p>
            </div>
          </div>
          
          <EmptyStateCard />
        </div>
      ) : hasConnectedTenant ? (
        <div className="space-y-6">
          {/* Connected Tenants */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Connected Tenants</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <TenantCard
                tenantId={session.tenantId!}
                tenantName="MS Developer Tenant"
                domain={session.user?.email?.split('@')[1]}
                hasUserPermissions={true} // TODO: Check actual permissions
                hasContentPermissions={false} // TODO: Check actual permissions
                userCount={1}
                lastSync={new Date()}
              />
            </div>
          </div>
          
          {/* Additional Actions */}
          <ConnectTenantCard />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Authenticated but no tenant detected */}
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6">
            <h3 className="text-lg font-medium text-yellow-900 mb-3">⚠️ No Tenant Connection</h3>
            <p className="text-yellow-700 mb-4">You're authenticated but we couldn't detect your tenant. Please try connecting manually.</p>
          </div>
          
          <ConnectTenantCard />
        </div>
      )}
    </>
  );
}
