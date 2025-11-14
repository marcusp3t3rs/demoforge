# POC Scripts Management Strategy

**Last Updated**: November 14, 2025  
**Status**: Implementation Phase - Scripts Preserved for Reference

## 📋 Overview

The POC scripts in `/dashboard/scripts/poc/` contain validated functionality that will be integrated into the MVP. Rather than immediately deleting them, we'll maintain them as reference implementations until the corresponding MVP components are ready.

## 🗂️ Script Inventory & Migration Plan

### Phase 1: Authentication & Core Infrastructure
**Scripts to Preserve Until Sprint 1 Complete**:

- **`00-verify-config.ts`** → Integrate into E1-US2 (Admin Consent) validation
- **`01-authenticate.ts`** → Reference for E1-US1 (Tenant Admin Auth) & E1-US3 (Token Exchange)
- **`02-create-user.ts`** → Foundation for user provisioning components
- **`02a-check-license.ts`** → License validation logic for connection status
- **`02b-create-licensed-user.ts`** → Complete user+license provisioning flow

### Phase 2: Content Operations  
**Scripts to Preserve Until Sprint 2-3 Complete**:

- **`03-upload-file.ts`** → Async file operations architecture (background jobs)
- **`04-create-email.ts`** → Email provisioning integration
- **`content-lifecycle-manager.ts`** → **KEEP PERMANENTLY** - Core component for E1-US7 (Revoke/Reconnect)

### Supporting Files
**Preserve for Development Reference**:

- **`README.md`** → Setup instructions and API patterns
- **`.env.template`** → Environment configuration template
- **Result files (`*.json`)** → POC validation data

## 🔄 Migration Timeline

### Sprint 1: Core Authentication (Issues #2, #3, #4)
- **Preserve**: All authentication-related scripts (`00-verify-config.ts`, `01-authenticate.ts`)
- **Reference**: Token handling patterns, error scenarios, permission validation
- **Delete**: None (foundation scripts needed)

### Sprint 2: Status Dashboard & Management (Issues #5, #6, #7)  
- **Preserve**: License checking (`02a-check-license.ts`), user provisioning (`02b-create-licensed-user.ts`)
- **Reference**: License availability checks, tenant validation patterns
- **Delete**: Basic config verification once integrated into dashboard

### Sprint 3: Content Lifecycle & Polish (Issues #8, #9)
- **Migrate**: `content-lifecycle-manager.ts` → `/lib/content-lifecycle/` (permanent component)
- **Reference**: File and email operation patterns for background job architecture
- **Delete**: Development POC scripts once functionality is integrated

### Sprint 4+: Cleanup Phase
- **Delete**: All remaining POC scripts except `content-lifecycle-manager.ts`
- **Archive**: Move final POC report and documentation to `/docs/archive/poc/`
- **Preserve**: Only production-integrated components

## 🎯 Integration Strategy

### Immediate Integration (Sprint 1)
1. **Token Management**: Extract patterns from `01-authenticate.ts` into `/lib/auth/`
2. **Config Validation**: Adapt `00-verify-config.ts` logic for admin consent flow
3. **Error Handling**: Reuse comprehensive error patterns throughout MVP

### Delayed Integration (Sprint 2-3)
1. **License Checking**: Move logic from `02a-check-license.ts` to connection status dashboard
2. **User Provisioning**: Adapt `02b-create-licensed-user.ts` for async architecture
3. **Content Operations**: Use `03-upload-file.ts` and `04-create-email.ts` as async job templates

### Permanent Components
1. **Content Lifecycle Manager**: Refactor into production component for tenant disconnection
2. **POC Documentation**: Archive as technical validation records

## 📁 Proposed File Structure After Integration

```
dashboard/
├── lib/
│   ├── auth/
│   │   ├── token-manager.ts          # ← from 01-authenticate.ts
│   │   ├── config-validator.ts       # ← from 00-verify-config.ts
│   │   └── consent-flow.ts           # ← new, references POC patterns
│   ├── tenant/
│   │   ├── license-checker.ts        # ← from 02a-check-license.ts
│   │   ├── user-provisioner.ts       # ← from 02b-create-licensed-user.ts
│   │   └── validation.ts             # ← tenant verification logic
│   ├── content-lifecycle/
│   │   ├── manager.ts                # ← from content-lifecycle-manager.ts
│   │   ├── cleanup.ts                # ← production cleanup jobs
│   │   └── tracking.ts               # ← resource tracking
│   └── jobs/
│       ├── file-operations.ts        # ← async patterns from 03-upload-file.ts
│       └── email-operations.ts       # ← async patterns from 04-create-email.ts
├── scripts/
│   └── poc/                          # ← DELETE after Sprint 3 complete
└── docs/
    └── archive/
        └── poc/                      # ← Final POC documentation
```

## 🚀 Next Steps

1. **Sprint 1**: Begin integration while preserving POC scripts as reference
2. **Each Sprint**: Review POC scripts for patterns, extract reusable logic  
3. **Sprint 3 End**: Migrate content lifecycle manager to production location
4. **Sprint 4**: Final cleanup and archival

**Benefits of This Approach**:
- ✅ Validated functionality remains accessible during development
- ✅ Proven error handling and edge cases preserved
- ✅ Development team can reference working implementations
- ✅ Clean transition from POC to production code
- ✅ POC investment maximized through systematic integration