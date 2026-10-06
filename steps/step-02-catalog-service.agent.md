# STEP 02: CATALOG & MULTI-CATEGORY SERVICE

**Status:** CODE COMPLETE 🚀  
**Domain:** Categories hierarchy, Products, Product Variants, JSONB Attributes, Atomic Stock Reservations  
**Target Path:** [`services/catalog-service`](file:///c:/Users/HP/Desktop/New%20folder/services/catalog-service)  
**Database Schema:** `catalog` (PostgreSQL via Prisma ORM)  
**Port:** 3002  

---

## 1. OBJECTIVES & ARCHITECTURE
Build a flexible multi-category catalog backend for apparel, electronics, FMCG, jewelry, and home goods:
- **Zero Raw SQL (Prisma ORM):** Data isolation in schema `catalog`.
- **Category Hierarchy:** Parent/children hierarchy with automatic slugs.
- **Dynamic Attributes via JSONB:** Category-specific attributes stored cleanly in indexed JSONB columns without complex EAV joins.
- **Variant Matrix:** SKUs, dimensions ($L \times W \times H$), MRP, and selling price.
- **Atomic Stock Reservation:** Pure ORM optimistic lock with `updateMany` and interactive transactions.
- **Zero Zod Dependency:** Native JavaScript input validation.

---

## 2. FOLDER STRUCTURE
```text
services/catalog-service/
├── prisma/
│   └── schema.prisma         # Clean PostgreSQL 'catalog' schema models
├── src/
│   ├── controllers/
│   │   ├── category.controller.js
│   │   ├── product.controller.js
│   │   └── inventory.controller.js
│   ├── routes/
│   │   ├── category.routes.js
│   │   ├── product.routes.js
│   │   └── inventory.routes.js
│   ├── services/
│   │   ├── category.service.js
│   │   ├── product.service.js
│   │   └── inventory.service.js
│   ├── prisma.js             # PrismaClient instance
│   └── server.js             # Express app & HTTP listener
├── .env.example
├── .env
├── package.json              # Clean dependencies (No Zod)
└── agent.md
```

---

## 3. PRISMA ORM SCHEMA (`services/catalog-service/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["catalog"]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

model Category {
  id          String     @id @default(uuid()) @db.Uuid
  name        String     @db.VarChar(100)
  slug        String     @unique @db.VarChar(120)
  description String?    @db.Text
  parentId    String?    @map("parent_id") @db.Uuid
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
  products Product[]

  @@map("categories")
  @@schema("catalog")
}

model Brand {
  id        String    @id @default(uuid()) @db.Uuid
  name      String    @unique @db.VarChar(100)
  slug      String    @unique @db.VarChar(120)
  logoUrl   String?   @map("logo_url") @db.VarChar(500)
  createdAt DateTime  @default(now()) @map("created_at")
  products  Product[]

  @@map("brands")
  @@schema("catalog")
}

model Product {
  id             String           @id @default(uuid()) @db.Uuid
  categoryId     String           @map("category_id") @db.Uuid
  brandId        String?          @map("brand_id") @db.Uuid
  name           String           @db.VarChar(255)
  slug           String           @unique @db.VarChar(300)
  description    String?          @db.Text
  hsnCode        String           @map("hsn_code") @db.VarChar(10)
  gstRate        Decimal          @map("gst_rate") @db.Decimal(5, 2)
  isActive       Boolean          @default(true) @map("is_active")
  attributes     Json             @default("{}")
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")

  category Category         @relation(fields: [categoryId], references: [id])
  brand    Brand?           @relation(fields: [brandId], references: [id])
  variants ProductVariant[]

  @@index([categoryId])
  @@index([brandId])
  @@map("products")
  @@schema("catalog")
}

model ProductVariant {
  id             String      @id @default(uuid()) @db.Uuid
  productId      String      @map("product_id") @db.Uuid
  sku            String      @unique @db.VarChar(100)
  title          String      @db.VarChar(200)
  mrp            Decimal     @db.Decimal(10, 2)
  sellingPrice   Decimal     @map("selling_price") @db.Decimal(10, 2)
  weightGrams    Int         @map("weight_grams")
  lengthCm       Decimal?    @map("length_cm") @db.Decimal(6, 2)
  widthCm        Decimal?    @map("width_cm") @db.Decimal(6, 2)
  heightCm       Decimal?    @map("height_cm") @db.Decimal(6, 2)
  variantOptions Json        @default("{}") @map("variant_options")
  images         Json        @default("[]")
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  product   Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  inventory Inventory?

  @@index([productId])
  @@map("product_variants")
  @@schema("catalog")
}

model Inventory {
  id               String   @id @default(uuid()) @db.Uuid
  variantId        String   @unique @map("variant_id") @db.Uuid
  stockQuantity    Int      @default(0) @map("stock_quantity")
  reservedQuantity Int      @default(0) @map("reserved_quantity")
  version          Int      @default(1)
  updatedAt        DateTime @updatedAt @map("updated_at")

  variant ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)

  @@map("inventory")
  @@schema("catalog")
}

enum ReservationStatus {
  ACTIVE
  FULFILLED
  RELEASED
  EXPIRED

  @@schema("catalog")
}

model InventoryReservation {
  id               String            @id @default(uuid()) @db.Uuid
  reservationToken String            @unique @map("reservation_token") @db.VarChar(100)
  variantId        String            @map("variant_id") @db.Uuid
  quantity         Int
  status           ReservationStatus @default(ACTIVE)
  expiresAt        DateTime          @map("expires_at")
  createdAt        DateTime          @default(now()) @map("created_at")
  updatedAt        DateTime          @updatedAt @map("updated_at")

  @@index([variantId])
  @@index([expiresAt])
  @@map("inventory_reservations")
  @@schema("catalog")
}
```

---

## 4. API ENDPOINTS

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/catalog/categories` | Recursive category tree |
| `GET` | `/api/v1/catalog/categories/:slug` | Category details by slug |
| `POST` | `/api/v1/catalog/categories` | Create category |
| `PATCH`| `/api/v1/catalog/categories/:id` | Update category |
| `GET` | `/api/v1/catalog/products` | Paginated product listing with filters and sorting |
| `GET` | `/api/v1/catalog/products/:slug` | Full product detail with variant SKU matrix |
| `POST` | `/api/v1/catalog/products` | Create product + variants + inventory in one transaction |
| `GET` | `/api/v1/catalog/inventory/:variantId`| Check stock availability for a SKU |
| `POST` | `/api/v1/catalog/inventory/reserve`| Atomic stock reservation hold (15 min) |
| `POST` | `/api/v1/catalog/inventory/release`| Release reservation back to available pool |
| `POST` | `/api/v1/catalog/inventory/fulfill`| Fulfill reservation on confirmed order |

---

## 5. STATUS CHECKLIST

- [x] **Done:** Cleaned up and removed Zod from Catalog Service.
- [x] **Done:** Standardized to classic Express structure (`controllers/`, `routes/`, `services/`, `prisma.js`, `server.js`).
- [x] **Done:** Native request validation in controllers.
- [x] **Done:** Proxied via API Gateway (`http://localhost:3000/api/v1/catalog/*`).
- [ ] **Pending:** Install dependencies & run Prisma migrations.
