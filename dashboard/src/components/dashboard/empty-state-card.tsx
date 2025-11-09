export function EmptyStateCard() {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 text-gray-400">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14-7l2 2m0 0l2 2m-2-2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14zm-8 6v6m0-6L9 9m0 0L7 7"
          />
        </svg>
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No tenant connected</h3>
      <p className="mt-1 text-sm text-gray-500">
        Connect your Microsoft 365 tenant to get started with DemoForge.
      </p>
    </div>
  );
}