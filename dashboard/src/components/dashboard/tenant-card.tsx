/**
 * Connected Tenant Card Component
 * 
 * Displays information about a connected Microsoft 365 tenant
 * including permission status for user and content operations
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle, AlertCircle, Users, FileText, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface TenantCardProps {
  tenantId: string;
  tenantName?: string;
  domain?: string;
  hasUserPermissions: boolean;
  hasContentPermissions: boolean;
  userCount?: number;
  lastSync?: Date;
}

export function TenantCard({
  tenantId,
  tenantName = 'Microsoft 365 Tenant',
  domain,
  hasUserPermissions,
  hasContentPermissions,
  userCount,
  lastSync
}: TenantCardProps) {
  const isFullyConfigured = hasUserPermissions && hasContentPermissions;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{tenantName}</CardTitle>
              {domain && (
                <p className="text-sm text-gray-600">{domain}</p>
              )}
            </div>
          </div>
          
          <Badge
            variant={isFullyConfigured ? "default" : "secondary"}
            className={isFullyConfigured ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
          >
            {isFullyConfigured ? "Ready" : "Setup Required"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tenant ID */}
        <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
          ID: {tenantId}
        </div>
        
        {/* Permissions Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Required Permissions</h4>
          
          <div className="flex items-center gap-2 text-sm">
            {hasUserPermissions ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <Users className="h-4 w-4 text-gray-400" />
            <span className={hasUserPermissions ? "text-green-700" : "text-yellow-700"}>
              User Management
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            {hasContentPermissions ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
            <FileText className="h-4 w-4 text-gray-400" />
            <span className={hasContentPermissions ? "text-green-700" : "text-yellow-700"}>
              Content Creation
            </span>
          </div>
        </div>
        
        {/* Stats */}
        {userCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{userCount} users</span>
          </div>
        )}
        
        {lastSync && (
          <div className="text-xs text-gray-500">
            Last sync: {lastSync.toLocaleDateString()}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!isFullyConfigured && (
            <Button size="sm" variant="outline" className="flex-1">
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </Button>
          )}
          <Button size="sm" variant="outline" className="flex-1">
            Manage
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}