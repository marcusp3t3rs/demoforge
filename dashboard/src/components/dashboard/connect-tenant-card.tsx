'use client';

export function ConnectTenantCard() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-gray-900">Connect Your Tenant</h3>
          <p className="mt-1 text-sm text-gray-500">
            Securely connect your Microsoft 365 tenant to start using DemoForge.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => {
            // TODO: Epic 1 - Implement OAuth flow to /auth/login
            console.log('Connect tenant clicked - Epic 1 implementation needed');
          }}
        >
          <svg
            className="-ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Connect Tenant
        </button>
        <p className="mt-2 text-xs text-gray-500">
          This will redirect you to Microsoft sign-in to authorize DemoForge.
        </p>
      </div>
    </div>
  );
}