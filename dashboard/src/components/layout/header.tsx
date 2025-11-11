'use client';

import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/auth';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 md:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 md:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h1 className="text-xl font-semibold text-gray-900 md:hidden">DemoForge</h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-x-3">
              <UserCircleIcon className="h-6 w-6 text-gray-400" />
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-gray-500 capitalize">{user.role}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Welcome to DemoForge
            </div>
          )}
        </div>
      </div>
    </div>
  );
}