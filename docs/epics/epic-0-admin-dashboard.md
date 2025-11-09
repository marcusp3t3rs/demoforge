# Epic 0 – Admin Dashboard & App Shell

**Project:** DemoForge  
**Goal:** Provide the entry point to initiate tenant connection, show status, and navigate features.  
**Outcome:** Admin lands, signs in, sees “Connect Tenant” CTA and health widgets.

## Overview
| Category | Description |
|---|---|
| **Objective** | App shell (layout, routing), admin auth, dashboard widgets, Connect CTA |
| **Owner** | @marcuspeters |
| **Status** | 🟢 In Refinement |
| **Issue** | [#10](https://github.com/marcusp3t3rs/demoforge/issues/10) |
| **Depends on** | — (primes Epic 1) |

## User Stories
- [ ] [#11](https://github.com/marcusp3t3rs/demoforge/issues/11) E0-US1 App Shell & Navigation
- [ ] [#12](https://github.com/marcusp3t3rs/demoforge/issues/12) E0-US2 Admin Sign-In  
- [ ] [#13](https://github.com/marcusp3t3rs/demoforge/issues/13) E0-US3 Connect Tenant CTA
- [ ] [#14](https://github.com/marcusp3t3rs/demoforge/issues/14) E0-US4 Connection Status Card
- [ ] [#15](https://github.com/marcusp3t3rs/demoforge/issues/15) E0-US5 Audit Preview
- [ ] [#16](https://github.com/marcusp3t3rs/demoforge/issues/16) E0-US6 Alerts & Toasts
- [ ] [#17](https://github.com/marcusp3t3rs/demoforge/issues/17) E0-US7 Role Badge
- [ ] [#18](https://github.com/marcusp3t3rs/demoforge/issues/18) E0-US8 Empty-State UX

## Scope
**In**
- App shell (header, sidebar, main), routing, RBAC guard  
- OIDC sign-in/out UX  
- Widgets: Connect button, Status, Audit preview  
- Error/empty-state handling

**Out**
- Deep analytics, custom theming, multi-locale

## Iteration Plan
| Sprint | Deliverables |
|---|---|
| 1 | App shell + OIDC + Connect CTA + Empty state |
| 2 | Status card + Audit preview + Alerts |
| 3 | Polish (RBAC guard, loading/skeletons) |

**Related:** [docs/backlog.md](../backlog.md)
