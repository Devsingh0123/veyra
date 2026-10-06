# CART SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/cart-service`  
**Port:** 3003  
**Database Schema:** `cart` (PostgreSQL via Prisma ORM) + Redis 7  
**Status:** CODE COMPLETE 🚀  
**Tech Stack:** Node.js (v20+), Express.js, Prisma ORM (`^6.4.0`), Redis 7 (`ioredis`), Cookie-Parser, CORS  

---

## 1. PURPOSE & ARCHITECTURE
Manages guest shopping bags and authenticated user shopping carts:
- **Dual Storage Strategy:**
  - Guest Bags: Stored in Redis with 14-day TTL keyed by `cart:guest:<sessionId>`.
  - Authenticated Carts: Persisted in PostgreSQL schema `cart` via Prisma ORM.
- **Auto-Merge on Login:** Automatically merges guest items into user cart upon login and clears the guest Redis session.
- **Zero Heavy Validation Libraries (No Zod):** Clean, fast native JavaScript validation.
- **Clean Standard Express Structure:**
  - `controllers/cart.controller.js` -> HTTP requests and responses
  - `routes/cart.routes.js` -> Route declarations
  - `services/cart.service.js` -> Redis + Prisma cart management
  - `prisma.js` -> PrismaClient instance
  - `redis.js` -> IORedis connection client
  - `server.js` -> Express app and listener

---

## 2. FOLDER STRUCTURE
```text
services/cart-service/
├── prisma/
│   └── schema.prisma         # Clean PostgreSQL 'cart' schema models
├── src/
│   ├── controllers/
│   │   └── cart.controller.js # Clean HTTP handler with native validation (No Zod)
│   ├── routes/
│   │   └── cart.routes.js     # Route declarations
│   ├── services/
│   │   └── cart.service.js    # Redis guest cart + Prisma user cart + merge
│   ├── prisma.js              # PrismaClient instance
│   ├── redis.js               # Redis client instance
│   └── server.js              # Express app & HTTP listener
├── .env.example
├── .env
├── package.json              # Clean dependencies (No Zod)
└── agent.md                  # This living service document
```

---

## 3. PRISMA MODELS (`cart` schema)

- `Cart`: `id (UUID)`, `userId (UUID unique)`, `createdAt`, `updatedAt`, `items (relation)`.
- `CartItem`: `id (UUID)`, `cartId (UUID)`, `variantId (UUID)`, `quantity (Int)`, `unique([cartId, variantId])`.

---

## 4. API ENDPOINTS

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/cart` | Get cart (reads `x-user-id` from DB or `x-session-id` from Redis) |
| `POST` | `/api/v1/cart/items` | Add item to cart or guest bag |
| `PATCH`| `/api/v1/cart/items/:variantId` | Update item quantity |
| `DELETE`| `/api/v1/cart/items/:variantId`| Remove item from cart or guest bag |
| `POST` | `/api/v1/cart/merge` | Merge guest cart into user account cart on login |
| `DELETE`| `/api/v1/cart/clear` | Clear cart |

---

## 5. STATUS CHECKLIST

- [x] **Done:** Cleaned up and removed Zod from Cart Service.
- [x] **Done:** Standardized to classic Express structure (`controllers/`, `routes/`, `services/`, `prisma.js`, `redis.js`, `server.js`).
- [x] **Done:** Clean Prisma schema targeting schema `cart`.
- [x] **Done:** Redis guest bag storage with 14-day TTL.
- [x] **Done:** Persistent PostgreSQL user cart via Prisma.
- [x] **Done:** Guest-to-user cart auto-merge on login.
- [x] **Done:** Enabled `/api/v1/cart/*` route proxy on API Gateway (:3000).
- [ ] **Pending:** Install dependencies & run Prisma migration.

---

## 6. CHANGELOG & UPDATES
- **2026-10-06:** Built complete simple Cart Service with Redis guest bags, Prisma persistent carts, auto-merge, and hooked into API Gateway.
