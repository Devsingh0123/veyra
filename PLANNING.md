# VEYRA — PRODUCTION ARCHITECTURE & MASTER PLANNING SPECIFICATION
**Platform:** Veyra (Real, Production-Grade Indian Multi-Category E-Commerce Platform)  
**Version:** 2.1.0-PROD (API Gateway + Enterprise Layered Architecture)  
**Document Purpose:** Master Architectural Blueprint, Industry-Standard ORM Reference, and Modular Step Registry.

---

## 1. EXECUTIVE VISION & CORE ARCHITECTURAL PRINCIPLES

Veyra is an Indian multi-category physical goods marketplace designed for consumer goods across diverse categories:
- **Apparel & Fashion:** Multi-attribute variants (Size, Color, Fabric, Gender), high return rates, tiered GST (5% / 12%).
- **Consumer Electronics:** Serial/IMEI tracking, high cart values, strict tamper-proof return policies, 18% GST.
- **Spiritual & Puja Items:** Fragile packaging, liquid handling, zero/low tax rates (0% / 5% / 12%).
- **Jewelry & Precious Items:** Metal purity, carat weight, OTP-verified courier delivery, 3% GST.
- **Beauty & Personal Care:** Non-returnable seal protection, batch & expiry management, 18% GST.
- **Home & Kitchen:** Bulky dimensions, volumetric freight calculation, 12% / 18% GST.
- **Packaged Goods / FMCG:** Shelf life, dietary flags (Veg/Non-Veg green/brown dot), fast inventory turns.

### The Architectural Priority Hierarchy
$$\mathbf{Correctness} \longrightarrow \mathbf{Security} \longrightarrow \mathbf{Maintainability} \longrightarrow \mathbf{Reliability} \longrightarrow \mathbf{Scalability} \longrightarrow \mathbf{Complexity}$$

1. **Unified API Gateway Entrypoint:** All external client requests (Storefront, Admin, Mobile) enter strictly through the **API Gateway** (`:3000`). Internal microservices operate on private ports behind the gateway.
2. **Layered Industry-Standard Service Architecture:** Every microservice enforces a strict 4-layer design:
   - **Controller Layer:** HTTP transport, cookie handling, standard response formatting.
   - **Validation Layer:** Zod DTO schema validation middleware.
   - **Service Layer:** Pure business logic and domain rules.
   - **Repository Layer:** Data access abstraction via **Prisma ORM** (Zero raw SQL).
3. **Client Never Dictates Business State:** Prices, discounts, shipping fees, tax amounts, inventory reservations, and payment proofs are strictly calculated, validated, and asserted on the server.
4. **Immutable Historical Snapshots:** Orders, tax invoices, and shipping records must never mutate or depend on live catalog or user entities.
5. **Fail-Closed Financial Transactions:** Signature mismatches, payment anomalies, or duplicate webhooks immediately default to safe rejection or idempotent quarantine.
6. **Standardized ORM (Zero Raw SQL):** All persistent data interactions must leverage an industry-standard ORM (**Prisma ORM**). Raw SQL strings, unescaped queries, and manual database drivers are strictly prohibited in application domain code to guarantee type safety, automated migration management, injection prevention, and maintainable schemas.
7. **Pragmatic Microservices:** Boundaries follow transactional domains. Internal calls are synchronous only when immediate consistency is required (e.g., inventory reservation); all other workflows are asynchronous via Redis & BullMQ.
8. **Modular Step-by-Step Execution:** All implementation is split into isolated `steps/step-XX-*.agent.md` execution blueprints. Modifications to any domain are confined to its respective step file without perturbing the global architecture.

---

## 2. REPOSITORY & MONOREPO TOPOLOGY

The codebase is structured as a unified monorepo governed by native **npm workspaces**:

```text
veyra/
├── PLANNING.md                 # Permanent master architecture & roadmap (This File)
├── package.json                # Root workspaces definition & orchestration scripts
├── .gitignore                  # Git exclusions (node_modules, .env, build artifacts)
├── .editorconfig               # Uniform editor styling rules
├── init-schemas.sql            # PostgreSQL multi-schema initialization script
├── docker-compose.dev.yml      # Local development PostgreSQL 16 + Redis 7
├── docker-compose.yml          # Production multi-container composition
│
├── steps/                      # Modular Step-by-Step Agent Execution Guides
│   ├── step-00-monorepo-infra.agent.md       # Phase 0: Monorepo & Infra (DONE)
│   ├── step-01-gateway-and-auth.agent.md     # Phase 1: API Gateway & Auth Service (IN PROGRESS)
│   ├── step-02-catalog-service.agent.md      # Phase 2: Catalog & Categories (PENDING)
│   ├── step-03-cart-service.agent.md         # Phase 3: Cart Management (PENDING)
│   ├── step-04-inventory-reservation.agent.md# Phase 4: Inventory Concurrency (PENDING)
│   ├── step-05-checkout-gst-cod.agent.md     # Phase 5: Indian Tax & Checkout (PENDING)
│   ├── step-06-payment-service.agent.md      # Phase 6: Razorpay & Webhooks (PENDING)
│   ├── step-07-order-service.agent.md        # Phase 7: Order FSM & Lifecycle (PENDING)
│   ├── step-08-notification-service.agent.md # Phase 8: BullMQ Notifications (PENDING)
│   ├── step-09-tax-invoicing.agent.md        # Phase 9: PDF Invoice Generation (PENDING)
│   ├── step-10-shipping-logistics.agent.md   # Phase 10: Logistics Integration (PENDING)
│   ├── step-11-returns-refunds.agent.md      # Phase 11: Reverse Logistics & Credit Notes (PENDING)
│   ├── step-12-admin-portal.agent.md         # Phase 12: Admin Operations SPA (PENDING)
│   ├── step-13-storefront-portal.agent.md    # Phase 13: Customer Storefront SPA (PENDING)
│   └── step-14-hardening-deployment.agent.md # Phase 14: Hardening & Go-Live (PENDING)
│
├── storefront/                 # Customer-facing React 18 + Vite SPA (Port: 5173)
├── admin/                      # Operations & Admin React 18 + Vite SPA (Port: 5174)
│
└── services/
    ├── api-gateway/            # Unified API Gateway & Reverse Proxy (Port: 3000)
    ├── auth-service/           # Identity, RBAC, Sessions (Port: 3001) [Prisma: auth]
    ├── catalog-service/        # Multi-category Catalog, Variants (Port: 3002) [Prisma: catalog]
    ├── cart-service/           # Guest & User Bags, Sync (Port: 3003) [Prisma: cart + Redis]
    ├── order-service/          # Orders, Checkout FSM (Port: 3004) [Prisma: orders]
    ├── payment-service/        # Razorpay API, Webhooks, Ledger (Port: 3005) [Prisma: payments]
    └── notification-service/   # Email, SMS, WhatsApp BullMQ workers (Port: 3006)
```

---

## 3. DOMAIN SERVICE BOUNDARIES & API GATEWAY TOPOLOGY

All incoming HTTP traffic targets `http://localhost:3000`. The API Gateway coordinates reverse proxying, correlation IDs, rate limits, and health checks:

```text
                           ┌───────────────────────────────┐
                           │      Client Applications      │
                           │ Storefront (:5173) / Admin (:5174)
                           └───────────────┬───────────────┘
                                           │
                                           ▼
                           ┌───────────────────────────────┐
                           │          API GATEWAY          │
                           │           Port 3000           │
                           │  • CORS & Rate Limiting       │
                           │  • X-Request-ID Tracking      │
                           │  • Health Check Aggregation   │
                           │  • Reverse Proxy Routing      │
                           └───────┬───────────┬───────────┘
                                   │           │
           ┌───────────────────────┘           └───────────────────────┐
           ▼                                                           ▼
┌──────────────────────────┐                               ┌──────────────────────────┐
│       auth-service       │ :3001                         │     catalog-service      │ :3002
│ Proxy: /api/v1/auth/*    │                               │ Proxy: /api/v1/catalog/* │
│ Schema: auth (Prisma)    │                               │ Schema: catalog (Prisma) │
└──────────────────────────┘                               └──────────────────────────┘
           │                                                           │
           ▼                                                           ▼
┌──────────────────────────┐                               ┌──────────────────────────┐
│       cart-service       │ :3003                         │      order-service       │ :3004
│ Proxy: /api/v1/cart/*    │                               │ Proxy: /api/v1/orders/*  │
│ Schema: cart (Prisma)    │                               │ Schema: orders (Prisma)  │
└──────────────────────────┘                               └──────────────────────────┘
           │                                                           │
           ▼                                                           ▼
┌──────────────────────────┐                               ┌──────────────────────────┐
│     payment-service      │ :3005                         │   notification-service   │ :3006
│ Proxy: /api/v1/payments/*│                               │ BullMQ Worker Queues     │
│ Schema: payments (Prisma)│                               │ Email / SMS / WhatsApp   │
└──────────────────────────┘                               └──────────────────────────┘
```

---

## 4. DATABASE & ORM ARCHITECTURE: PRISMA MULTI-SCHEMA ISOLATION

### 4.1 Why Prisma ORM Over Raw SQL?
1. **Industry-Standard Productivity & Type Safety:** Automatically generated Prisma Clients provide full type inference, autocomplete, and compile-time validation for queries, filters, and relations.
2. **Elimination of SQL Injection Risks:** All queries are parameterized at the ORM engine level without relying on manual parameter sanitization.
3. **Automated Migration Engine:** `prisma migrate dev` tracks version-controlled SQL migrations cleanly without manual file execution or fragile ad-hoc schema patching.
4. **Declarative Data Modeling:** Entity relationships, indexes, unique constraints, and JSONB structures are maintained in readable `schema.prisma` files.
5. **No Cross-Schema Leaks:** Each service maintains its own Prisma Client connecting strictly to its designated PostgreSQL logical schema via `?schema=<domain>`.

### 4.2 Multi-Schema Prisma Setup Pattern
Each microservice repository contains its own `prisma/` folder and `schema.prisma`:

```prisma
// Example: services/auth-service/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // postgresql://postgres:postgrespassword@localhost:5432/veyra_dev?schema=auth
  schemas  = ["auth"]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

model User {
  id           String        @id @default(uuid()) @db.Uuid
  email        String        @unique @db.VarChar(255)
  phone        String?       @unique @db.VarChar(20)
  passwordHash String?       @map("password_hash") @db.VarChar(255)
  fullName     String        @map("full_name") @db.VarChar(150)
  role         UserRole      @default(CUSTOMER)
  isActive     Boolean       @default(true) @map("is_active")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  refreshTokens RefreshToken[]

  @@map("users")
  @@schema("auth")
}
```

---

## 5. 15-PHASE MODULAR ROADMAP & AGENT EXECUTION REGISTRY

| Phase | Milestone Name | Status | Dedicated Agent File | Key Deliverables |
|---|---|---|---|---|
| **Phase 0** | **Monorepo & Infrastructure** | **COMPLETE ✅** | [step-00-monorepo-infra.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-00-monorepo-infra.agent.md) | Workspaces, Docker Compose, 6 service scaffolds, 2 Vite SPAs, healthchecks. |
| **Phase 1** | **API Gateway & Auth Service** | **IN PROGRESS ⏳** | [step-01-gateway-and-auth.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-01-gateway-and-auth.agent.md) | Unified Gateway (:3000), Auth Service (:3001) with Layered Architecture, Prisma schema, Argon2id, JWT rotation, Google OAuth, RBAC. |
| **Phase 2** | **Catalog & Multi-Category Service** | *Pending ⏳* | [step-02-catalog-service.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-02-catalog-service.agent.md) | Prisma schema (catalog), category hierarchy, JSONB attributes, S3 media, search, gateway integration. |
| **Phase 3** | **Cart Management Service** | *Pending ⏳* | [step-03-cart-service.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-03-cart-service.agent.md) | Redis guest carts, Prisma user cart, auto-merge upon login, stock validation, gateway integration. |
| **Phase 4** | **Inventory Concurrency & Reservation** | *Pending ⏳* | [step-04-inventory-reservation.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-04-inventory-reservation.agent.md) | Prisma transaction locking, 15m reservation hold, BullMQ auto-release worker. |
| **Phase 5** | **Checkout, Indian GST & COD Scoring** | *Pending ⏳* | [step-05-checkout-gst-cod.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-05-checkout-gst-cod.agent.md) | PIN serviceability, CGST/SGST/IGST engine, single-use coupons, COD risk rules. |
| **Phase 6** | **Razorpay Payment & Webhook Ledger** | *Pending ⏳* | [step-06-payment-service.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-06-payment-service.agent.md) | Razorpay Orders API, HMAC verification, Prisma idempotency ledger, auto-refunds, gateway integration. |
| **Phase 7** | **Order Lifecycle & State Machine** | *Pending ⏳* | [step-07-order-service.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-07-order-service.agent.md) | Prisma orders schema, strict state machine transitions, immutable snapshots, gateway integration. |
| **Phase 8** | **Notification Service & BullMQ Workers** | *Pending ⏳* | [step-08-notification-service.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-08-notification-service.agent.md) | Asynchronous queues, email/SMS/WhatsApp dispatch, exponential retry, DLQ. |
| **Phase 9** | **Automated Tax Invoicing Engine** | *Pending ⏳* | [step-09-tax-invoicing.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-09-tax-invoicing.agent.md) | Puppeteer PDF generation, consecutive FY invoice serials, S3/R2 upload, URLs. |
| **Phase 10** | **Shipping & Logistics Abstraction** | *Pending ⏳* | [step-10-shipping-logistics.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-10-shipping-logistics.agent.md) | Carrier abstraction (Delhivery/Shiprocket), AWB generation, tracking sync. |
| **Phase 11** | **Returns, Reverse Logistics & Refunds** | *Pending ⏳* | [step-11-returns-refunds.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-11-returns-refunds.agent.md) | 7-day return request, admin inspection, Razorpay refund API, GST Credit Notes. |
| **Phase 12** | **Admin Operations Web Application** | **COMPLETED 🚀** | [step-12-admin-portal.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-12-admin-portal.agent.md) | Dedicated plan in [`admin/ADMIN.md`](file:///c:/Users/HP/Desktop/New%20folder/admin/ADMIN.md). Standalone SPA (Vite, Tailwind v4, Shadcn Nova, Redux Toolkit + RTK Query, Axios). |
| **Phase 13** | **Customer Storefront Web Application** | *Pending ⏳* | [step-13-storefront-portal.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-13-storefront-portal.agent.md) | Modern Vite/React customer store, mobile-first, PDP, checkout accordion, bag drawer. |
| **Phase 14** | **Hardening, CI/CD & Production Go-Live** | *Pending ⏳* | [step-14-hardening-deployment.agent.md](file:///c:/Users/HP/Desktop/New%20folder/steps/step-14-hardening-deployment.agent.md) | Nginx TLS 1.3 reverse proxy, GitHub Actions CI/CD, backup drills, Playwright E2E. |

---

*This document is the authoritative master project architecture for Veyra.*
