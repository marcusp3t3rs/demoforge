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

## User Stories

### Legend
- **🟢 Closed** - Fully implemented and complete
- **🔄 Deferred** - Moved from another epic for better integration  
- **📋 Backlog** - Planned for future iterations within this epic
- **🚧 In Progress** - Currently being developed
- **⏸️ Blocked** - Waiting on dependencies or decisions

### Core Tenant Connection
- [ ] [#2](https://github.com/marcusp3t3rs/demoforge/issues/2) US-1 Tenant Admin Authentication (Dashboard Access) **📋 Backlog** *(Consolidated with E0-US2)*
- [ ] [#3](https://github.com/marcusp3t3rs/demoforge/issues/3) US-2 Admin Consent **📋 Backlog**
- [ ] [#4](https://github.com/marcusp3t3rs/demoforge/issues/4) US-3 Token Exchange & Storage **📋 Backlog**
- [ ] [#5](https://github.com/marcusp3t3rs/demoforge/issues/5) US-4 Role & Tenant Verification **📋 Backlog**
- [ ] [#6](https://github.com/marcusp3t3rs/demoforge/issues/6) US-5 Connection Status Dashboard **📋 Backlog** *(Consolidated with E0-US4)*
- [ ] [#7](https://github.com/marcusp3t3rs/demoforge/issues/7) US-6 Auto Refresh & Failure Handling **📋 Backlog**
- [ ] [#8](https://github.com/marcusp3t3rs/demoforge/issues/8) US-7 Revoke / Reconnect **📋 Backlog**
- [ ] [#9](https://github.com/marcusp3t3rs/demoforge/issues/9) US-8 Audit Log **📋 Backlog**

### Deferred from E0-US1 (App Shell Integration)
- [ ] **E1-US9** RBAC Route Guards **🔄 Deferred** *(from E0-US1: authentication-based route protection)*
- [ ] **E1-US10** OIDC Sign-in/out UX **🔄 Deferred** *(from E0-US1: login/logout interface with Microsoft Entra ID)*
- [ ] **E1-US11** Session Management **🔄 Deferred** *(from E0-US1: token handling, refresh logic, user state persistence)*

### V1 Dependencies (Related Stories)
- [ ] [#15](https://github.com/marcusp3t3rs/demoforge/issues/15) E0-US5 Audit Preview **📋 V1** *(Depends on US-8 Audit Log)*

### Consolidated Stories (Closed Duplicates)
- [x] ~~#12 E0-US2 Authentication~~ **→ Merged into #2** *(duplicate authentication requirements)*
- [x] ~~#14 E0-US4 Connection Status Card~~ **→ Merged into #6** *(duplicate connection status features)*  

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
