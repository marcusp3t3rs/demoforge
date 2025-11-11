# Epic 0 – Admin Dashboard & App Shell

**Project:** DemoForge  
**Goal:** Provide the entry point to initiate tenant connection, show status, and navigate features.  
**Outcome:** Admin lands, signs in, sees “Connect Tenant” CTA and health widgets.

## Overview
| Category | Description |
|---|---|
| **Objective** | App shell (layout, routing), admin auth, dashboard widgets, Connect CTA |
| **Owner** | @marcuspeters |
| **Status** | ✅ Complete |
| **Issue** | [#10](https://github.com/marcusp3t3rs/demoforge/issues/10) |
| **Depends on** | — (primes Epic 1) |

## User Stories
- [x] [#19](https://github.com/marcusp3t3rs/demoforge/issues/19) E0-US0 Initial Setup (Node.js app + basic dashboard) **✅ Complete**
- [ ] [#11](https://github.com/marcusp3t3rs/demoforge/issues/11) E0-US1 App Shell & Navigation *(Next Epic 1 phase)*
- [ ] [#12](https://github.com/marcusp3t3rs/demoforge/issues/12) E0-US2 Admin Sign-In *(Epic 1 integration)*
- [ ] [#13](https://github.com/marcusp3t3rs/demoforge/issues/13) E0-US3 Connect Tenant CTA *(Epic 1 integration)*
- [ ] [#14](https://github.com/marcusp3t3rs/demoforge/issues/14) E0-US4 Connection Status Card *(Epic 1 integration)*
- [ ] [#15](https://github.com/marcusp3t3rs/demoforge/issues/15) E0-US5 Audit Preview *(Future iteration)*
- [ ] [#16](https://github.com/marcusp3t3rs/demoforge/issues/16) E0-US6 Alerts & Toasts *(Future iteration)*
- [ ] [#17](https://github.com/marcusp3t3rs/demoforge/issues/17) E0-US7 Role Badge *(Epic 1 integration)*
- [ ] [#18](https://github.com/marcusp3t3rs/demoforge/issues/18) E0-US8 Empty-State UX *(Future iteration)*

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
| 0 | **Initial Setup:** Basic Node.js app + dashboard foundation |
| 1 | App shell + OIDC + Connect CTA + Empty state |
| 2 | Status card + Audit preview + Alerts |
| 3 | Polish (RBAC guard, loading/skeletons) |

---

## ✅ Completion Summary

**Epic 0 Foundation Delivered (November 2025):**

### 🏗️ **Technical Foundation**
- **Next.js 16 Dashboard:** Complete TypeScript + Tailwind CSS application
- **CI/CD Pipeline:** GitHub Actions with automated testing and deployment
- **Docker Configuration:** Production-ready containerization (Node.js 20)
- **Environment Management:** Proper `.env` structure for development and production
- **Development Workflow:** Complete local development setup with hot reload

### 🎨 **UI Components Implemented**
- **Dashboard Layout:** Responsive layout with navigation structure
- **Connect Tenant Card:** Primary CTA for tenant connection (ready for Epic 1)
- **Basic Empty State:** Initial empty state component (E0-US8 needs full implementation)
- **Component System:** Reusable React components with TypeScript foundation

### 🔧 **Development Experience**
- **Type Safety:** Full TypeScript integration with Next.js
- **Code Quality:** ESLint configuration (simplified for Next.js 16 compatibility)
- **Hot Reload:** Instant development feedback with `npm run dev`
- **Build System:** Optimized production builds with caching

### 🚀 **Ready for Epic 1**
- **Authentication Scaffolding:** NextAuth.js configuration prepared
- **Microsoft Integration Prep:** Environment variables configured for Entra ID
- **Modular Architecture:** Clean separation for adding tenant connection features

**Next Phase:** Epic 1 will build on this foundation to add Microsoft Entra ID integration, turning the "Connect Tenant" button into a fully functional OAuth flow.

**Related:** [docs/mvp-backlog.md](../../mvp-backlog.md)
