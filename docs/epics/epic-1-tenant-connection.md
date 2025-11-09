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
| **Issue** | [#1](../../issues/1) |

---

## User Stories
- [ ] [#2](../../issues/2) US-1 Tenant Admin Authentication  
- [ ] [#3](../../issues/3) US-2 Admin Consent  
- [ ] [#4](../../issues/4) US-3 Token Exchange & Storage  
- [ ] [#5](../../issues/5) US-4 Role & Tenant Verification  
- [ ] [#6](../../issues/6) US-5 Connection Status Dashboard  
- [ ] [#7](../../issues/7) US-6 Auto Refresh & Failure Handling  
- [ ] [#8](../../issues/8) US-7 Revoke / Reconnect  
- [ ] [#9](../../issues/9) US-8 Audit Log  

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

**Out of Scope**
- Advanced Graph data syncs  
- Billing or usage analytics  

---

## Iteration Plan
| Sprint | Focus | Deliverables |
|--------|--------|--------------|
| 1 | Auth Flow MVP | Login + Callback + Token Store + Basic UI |
| 2 | Resilience | Auto-refresh + Revoke/Reconnect |
| 3 | Audit & Alerts | Logging + Metrics + Error Handling |

---

**Related:** [docs/backlog.md](../backlog.md)
