# CATALOG SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/catalog-service`  
**Port:** 3002  
**Database Schema:** `catalog` (PostgreSQL via Prisma ORM)  
**Status:** CODE COMPLETE 🚀  
**Tech Stack:** Node.js (v20+), Express.js, Prisma ORM (`^6.4.0`), CORS  

---

## 1. PURPOSE & ARCHITECTURE
Handles multi-category product catalog management, category tree hierarchies, dynamic attributes, variants, and stock reservation:
- **Zero Raw SQL (Prisma ORM):** Isolated PostgreSQL schema `catalog`.
- **Dynamic JSONB Attributes:** Custom category-specific attributes (sizes, colors, carats, shelf life, Veg/Non-Veg dot) stored in indexed JSONB columns without complex EAV joins.
- **Variant Matrix & Dimensions:** SKUs, dead weight, dimensions ($L \times W \times H$), MRP, and selling price.
- **Atomic Stock Reservation:** Concurrency control managed via Prisma Interactive Transactions (`prisma.$transaction`) with version-based optimistic locking.
- **Zero Heavy Validation Libraries (No Zod):** Native JavaScript validation.
- **Clean Standard Express Structure:**
  - `controllers/` -> `category.controller.js`, `product.controller.js`, `inventory.controller.js`
  - `routes/` -> `category.routes.js`, `product.routes.js`, `inventory.routes.js`
  - `services/` -> `category.service.js`, `product.service.js`, `inventory.service.js`
  - `prisma.js` -> PrismaClient instance
  - `server.js` -> Express app & HTTP listener

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
└── agent.md                  # This living service document
```

---

## 3. PRISMA MODELS (`catalog` schema)

- `Category`: `id`, `name`, `slug (unique)`, `description`, `parentId`, `isActive`, `children (relation)`.
- `Brand`: `id`, `name (unique)`, `slug (unique)`, `logoUrl`.
- `Product`: `id`, `categoryId`, `brandId`, `name`, `slug (unique)`, `description`, `hsnCode`, `gstRate`, `isActive`, `attributes (JSONB)`, `variants (relation)`.
- `ProductVariant`: `id`, `productId`, `sku (unique)`, `title`, `mrp`, `sellingPrice`, `weightGrams`, `lengthCm`, `widthCm`, `heightCm`, `variantOptions (JSONB)`, `images (JSONB)`, `inventory (relation)`.
- `Inventory`: `id`, `variantId (unique)`, `stockQuantity`, `reservedQuantity`, `version`, `updatedAt`.
- `InventoryReservation`: `id`, `reservationToken (unique)`, `variantId`, `quantity`, `status (enum)`, `expiresAt`.

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

- [x] **Done:** Removed Zod and simplified folder structure to standard Express architecture.
- [x] **Done:** Clean Prisma schema defined for `catalog` schema.
- [x] **Done:** Category service, controller, and routes implemented.
- [x] **Done:** Product service, controller, and routes implemented with multi-variant transaction.
- [x] **Done:** Inventory atomic reservation engine implemented with Prisma optimistic lock.
- [x] **Done:** Express server with healthcheck and routes configured (`src/server.js`).
- [x] **Done:** Proxied via API Gateway (`http://localhost:3000/api/v1/catalog/*`).
- [ ] **Pending:** Install dependencies & run Prisma migration.

---

## 6. CHANGELOG & UPDATES
- **2026-10-06:** Simplified folder structure (controllers, routes, services), removed Zod, and used native validation.
