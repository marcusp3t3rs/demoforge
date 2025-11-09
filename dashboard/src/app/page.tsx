import { ConnectTenantCard } from '@/components/dashboard/connect-tenant-card';
import { EmptyStateCard } from '@/components/dashboard/empty-state-card';

export default function Dashboard() {
  // For now, show empty state - this will be dynamic based on tenant connection
  const isConnected = false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">DemoForge Dashboard</h1>
            <div className="text-sm text-gray-500">
              Welcome to DemoForge
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!isConnected ? (
          <div className="space-y-8">
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
      </main>
    </div>
  );
}
