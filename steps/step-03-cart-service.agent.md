# STEP 03: CART MANAGEMENT SERVICE

**Status:** CODE COMPLETE 🚀  
**Domain:** Ephemeral Guest Carts, Persistent User Carts, Auto-Merge on Login, Stock Synchronization  
**Target Path:** [`services/cart-service`](file:///c:/Users/HP/Desktop/New%20folder/services/cart-service)  
**Database Schema:** `cart` (PostgreSQL via Prisma ORM) + Redis 7  
**Port:** 3003  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Dual-Storage Cart Pattern:**
  - Guest carts: Fast in-memory storage in Redis keyed by `cart:guest:<sessionId>` with a 14-day TTL.
  - Authenticated carts: Persistent relational storage in PostgreSQL schema `cart` via Prisma ORM.
- **Seamless Merge on Login:** When a guest logs in, their anonymous cart items merge into their persistent account cart, updating quantities.
- **Zero Zod Dependency:** Native JavaScript validation in controllers.

---

## 2. FOLDER STRUCTURE
```text
services/cart-service/
├── prisma/
│   └── schema.prisma         # Clean PostgreSQL 'cart' schema models
├── src/
│   ├── controllers/
│   │   └── cart.controller.js # Native validation (No Zod)
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
└── agent.md
```

---

## 3. PRISMA ORM SCHEMA (`services/cart-service/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["cart"]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

model Cart {
  id        String     @id @default(uuid()) @db.Uuid
  userId    String     @unique @map("user_id") @db.Uuid
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  items     CartItem[]

  @@map("carts")
  @@schema("cart")
}

model CartItem {
  id        String   @id @default(uuid()) @db.Uuid
  cartId    String   @map("cart_id") @db.Uuid
  variantId String   @map("variant_id") @db.Uuid
  quantity  Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  cart Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)

  @@unique([cartId, variantId])
  @@index([cartId])
  @@map("cart_items")
  @@schema("cart")
}
```

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
- [x] **Done:** Defined `prisma/schema.prisma` for `cart` schema.
- [x] **Done:** Implemented Redis guest cart storage with 14-day TTL.
- [x] **Done:** Implemented Prisma persistent user cart repository & service.
- [x] **Done:** Implemented Cart auto-merge engine.
- [x] **Done:** Enabled `/api/v1/cart/*` proxy in API Gateway (:3000).
- [ ] **Pending:** Install dependencies & run Prisma migration.
