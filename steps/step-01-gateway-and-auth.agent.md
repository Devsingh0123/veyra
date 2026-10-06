# STEP 01: API GATEWAY & AUTHENTICATION SERVICE

**Status:** CODE COMPLETE 🚀  
**Domains:**
1. **API Gateway (`services/api-gateway`):** Lightweight single-file Express Gateway (`express-http-proxy`), CORS, Healthcheck, and Reverse Proxying (`/api/v1/auth/*` -> `:3001`, `/api/v1/catalog/*` -> `:3002`).
2. **Authentication Service (`services/auth-service`):** Clean, standard Express architecture (Controllers, Middlewares, Routes, Services, Prisma ORM), Argon2id, JWT Rotation, Native JS Validation (No Zod).

---

## 1. ARCHITECTURAL BLUEPRINT & FOLDER STRUCTURES

### 1.1 Simplified API Gateway Structure (`services/api-gateway`)
```text
services/api-gateway/
├── src/
│   └── server.js                     # Concise Express app with express-http-proxy
├── .env.example
├── .env
├── package.json                      # Port: 3000
└── agent.md
```

### 1.2 Auth Service Clean Standard Structure (`services/auth-service`)
```text
services/auth-service/
├── prisma/
│   └── schema.prisma                 # Schema targeting postgres 'auth' schema
├── src/
│   ├── controllers/
│   │   └── auth.controller.js        # Request handler with native validation (No Zod)
│   ├── middlewares/
│   │   └── auth.middleware.js        # JWT verification & RBAC check
│   ├── routes/
│   │   └── auth.routes.js            # Express routes
│   ├── services/
│   │   └── auth.service.js           # Prisma queries, Argon2, token rotation
│   ├── prisma.js                     # PrismaClient instance
│   └── server.js                     # Server listener & Express app
├── .env.example
├── .env
├── package.json                      # Port: 3001
└── agent.md
```

---

## 2. STATUS CHECKLIST

- [x] **Done:** Cleaned up and removed Zod from Auth Service.
- [x] **Done:** Standardized to classic Express structure (`controllers/`, `middlewares/`, `routes/`, `services/`, `prisma.js`, `server.js`).
- [x] **Done:** Native request validation in `auth.controller.js`.
- [x] **Done:** Simplified API Gateway with `express-http-proxy` routing both auth and catalog.
- [ ] **Pending:** Install dependencies & run Prisma migrations.
- [ ] **Pending:** Verify end-to-end functionality via API Gateway (`http://localhost:3000/api/v1/auth/*`).

---

## 3. PROGRESS TRACKING & REVISIONS
- Any changes to authentication rules or gateway proxies are documented in this file and each service's `agent.md`.
