# ⚡️ DemoForge

> **Modular AI Demo Environment Framework for Microsoft Tenants**  
> Build, connect, and showcase intelligent demo content — effortlessly.

---

## 🧭 Project Overview

**DemoForge** is a modular, tenant-ready platform for generating and managing AI-powered demo content across industries and business functions.  
It enables teams to **forge reproducible demo environments** that connect to Microsoft tenants, layer functional and industry logic, and provision users and sample content automatically.

With DemoForge, you can:
- Connect securely to Microsoft 365 tenants  
- Layer business functions and industries modularly  
- Auto-provision demo users and content  
- Monitor usage and performance  
- Package and deploy reproducible environments  

---

## 🧱 Core Epics

| # | Epic | Status | Issue | Description |
|:-:|------|--------|-------|-------------|
| 0 | **[Admin Dashboard & App Shell](docs/epics/epic-0-admin-dashboard.md)** | 🟢 In Refinement | [#10](https://github.com/marcusp3t3rs/demoforge/issues/10) | Entry point: auth, nav, connect CTA, status widgets |
| 1 | **[Tenant Connection & Setup](docs/epics/epic-1-tenant-connection.md)** | 🟢 In Refinement | [#1](https://github.com/marcusp3t3rs/demoforge/issues/1) | Secure onboarding & tenant authentication via OAuth 2.0 / Entra ID |
| 2 | **Function & Industry Layering** | ⚪ Planned | — | Modularly define business functions and industry logic |
| 3 | **Demo User Provisioning** | ⚪ Planned | — | Automatically create realistic demo personas and assign roles |
| 4 | **Content Generation** | ⚪ Planned | — | Generate AI-driven demo data, documents, and interactions |
| 5 | **Dashboard & Monitoring** | ⚪ Planned | — | Visualize system health, tenant status, and usage analytics |
| 6 | **Installation & Packaging** | ⚪ Planned | — | Deploy anywhere — locally, via Codespaces, or Azure |

📋 **[Complete Backlog](docs/backlog.md)**

## 🧭 Service Overview

The **DemoForge Project** aims to create a modular, tenant-ready service for generating and managing AI-powered demo content across industries and business functions.  
It provides a foundation for building repeatable, installable demo environments that connect to Microsoft tenants, layer functional and industry-specific logic, and provision demo users and sample content automatically.

Ultimately, the goal is to deliver a **self-contained, reproducible environment** for demonstrating AI and Copilot scenarios — with clear separation between:
- **Tenant Connection & Setup**
- **Functional and Industry Layering**
- **Demo User Provisioning**
- **Content Generation**
- **Dashboard & Monitoring**
- **Installation & Packaging**

This repository is the **development workspace** for implementing those epics using a standardized dev container setup.

---

## ⚙️ Development Container

This repository relies on the Microsoft “universal” dev container image specified in `.devcontainer/devcontainer.json`:

```json
{"image": "mcr.microsoft.com/devcontainers/universal:2"}
```

That means the development environment is provided entirely by the container image.  
It includes common tools and runtimes (Node.js, Python, .NET, PowerShell, Git, etc.), so there are **no repository-level configuration files** like `package.json` or `pyproject.toml` at this stage.

When project-specific setup is required (e.g., installing packages, adding VS Code extensions, running post-create commands, or pinning tool versions), update `.devcontainer/devcontainer.json` or add a `Dockerfile` / devcontainer features to extend the environment.

For now, the minimal single-line devcontainer configuration is **intentional** — keeping the setup lightweight while focusing on architecture and content structure.

---

## 🧰 Tech Requirements

Developers contributing to this project should ensure the following:

### Prerequisites
- **VS Code** with the **Dev Containers** extension  
- **Docker Desktop** or a compatible container runtime  
- Optional: **GitHub Codespaces** for cloud-based development  

### Recommended Skills
- Familiarity with **TypeScript**, **Python**, or **Node.js**  
- Basic understanding of **Microsoft 365 tenants** and **Azure Active Directory**  
- Experience with **OpenAI / Azure OpenAI API** integrations  
- Comfort with **containerized development** (Dev Containers / Docker)  

### Optional Tools
- **Makefile** or simple shell scripts for automation  
- **Task runners** like `npm` or `poetry` once project-specific modules are added  
- **Prettier / ESLint / Black** for consistent code formatting  

---

## 🚀 Getting Started

### Development Setup
1. **Dashboard Application:**
   ```bash
   cd dashboard
   npm install
   cp .env.example .env.local
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000)

2. **VS Code Development:**
   - Open in Dev Container for full environment
   - Install recommended extensions
   - Use integrated terminal for all commands

## 🧩 Next Steps

1. ✅ ~~Define folder structure for epics~~ → **Complete** (`docs/epics/` created)
2. ✅ ~~Create Epic 0 & Epic 1 documentation~~ → **Complete** ([Epic 0](docs/epics/epic-0-admin-dashboard.md) + [Epic 1](docs/epics/epic-1-tenant-connection.md))
3. ✅ ~~E0-US0 Initial Setup~~ → **Complete** (Next.js dashboard running)
4. 🚀 **Current Focus:** Epic 0 development (app shell, OIDC, widgets)
5. **Next:** Epic 1 development (Microsoft Entra ID integration)

---

_This repository is designed to stay minimal until core modules (Epics 1–6) are defined and implemented._


# MVP Epics

## 🎯 Overview

The Demo Content Project MVP is structured around six major **Epics**, representing the core building blocks for a modular, tenant-connected demo content platform.  
Each Epic defines a clear functional area and is designed to be incrementally built and validated.

---

## 🧩 Epic 1 — Tenant Connection & Setup

> **Status:** 🟢 In Refinement | **Issue:** [#1](https://github.com/marcusp3t3rs/demoforge/issues/1) | **Details:** [Epic 1 Documentation](docs/epics/epic-1-tenant-connection.md)

**Goal:**  
Enable secure connection of Microsoft 365 tenants to the DemoForge Dashboard with OAuth 2.0 / Entra ID authentication flow.

**Key Outcomes:**
- Multi-tenant Entra ID app with OAuth 2.0 + PKCE flow
- Encrypted token storage with auto-refresh capabilities  
- Role & tenant validation for admin access
- Connection health UI with revoke/reconnect functionality
- Basic audit trail for authentication events

**Active User Stories:** [Issues #2-#9](https://github.com/marcusp3t3rs/demoforge/issues)
- US-1: Tenant Admin Authentication
- US-2: Admin Consent  
- US-3: Token Exchange & Storage
- US-4: Role & Tenant Verification
- US-5: Connection Status Dashboard
- US-6: Auto Refresh & Failure Handling
- US-7: Revoke / Reconnect
- US-8: Audit Log

---

## 🏗️ Epic 2 — Function & Industry Layering

**Goal:**  
Provide a flexible structure for layering business functions (HR, Finance, etc.) and industry-specific logic (Retail, Manufacturing, Healthcare, etc.) on top of a shared foundation.

**Key Outcomes:**
- Define functional templates reusable across industries
- Introduce industry-specific configuration or demo assets
- Support modular expansion and isolation of logic
- Allow content generation logic to adapt based on selected function or industry

**User Stories:**
- As a user, I can select which functions and industries to include in my demo environment.  
- As a developer, I can add or modify function/industry layers easily.  
- As a product owner, I can define shared logic across industries to reduce duplication.

---

## 👥 Epic 3 — Demo User Provisioning

**Goal:**  
Automatically create, configure, and assign demo users representing realistic personas for selected industries and functions.

**Key Outcomes:**
- Define user archetypes/personas (e.g., HR Manager, CFO, Sales Rep)
- Provision users via Microsoft Graph APIs
- Assign licenses, roles, and data access
- Link user setup to function/industry selections

**User Stories:**
- As a user, I can generate demo users automatically.  
- As a developer, I can map users to demo data and permissions.  
- As an admin, I can view and reset user configurations.

---

## 🧠 Epic 4 — Content Generation

**Goal:**  
Generate AI-driven demo content (emails, documents, tasks, chat threads, etc.) aligned with industry, function, and persona contexts.

**Key Outcomes:**
- Integrate OpenAI / Azure OpenAI for content generation
- Create templates for different business scenarios
- Generate contextual content linked to demo users
- Allow content refresh or regeneration on demand

**User Stories:**
- As a user, I can generate sample business data and documents for demos.  
- As a developer, I can define new templates and content rules.  
- As a trainer, I can reset content to a known baseline for each demo.

---

## 📊 Epic 5 — Dashboard & Monitoring

**Goal:**  
Provide a management dashboard for visualizing system health, tenant status, demo usage, and content generation metrics.

**Key Outcomes:**
- Display tenant connections, demo user counts, and content generation stats
- Implement logging and monitoring (application-level)
- Offer basic analytics (e.g., which industries/functions are most used)
- Support admin controls for refresh/reset

**User Stories:**
- As an admin, I can view system metrics and tenant status.  
- As a user, I can monitor progress of demo content generation.  
- As a developer, I can analyze logs to debug issues.

---

## 📦 Epic 6 — Installation & Packaging

**Goal:**  
Deliver the entire system as an installable, reproducible package that can be deployed locally, via Codespaces, or in Azure environments.

**Key Outcomes:**
- Define packaging and deployment scripts (Dev Containers, Docker Compose, or ARM templates)
- Enable easy installation via GitHub Codespaces or VS Code Remote
- Provide clear setup documentation and configuration options
- Support versioning and upgrades

**User Stories:**
- As a user, I can install the system in one step using the provided setup.  
- As a developer, I can replicate the environment consistently.  
- As an admin, I can deploy updates with minimal effort.

---

_These six Epics together form the MVP foundation for the Demo Content Project._