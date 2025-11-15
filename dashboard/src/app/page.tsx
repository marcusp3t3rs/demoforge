import { ConnectTenantCard } from '../components/dashboard/connect-tenant-card';
import { EmptyStateCard } from '../components/dashboard/empty-state-card';
import { SignInButton } from '../components/auth/SignInButton';

export default function Dashboard() {
  // For now, show empty state - this will be dynamic based on tenant connection
  const isConnected = false;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your DemoForge environment
        </p>
      </div>

      {!isConnected ? (
        <div className="space-y-8">
          {/* E1-US1 Testing Section */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">🧪 E1-US1 Authentication Testing</h3>
            <p className="text-blue-700 mb-4">Test the new Tenant Admin Authentication with enhanced OneDrive provisioning:</p>
            <div className="space-y-3">
              <SignInButton 
                showAdvancedOptions={true} 
                buttonText="Test Microsoft Authentication"
                variant="default"
              />
              <p className="text-sm text-blue-600">✨ Includes 'not set up yet' OneDrive handling from POC learnings</p>
            </div>
          </div>
          
          <EmptyStateCard />
          <ConnectTenantCard />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Future: Connection Status, Audit Preview, etc. */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">Connected Tenant</h3>
            <p className="mt-2 text-gray-600">Tenant management features will appear here.</p>
          </div>
        </div>
      )}
    </>
  );
}
