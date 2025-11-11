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

### Core Tenant Connection
- [ ] [#2](https://github.com/marcusp3t3rs/demoforge/issues/2) US-1 Tenant Admin Authentication  
- [ ] [#3](https://github.com/marcusp3t3rs/demoforge/issues/3) US-2 Admin Consent  
- [ ] [#4](https://github.com/marcusp3t3rs/demoforge/issues/4) US-3 Token Exchange & Storage  
- [ ] [#5](https://github.com/marcusp3t3rs/demoforge/issues/5) US-4 Role & Tenant Verification  
- [ ] [#6](https://github.com/marcusp3t3rs/demoforge/issues/6) US-5 Connection Status Dashboard  
- [ ] [#7](https://github.com/marcusp3t3rs/demoforge/issues/7) US-6 Auto Refresh & Failure Handling  
- [ ] [#8](https://github.com/marcusp3t3rs/demoforge/issues/8) US-7 Revoke / Reconnect  
- [ ] [#9](https://github.com/marcusp3t3rs/demoforge/issues/9) US-8 Audit Log

### Deferred from E0-US1 (App Shell Integration)
- [ ] **E1-US9** RBAC Route Guards *(integrate authentication-based route protection)*
- [ ] **E1-US10** OIDC Sign-in/out UX *(login/logout interface with Microsoft Entra ID)*
- [ ] **E1-US11** Session Management *(token handling, refresh logic, user state persistence)*  

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
