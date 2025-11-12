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

### Near-term Feasibility POC: Unattended Provisioning (POC)

Objective
- Timebox a focused feasibility spike to validate whether unattended provisioning and periodic "heartbeat" activity can be implemented safely and practically for demo users, mail, files, and chats.

Timebox &amp; Owner
- Timebox: 2–4 days (recommended 3 days)
- Owner: @marcusp3t3rs

POC Tasks
- Register a test Azure app with application permissions (User.ReadWrite.All, Mail.ReadWrite, Files.ReadWrite.All, Teams-related permissions as needed).
- Implement a minimal client_credentials script that:
  - Obtains an app-only token.
  - Creates a test user and (optionally) assigns a license to provision a mailbox.
  - Uploads a file to the user's OneDrive.
  - Creates a mail item in the user's mailbox (if supported).
  - Attempts to create a Teams chat message as the test user (document results).
- Verify authorship/attribution (From/CreatedBy) for created items.
- Test Application Access Policies or other tenant constraints.
- Produce a short POC report with recommendations (app-only vs delegated vs hybrid), required Graph scopes, admin consent UX, security controls, and sample scripts.

Acceptance Criteria
- Clear determination whether unattended background refresh is feasible with app-only credentials or whether a hybrid approach is required, with documented trade-offs and example scripts/requests.

Impact on backlog
- If POC succeeds, promote E1‑US2 (Admin Consent), E1‑US3 (Token Exchange &amp; Storage), and E1‑US6 (Auto Refresh) for implementation in V1 (or MVP if you choose to include unattended refresh).
- If POC identifies blockers, keep MVP focused on dashboard + login + mocked provisioning and schedule unattended provisioning for V1 with documented constraints.

---

## User Stories

### Legend
- **🟢 Closed** - Fully implemented and complete
- **🔄 Deferred** - Moved from another epic for better integration  
- **📋 Backlog** - Planned for future iterations within this epic
- **🚧 In Progress** - Currently being developed
- **⏸️ Blocked** - Waiting on dependencies or decisions

### Core Tenant Connection
- [ ] [#2](https://github.com/marcusp3t3rs/demoforge/issues/2) E1-US1 Tenant Admin Authentication **📋 Backlog**
- [ ] [#3](https://github.com/marcusp3t3rs/demoforge/issues/3) E1-US2 Admin Consent **📋 Backlog**
- [ ] [#4](https://github.com/marcusp3t3rs/demoforge/issues/4) E1-US3 Token Exchange & Storage **📋 Backlog**
- [ ] [#5](https://github.com/marcusp3t3rs/demoforge/issues/5) E1-US4 Role & Tenant Verification **📋 Backlog**
- [ ] [#6](https://github.com/marcusp3t3rs/demoforge/issues/6) E1-US5 Connection Status Dashboard **📋 Backlog**
- [ ] [#7](https://github.com/marcusp3t3rs/demoforge/issues/7) E1-US6 Auto Refresh & Failure Handling **📋 Backlog**
- [ ] [#8](https://github.com/marcusp3t3rs/demoforge/issues/8) E1-US7 Revoke / Reconnect **📋 Backlog**
- [ ] [#9](https://github.com/marcusp3t3rs/demoforge/issues/9) E1-US8 Audit Log **📋 Backlog**

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
