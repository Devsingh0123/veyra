# STEP 07: ORDER LIFECYCLE & STATE MACHINE SERVICE

**Status:** DONE ✅  
**Domain:** Order Creation, Strict State Machine (FSM), Immutable Historical Snapshots, Address Management  
**Target Path:** [`services/order-service`](file:///c:/Users/HP/Desktop/New%20folder/services/order-service)  
**Database Schema:** `orders` (PostgreSQL via Prisma ORM)  
**Port:** 3004  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Strict Finite State Machine (FSM):** Enforces legal state transitions (`PENDING` -> `PAYMENT_PENDING` -> `CONFIRMED` -> `PROCESSING` -> `PACKED` -> `SHIPPED` -> `OUT_FOR_DELIVERY` -> `DELIVERED` / `CANCELLED` / `RTO_INITIATED`).
- **Immutable Historical Snapshots:** Orders store permanent copies of item title, SKU, HSN, MRP, sold price, GST rate, and address at time of purchase. They never join dynamically to live catalog or user tables.
- **Audit Log of Transitions:** Every state transition is recorded in `order_status_history` with timestamp, actor, and metadata.

---

## 2. PRISMA ORM SCHEMA (`services/order-service/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["orders"]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

enum OrderStatus {
  PENDING
  PAYMENT_PENDING
  CONFIRMED
  PROCESSING
  PACKED
  SHIPPED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  RTO_INITIATED
  RTO_DELIVERED
  RETURN_REQUESTED
  RETURN_RECEIVED
  REFUNDED

  @@schema("orders")
}

enum PaymentMethod {
  PREPAID
  COD

  @@schema("orders")
}

model Order {
  id              String         @id @default(uuid()) @db.Uuid
  orderNumber     String         @unique @map("order_number") @db.VarChar(50)
  userId          String         @map("user_id") @db.Uuid
  status          OrderStatus    @default(PENDING)
  paymentMethod   PaymentMethod  @map("payment_method")
  subtotal        Decimal        @db.Decimal(10, 2)
  discountAmount  Decimal        @default(0) @map("discount_amount") @db.Decimal(10, 2)
  shippingFee     Decimal        @default(0) @map("shipping_fee") @db.Decimal(10, 2)
  taxAmount       Decimal        @map("tax_amount") @db.Decimal(10, 2)
  totalAmount     Decimal        @map("total_amount") @db.Decimal(10, 2)
  shippingAddress Json           @map("shipping_address") // Immutable snapshot
  billingAddress  Json           @map("billing_address")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  items   OrderItem[]
  history OrderHistory[]

  @@index([userId])
  @@index([status])
  @@map("orders")
  @@schema("orders")
}

model OrderItem {
  id             String   @id @default(uuid()) @db.Uuid
  orderId        String   @map("order_id") @db.Uuid
  variantId      String   @map("variant_id") @db.Uuid
  productTitle   String   @map("product_title") @db.VarChar(255)
  variantTitle   String   @map("variant_title") @db.VarChar(200)
  sku            String   @db.VarChar(100)
  hsnCode        String   @map("hsn_code") @db.VarChar(10)
  unitPrice      Decimal  @map("unit_price") @db.Decimal(10, 2)
  quantity       Int
  taxRate        Decimal  @map("tax_rate") @db.Decimal(5, 2) // e.g. 18.00
  taxAmount      Decimal  @map("tax_amount") @db.Decimal(10, 2)
  totalPrice     Decimal  @map("total_price") @db.Decimal(10, 2)
  itemAttributes Json     @default("{}") @map("item_attributes") // snapshot of size/color etc.

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@map("order_items")
  @@schema("orders")
}

model OrderHistory {
  id        String      @id @default(uuid()) @db.Uuid
  orderId   String      @map("order_id") @db.Uuid
  fromState OrderStatus @map("from_state")
  toState   OrderStatus @map("to_state")
  note      String?     @db.Text
  actorRole String      @map("actor_role") @db.VarChar(50) // SYSTEM, CUSTOMER, ADMIN
  createdAt DateTime    @default(now()) @map("created_at")

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@map("order_history")
  @@schema("orders")
}
```

---

## 3. API ENDPOINTS & CONTRACTS

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/orders/quote` | Public | Calculate live checkout quotation (tax, discount, COD) |
| `POST` | `/api/v1/orders` | Auth | Create order with immutable item & address snapshot |
| `GET` | `/api/v1/orders` | Auth | List authenticated customer's orders |
| `GET` | `/api/v1/orders/:id` | Auth | Get order snapshot details and tracking status |
| `PATCH`| `/api/v1/orders/:id/cancel` | Auth | Cancel order (only before PACKED/DISPATCHED) |
| `GET`  | `/api/v1/orders/admin/all` | Admin | List all orders with filters and pagination |
| `PATCH`| `/api/v1/orders/admin/:id/status` | Admin | Advance order FSM state |

---

## 4. STATUS & IMPLEMENTATION ROADMAP

- [x] **Done:** Install Prisma in `services/order-service`.
- [x] **Done:** Define `prisma/schema.prisma` for `orders` schema.
- [x] **Done:** Implement Indian GST tax calculation engine (`gst.service.js`).
- [x] **Done:** Implement Order FSM transition matrix engine (`fsm.service.js`).
- [x] **Done:** Implement Order creation orchestrator with immutable snapshot generation (`order.service.js`).
- [x] **Done:** Implement Order history audit logger.
- [x] **Done:** Expose Customer and Admin Order endpoints without Zod (`order.controller.js`).
- [x] **Done:** Register `/api/v1/orders/*` route in API Gateway.

---

## 5. MODIFICATION & ISOLATION NOTES
- FSM state rules and constraints live in `src/services/fsm.service.js` without affecting payment or catalog logic.
