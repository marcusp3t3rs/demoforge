# Epic 1 – Tenant Connection & Setup

**Project:** DemoForge  
**Goal:** Enable secure connection of Microsoft 365 tenants to the DemoForge Dashboard.  
**Outcome:** Tenant Admins can authenticate, consent, and maintain an active connection.

---

## Overview
| Category | Description |
|-----------|-------------|
| **Objective** | Secure onboarding and tenant connection via OAuth 2.0 / Entra ID / Graph API |
| **Owner** | @marcuspeters |
| **Status** | 🟢 In Refinement |
| **Issue** | [#1](https://github.com/marcusp3t3rs/demoforge/issues/1) |

---

### ✅ **COMPLETED: Unattended Provisioning POC** 

**Status**: ✅ **COMPLETE** - All phases validated, final report available  
**Owner**: @marcusp3t3rs  
**Issues**: [#35](https://github.com/marcusp3t3rs/demoforge/issues/35), [#36](https://github.com/marcusp3t3rs/demoforge/issues/36), [#37](https://github.com/marcusp3t3rs/demoforge/issues/37), [#38](https://github.com/marcusp3t3rs/demoforge/issues/38) - **ALL CLOSED**

#### **FINAL VERDICT: UNATTENDED PROVISIONING IS TECHNICALLY FEASIBLE** ✅

**Overall Success Rate**: 80% immediate functionality, 20% requires async architecture

#### Final POC Results
| Phase | Component | Status | Success Rate | Key Findings |
|-------|-----------|--------|--------------||--------------|
| 0 | Config Verification | ✅ **Complete** | 100% | Azure app properly configured with required permissions |
| 1 | Authentication | ✅ **Complete** | 100% | Client credentials flow successful, token management validated |
| 2A | User Creation | ✅ **Complete** | 100% | Unattended user provisioning via Graph API working |
| 2B | License Assignment | ✅ **Complete** | 100% | **CRITICAL**: Automated license assignment implemented successfully |
| 3 | File Operations | ❌ **Limited** | 20% | OneDrive requires 5-15 minute delay after license assignment |
| 4 | Mail Operations | ✅ **Complete** | 100% | Email creation and Exchange integration working |
| 5 | Teams Operations | ❌ **Blocked** | 0% | Chat operations not supported in application-only context |

#### Epic 1 MVP Implementation Strategy

**Immediate Services (Sprint 1-2 Ready)**:
- ✅ User account creation and licensing (100% success)
- ✅ Exchange mailbox and email operations (100% success)
- ✅ Authentication and token management (100% success)

**Async Services (Sprint 3+ Background Jobs)**:
- 🔄 OneDrive file operations (5-15 minute provisioning delay)
- ❌ SharePoint and Teams integration (requires alternative approach)

**Content Lifecycle Management**: Comprehensive cleanup system implemented for Epic 1 disconnect scenarios

#### Technical Foundation Validated
- **License Management**: Pre-flight tenant validation and automatic assignment
- **Security**: All permission boundaries validated, admin consent flow confirmed
- **Content Tracking**: Complete resource lifecycle management for clean disconnection
- **Async Architecture**: Patterns established for delayed service provisioning

#### Final Deliverables
- **[POC Final Report](../../poc-final-report.md)**: Executive summary and technical findings
- **[Content Lifecycle Manager](../../dashboard/scripts/poc/content-lifecycle-manager.ts)**: Epic 1-ready cleanup system  
- **Complete Test Suite**: 8 TypeScript scripts with comprehensive validation

**Epic 1 Impact**: **PROCEED WITH HIGH CONFIDENCE** - Technical foundation validated, async architecture patterns established

---

## User Stories

### Legend
- **🟢 Closed** - Fully implemented and complete
- **🔄 Deferred** - Moved from another epic for better integration  
- **📋 Backlog** - Planned for future iterations within this epic
- **🚧 In Progress** - Currently being developed
- **⏸️ Blocked** - Waiting on dependencies or decisions

### Sprint 1: Core Authentication Framework (HIGH PRIORITY)
- [ ] [#2](https://github.com/marcusp3t3rs/demoforge/issues/2) E1-US1 Tenant Admin Authentication **🚧 Sprint 1** *(POC validated: Client credentials 100% success)*
- [ ] [#3](https://github.com/marcusp3t3rs/demoforge/issues/3) E1-US2 Admin Consent **🚧 Sprint 1** *(POC validated: Required for app permissions)*
- [ ] [#4](https://github.com/marcusp3t3rs/demoforge/issues/4) E1-US3 Token Exchange & Storage **🚧 Sprint 1** *(POC validated: 3599s token lifetime)*

### Sprint 2: Status & Management (MEDIUM PRIORITY)
- [ ] [#6](https://github.com/marcusp3t3rs/demoforge/issues/6) E1-US5 Connection Status Dashboard **📋 Sprint 2** *(Show license availability, service status)*
- [ ] [#5](https://github.com/marcusp3t3rs/demoforge/issues/5) E1-US4 Role & Tenant Verification **📋 Sprint 2** *(Validate admin roles)*
- [ ] [#7](https://github.com/marcusp3t3rs/demoforge/issues/7) E1-US6 Auto Refresh & Failure Handling **📋 Sprint 2** *(Background token refresh)*

### Sprint 3: Lifecycle & Audit (POLISH)
- [ ] [#8](https://github.com/marcusp3t3rs/demoforge/issues/8) E1-US7 Revoke / Reconnect **📋 Sprint 3** *(Integrate content lifecycle manager)*
- [ ] [#9](https://github.com/marcusp3t3rs/demoforge/issues/9) E1-US8 Audit Log **📋 Sprint 3** *(Track tenant operations)*

### Migrated from Epic 0
- [ ] [#13](https://github.com/marcusp3t3rs/demoforge/issues/13) E1-E0-US3 Connect Tenant CTA **📋 Backlog** *(migrated from Epic 0)*
- [ ] [#17](https://github.com/marcusp3t3rs/demoforge/issues/17) E1-E0-US7 Role Badge **📋 Backlog** *(migrated from Epic 0)*

### Deferred from E0-US1 (App Shell Integration)
- [ ] **E1-US9** RBAC Route Guards **🔄 Deferred** *(from E0-US1: authentication-based route protection)*
- [ ] **E1-US10** OIDC Sign-in/out UX **🔄 Deferred** *(from E0-US1: login/logout interface with Microsoft Entra ID)*
- [ ] **E1-US11** Session Management **🔄 Deferred** *(from E0-US1: token handling, refresh logic, user state persistence)*

### V1 Dependencies (Related Stories)
- [ ] [#15](https://github.com/marcusp3t3rs/demoforge/issues/15) E0-US5 Audit Preview **📋 V1** *(Depends on E1-US8 Audit Log)*

### Consolidated Stories (Closed Duplicates)
- [x] ~~#12 E0-US2 Authentication~~ **→ Merged into #2** *(duplicate authentication requirements)*
- [x] ~~#14 E0-US4 Connection Status Card~~ **→ Merged into #6** *(duplicate connection status features)*  

---

## 🚀 Implementation Approach

### POC Scripts Integration Strategy
The completed POC scripts in `/dashboard/scripts/poc/` contain validated functionality that will be systematically integrated into the MVP rather than rebuilt from scratch. See [POC Scripts Strategy](../../poc/POC_SCRIPTS_STRATEGY.md) for detailed migration plan.

**Key Integration Points**:
- **Authentication Patterns**: Proven client credentials flow from `01-authenticate.ts`
- **License Management**: Validated license detection and assignment from `02a-check-license.ts` and `02b-create-licensed-user.ts`  
- **Content Lifecycle**: Production-ready cleanup system from `content-lifecycle-manager.ts`
- **Async Architecture**: File operation delay handling patterns from `03-upload-file.ts`
- **Error Handling**: Comprehensive error scenarios and recovery patterns

### Development Branch Strategy
- **Current Branch**: `feature/epic-1-tenant-connection`
- **Integration Approach**: Extract POC patterns into `/lib/` components while preserving POC scripts as reference
- **Testing**: Reuse POC validation scenarios for integration testing

---

## Scope
**In Scope**
- Multi-tenant Entra ID app  
- OAuth 2.0 + PKCE flow  
- Encrypted token storage  
- Role & tenant validation  
- Connection health UI  
- Auto-refresh + alerts  
- Revoke/reconnect flow  
- Basic audit trail

**Added from E0-US1 Deferral:**
- RBAC route guards for authenticated access
- Login/logout UX integrated with Microsoft sign-in
- Session management and user state persistence  

**Out of Scope**
- Advanced Graph data syncs  
- Billing or usage analytics  

---

## Iteration Plan
| Sprint | Focus | Deliverables |
|--------|--------|--------------|
| 1 | Auth Flow MVP | Login + Callback + Token Store + RBAC Guards + OIDC UX |
| 2 | Resilience | Auto-refresh + Session Management + Revoke/Reconnect |
| 3 | Audit & Alerts | Logging + Metrics + Error Handling |

**Note:** Sprint 1 now includes E0-US1 deferred components (RBAC guards, OIDC UX, session management) for complete authentication integration with the existing app shell.

---

**Related:** [docs/mvp-backlog.md](../../mvp-backlog.md)
