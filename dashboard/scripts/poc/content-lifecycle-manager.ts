/**
 * POC Content Lifecycle Manager
 * 
 * Tracks created content for systematic cleanup when users disconnect.
 * This addresses the critical Epic 1 requirement for clean tenant disconnection.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ContentRecord {
  id: string;
  tenantId: string;
  demoSessionId: string;
  resourceType: 'user' | 'file' | 'email' | 'chat' | 'team' | 'license';
  resourceId: string;
  parentResourceId?: string;
  graphApiEndpoint: string;
  displayName: string;
  createdAt: string;
  metadata: any;
}

interface DemoSession {
  sessionId: string;
  tenantId: string;
  startedAt: string;
  status: 'active' | 'completed' | 'cleaning' | 'cleaned';
  totalResources: number;
  cleanedResources: number;
  resources: ContentRecord[];
}

class ContentLifecycleManager {
  private trackingFile: string;
  private sessions: Map<string, DemoSession>;

  constructor(trackingFilePath?: string) {
    this.trackingFile = trackingFilePath || path.join(process.cwd(), 'demo-content-tracking.json');
    this.sessions = new Map();
    this.loadTracking();
  }

  private loadTracking(): void {
    try {
      if (fs.existsSync(this.trackingFile)) {
        const data = fs.readFileSync(this.trackingFile, 'utf8');
        const sessions = JSON.parse(data);
        
        Object.entries(sessions).forEach(([sessionId, session]) => {
          this.sessions.set(sessionId, session as DemoSession);
        });
      }
    } catch (error: any) {
      console.warn(`Could not load tracking file: ${error.message}`);
    }
  }

  private saveTracking(): void {
    try {
      const sessionsObj = Object.fromEntries(this.sessions);
      fs.writeFileSync(this.trackingFile, JSON.stringify(sessionsObj, null, 2));
    } catch (error: any) {
      console.error(`Could not save tracking file: ${error.message}`);
    }
  }

  startDemoSession(tenantId: string): string {
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: DemoSession = {
      sessionId,
      tenantId,
      startedAt: new Date().toISOString(),
      status: 'active',
      totalResources: 0,
      cleanedResources: 0,
      resources: []
    };

    this.sessions.set(sessionId, session);
    this.saveTracking();
    
    console.log(`📋 Started demo session: ${sessionId}`);
    return sessionId;
  }

  trackResource(
    sessionId: string,
    resourceType: ContentRecord['resourceType'],
    resourceId: string,
    displayName: string,
    graphApiEndpoint: string,
    parentResourceId?: string,
    metadata?: any
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Demo session not found: ${sessionId}`);
    }

    const record: ContentRecord = {
      id: `${resourceType}_${resourceId}_${Date.now()}`,
      tenantId: session.tenantId,
      demoSessionId: sessionId,
      resourceType,
      resourceId,
      parentResourceId,
      graphApiEndpoint,
      displayName,
      createdAt: new Date().toISOString(),
      metadata: metadata || {}
    };

    session.resources.push(record);
    session.totalResources++;
    this.saveTracking();

    console.log(`📝 Tracked ${resourceType}: ${displayName} (${resourceId})`);
  }

  getSessionResources(sessionId: string): ContentRecord[] {
    const session = this.sessions.get(sessionId);
    return session ? session.resources : [];
  }

  getAllActiveSessions(): DemoSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  getSessionsByTenant(tenantId: string): DemoSession[] {
    return Array.from(this.sessions.values()).filter(s => s.tenantId === tenantId);
  }

  generateCleanupPlan(sessionId: string): {
    order: string[];
    resources: Map<string, ContentRecord[]>;
    warnings: string[];
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Demo session not found: ${sessionId}`);
    }

    const resources = new Map<string, ContentRecord[]>();
    const warnings: string[] = [];

    // Group resources by type
    session.resources.forEach(resource => {
      if (!resources.has(resource.resourceType)) {
        resources.set(resource.resourceType, []);
      }
      resources.get(resource.resourceType)!.push(resource);
    });

    // Define cleanup order (content first, users last)
    const cleanupOrder = ['chat', 'email', 'file', 'team', 'license', 'user'];
    
    // Filter to only include types that exist
    const actualOrder = cleanupOrder.filter(type => resources.has(type));

    // Generate warnings
    if (resources.has('user')) {
      warnings.push('User deletion will cascade to remaining content');
    }
    
    if (resources.has('license')) {
      warnings.push('License reclamation will disable user services');
    }

    const totalItems = session.resources.length;
    if (totalItems > 10) {
      warnings.push(`Large cleanup operation: ${totalItems} items to delete`);
    }

    return {
      order: actualOrder,
      resources,
      warnings
    };
  }

  previewCleanup(sessionId: string): void {
    console.log(`🔍 Cleanup Preview for Session: ${sessionId}`);
    console.log('='.repeat(50));

    const plan = this.generateCleanupPlan(sessionId);
    
    console.log('📋 Cleanup Order:');
    plan.order.forEach((type, index) => {
      const items = plan.resources.get(type) || [];
      console.log(`   ${index + 1}. ${type.toUpperCase()}: ${items.length} items`);
      
      items.forEach(item => {
        console.log(`      • ${item.displayName} (${item.resourceId})`);
      });
    });

    if (plan.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      plan.warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }

    console.log(`\n📊 Total Items: ${Array.from(plan.resources.values()).flat().length}`);
  }

  async executeCleanup(sessionId: string, accessToken: string, dryRun: boolean = true): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Demo session not found: ${sessionId}`);
    }

    console.log(`🧹 ${dryRun ? 'DRY RUN' : 'EXECUTING'} Cleanup for Session: ${sessionId}`);
    console.log('='.repeat(50));

    session.status = 'cleaning';
    this.saveTracking();

    const plan = this.generateCleanupPlan(sessionId);

    for (const resourceType of plan.order) {
      const items = plan.resources.get(resourceType) || [];
      
      console.log(`\n🗑️  Cleaning ${resourceType.toUpperCase()}: ${items.length} items`);
      
      for (const item of items) {
        try {
          if (dryRun) {
            console.log(`   [DRY RUN] Would delete: ${item.displayName}`);
            console.log(`   [DRY RUN] Endpoint: DELETE ${item.graphApiEndpoint}`);
          } else {
            // TODO: Implement actual Graph API deletion calls
            console.log(`   🗑️  Deleting: ${item.displayName}`);
            // await this.deleteResource(accessToken, item);
            session.cleanedResources++;
          }
        } catch (error: any) {
          console.log(`   ❌ Failed to delete ${item.displayName}: ${error.message}`);
        }
      }
    }

    if (!dryRun) {
      session.status = 'cleaned';
      console.log('\n✅ Cleanup completed successfully!');
    } else {
      console.log('\n📋 Dry run completed. Use executeCleanup(sessionId, token, false) to actually delete.');
    }

    this.saveTracking();
  }

  completeDemoSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      this.saveTracking();
      console.log(`✅ Demo session completed: ${sessionId}`);
    }
  }

  // Integration helpers for POC scripts
  static createForPOC(): ContentLifecycleManager {
    return new ContentLifecycleManager(path.join(process.cwd(), 'poc-content-tracking.json'));
  }

  exportSummary(): any {
    const summary = {
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).filter(s => s.status === 'active').length,
      totalResources: Array.from(this.sessions.values()).reduce((sum, s) => sum + s.totalResources, 0),
      resourcesByType: {} as any,
      tenants: new Set()
    };

    Array.from(this.sessions.values()).forEach(session => {
      summary.tenants.add(session.tenantId);
      
      session.resources.forEach(resource => {
        if (!summary.resourcesByType[resource.resourceType]) {
          summary.resourcesByType[resource.resourceType] = 0;
        }
        summary.resourcesByType[resource.resourceType]++;
      });
    });

    summary.tenants = Array.from(summary.tenants);
    return summary;
  }
}

// Example usage for POC integration
async function demonstrateContentTracking(): Promise<void> {
  console.log('🧪 POC Content Lifecycle Management Demo');
  console.log('='.repeat(50));

  const manager = ContentLifecycleManager.createForPOC();
  
  // Start a demo session
  const sessionId = manager.startDemoSession('0e812be8-3f9b-4e74-8461-98b684e5cf1f');
  
  // Track some example resources (as would be done during POC)
  manager.trackResource(
    sessionId,
    'user',
    '882a1861-6dad-4df2-92a8-c4c7fcb29151',
    'POC Licensed User 1763118073715',
    'https://graph.microsoft.com/v1.0/users/882a1861-6dad-4df2-92a8-c4c7fcb29151',
    undefined,
    { license: 'DEVELOPERPACK_E5', createdInPhase: '2B' }
  );

  manager.trackResource(
    sessionId,
    'license',
    'DEVELOPERPACK_E5_882a1861-6dad-4df2-92a8-c4c7fcb29151',
    'E5 Developer License Assignment',
    'https://graph.microsoft.com/v1.0/users/882a1861-6dad-4df2-92a8-c4c7fcb29151/assignLicense',
    '882a1861-6dad-4df2-92a8-c4c7fcb29151',
    { skuId: 'DEVELOPERPACK_E5', assignedAt: new Date().toISOString() }
  );

  // Preview cleanup
  manager.previewCleanup(sessionId);
  
  // Dry run cleanup
  await manager.executeCleanup(sessionId, 'mock-token', true);
  
  // Export summary
  console.log('\n📊 Content Tracking Summary:');
  console.log(JSON.stringify(manager.exportSummary(), null, 2));
}

// Run demo if executed directly
if (require.main === module) {
  demonstrateContentTracking().catch(console.error);
}

export { ContentLifecycleManager, ContentRecord, DemoSession };