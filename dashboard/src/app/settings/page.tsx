export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your DemoForge application settings and preferences.
        </p>
      </div>

      {/* System Configuration */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="audit-retention" className="block text-sm font-medium text-gray-700">
              Audit Log Retention
            </label>
            <select
              id="audit-retention"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">6 months</option>
              <option value="365">1 year</option>
              <option value="730">2 years</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              How long to keep logs of actions performed by the DemoForge system
            </p>
          </div>

          <div>
            <label htmlFor="logging-level" className="block text-sm font-medium text-gray-700">
              Logging Level
            </label>
            <select
              id="logging-level"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Set the verbosity of system logs
            </p>
          </div>
        </div>
      </div>

      {/* User Interface */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">User Interface</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Theme
            </label>
            <select
              id="theme"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Choose your preferred color scheme
            </p>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              id="language"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select your preferred interface language
            </p>
          </div>

          <div>
            <label htmlFor="notifications" className="block text-sm font-medium text-gray-700">
              Email Notifications
            </label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">Tenant connection status changes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">Demo content generation summaries</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">System maintenance notifications</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* API & Integration */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">API & Integration</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="rate-limit" className="block text-sm font-medium text-gray-700">
              Microsoft Graph API Rate Limits
            </label>
            <select
              id="rate-limit"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="conservative">Conservative (100 req/min)</option>
              <option value="moderate">Moderate (300 req/min)</option>
              <option value="aggressive">Aggressive (600 req/min)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Set throttling limits for Microsoft Graph API calls to tenant
            </p>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Feature Flags</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Heartbeat Content Generation</span>
              <p className="text-sm text-gray-500">Enable periodic automated content generation</p>
            </div>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Enhanced User Interactions</span>
              <p className="text-sm text-gray-500">Enable advanced user-to-user interaction simulation</p>
            </div>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              defaultChecked
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Advanced Analytics Dashboard</span>
              <p className="text-sm text-gray-500">Show detailed metrics on demo content performance</p>
            </div>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Beta Features</span>
              <p className="text-sm text-gray-500">Enable experimental features and improvements</p>
            </div>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}