# AUTH SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/auth-service`  
**Port:** 3001  
**Database Schema:** `auth` (PostgreSQL via Prisma ORM)  
**Status:** CODE COMPLETE 🚀  
**Tech Stack:** Node.js (v20+), Express.js, Prisma ORM (`^6.4.0`), Argon2id, JWT, Cookie-Parser, CORS  

---

## 1. PURPOSE & ARCHITECTURE
Provides clean, simple authentication, identity, and token rotation:
- **Zero Raw SQL (Prisma ORM):** Queries target logical schema `auth`.
- **Argon2id Passwords:** Secure memory-hard hashing.
- **Dual-Token System:** 15m Access JWT + 7d rotating Refresh Tokens with replay detection.
- **RBAC:** Roles (`CUSTOMER`, `WAREHOUSE_STAFF`, `CATALOG_MANAGER`, `ADMIN`, `SUPER_ADMIN`).
- **No Heavy Validation Libraries (Zero Zod):** Native JavaScript validation.
- **Clean Standard Express Structure:**
  - `controllers/auth.controller.js` -> HTTP requests, cookies, and responses
  - `middlewares/auth.middleware.js` -> JWT verification & RBAC check
  - `routes/auth.routes.js` -> Route definitions
  - `services/auth.service.js` -> Business logic with Prisma ORM and Argon2
  - `prisma.js` -> Prisma client instance
  - `server.js` -> Server listener and Express app setup

---

## 2. FOLDER STRUCTURE
```text
services/auth-service/
├── prisma/
│   └── schema.prisma         # PostgreSQL 'auth' schema models
├── src/
│   ├── controllers/
│   │   └── auth.controller.js # Clean HTTP handler with native validation
│   ├── middlewares/
│   │   └── auth.middleware.js # Simple JWT verification & role authorization
│   ├── routes/
│   │   └── auth.routes.js     # Route bindings
│   ├── services/
│   │   └── auth.service.js    # Prisma queries, Argon2, token logic
│   ├── prisma.js              # PrismaClient instance
│   └── server.js              # Express app & HTTP listener
├── .env.example
├── .env
├── package.json
└── agent.md                   # This living service document
```

---

## 3. PRISMA MODELS (`auth` schema)

- `User`: `id (UUID)`, `email (unique)`, `phone (unique)`, `passwordHash`, `fullName`, `role (enum)`, `googleId (unique)`, `isActive`, `isVerified`, `createdAt`, `updatedAt`.
- `RefreshToken`: `id (UUID)`, `userId (UUID)`, `tokenHash (unique)`, `familyId (UUID)`, `isRevoked`, `expiresAt`, `createdAt`.
- `UserRole`: `CUSTOMER`, `WAREHOUSE_STAFF`, `CATALOG_MANAGER`, `ADMIN`, `SUPER_ADMIN`.

---

## 4. API ENDPOINTS

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register with email, password, fullName, phone |
| `POST` | `/api/v1/auth/login` | Public | Login -> returns access token + sets refresh cookie |
| `POST` | `/api/v1/auth/google` | Public | Google ID Token exchange |
| `POST` | `/api/v1/auth/refresh` | Cookie / Body | Rotates refresh token, issues new access token |
| `POST` | `/api/v1/auth/logout` | Optional | Revokes refresh token, clears cookie |
| `GET` | `/api/v1/auth/me` | Bearer JWT | Returns current authenticated user profile |
| `PATCH`| `/api/v1/auth/me` | Bearer JWT | Update profile (fullName, phone) |

---

## 5. STATUS CHECKLIST

- [x] **Done:** Removed Zod and simplified folder structure to standard Express architecture.
- [x] **Done:** Clean Prisma schema targeting schema `auth`.
- [x] **Done:** Simple PrismaClient singleton (`src/prisma.js`).
- [x] **Done:** Simple business service (`src/services/auth.service.js`).
- [x] **Done:** Simple controller with native checks (`src/controllers/auth.controller.js`).
- [x] **Done:** Simple JWT middleware (`src/middlewares/auth.middleware.js`).
- [x] **Done:** Route declarations (`src/routes/auth.routes.js`).
- [x] **Done:** Express server with cookie-parser, CORS, and healthcheck (`src/server.js`).
- [ ] **Pending:** Install dependencies & run Prisma migration.

---

## 6. CHANGELOG & UPDATES
- **2026-10-06:** Simplified folder structure (controllers, middlewares, routes, services), removed Zod, and used native validation.
