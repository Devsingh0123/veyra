# ORDER SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/order-service`  
**Port:** 3004  
**Database Schema:** `orders` (PostgreSQL via Prisma ORM)  
**Status:** CODE COMPLETE 🚀  
**Tech Stack:** Node.js (v20+), Express.js, Prisma ORM, CORS  

---

## 1. PURPOSE & ARCHITECTURE
Handles the entire lifecycle of an order:
- **Indian Statutory GST Engine:** Calculates CGST, SGST (intrastate 50/50 split), IGST (interstate 100%), and derives taxable base values from MRP-inclusive prices backward.
- **Strict Finite State Machine (FSM):** Enforces legal lifecycle state transitions (`PENDING` -> `PAYMENT_PENDING` -> `CONFIRMED` -> `PROCESSING` -> `PACKED` -> `SHIPPED` -> `OUT_FOR_DELIVERY` -> `DELIVERED` / `CANCELLED` / `RTO_INITIATED` -> `REFUNDED`).
- **Immutable Historical Snapshots:** Orders, line items, tax rates, and addresses are saved as immutable records so they never join dynamically to mutating catalog products or user records.
- **Coupon & Promotion Engine:** Enforces minimum order value, maximum discount caps, usage limits, and expiration checks.
- **Cash On Delivery (COD) Rules:** Minimum ₹299, Maximum ₹5,000 threshold for risk mitigation, and flat ₹49 COD fee.
- **No Heavy Validation Dependencies:** Zero `Zod` dependency; clean, native JavaScript conditionals for fast and straightforward execution.

---

## 2. PRODUCTION FOLDER STRUCTURE
```text
services/order-service/
├── prisma/
│   └── schema.prisma                 # Multi-schema PostgreSQL (orders: Order, OrderItem, OrderHistory, Coupon)
├── src/
│   ├── controllers/
│   │   └── order.controller.js       # Native JS validation, clean request handling
│   ├── routes/
│   │   └── order.routes.js           # Quote, customer orders, cancel, admin status
│   ├── services/
│   │   ├── gst.service.js            # Indian GST intrastate/interstate & MRP tax extraction
│   │   ├── fsm.service.js            # Strict FSM transition matrix & cancel eligibility
│   │   └── order.service.js          # Quotation, transactional order placement, order history
│   ├── prisma.js                     # PrismaClient singleton instance
│   └── server.js                     # Express app, CORS, /health, /api/v1/orders router
├── .env
├── .env.example
├── package.json
└── agent.md                          # This living service document
```

---

## 3. API ENDPOINTS & CONTRACTS

| Method | Endpoint | Auth / Context | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Service healthcheck probe |
| `POST` | `/api/v1/orders/quote` | Public / Customer | Live checkout quote (tax, discounts, shipping, COD rules) |
| `POST` | `/api/v1/orders` | Customer (`x-user-id`) | Place order with immutable item & address snapshots |
| `GET` | `/api/v1/orders` | Customer (`x-user-id`) | Paginated customer orders list |
| `GET` | `/api/v1/orders/:id` | Customer / Admin | Single order details with items and FSM history audit |
| `PATCH`| `/api/v1/orders/:id/cancel` | Customer / Admin | Cancel order before shipment |
| `GET` | `/api/v1/orders/admin/all` | Admin | Filterable, paginated orders list across all users |
| `PATCH`| `/api/v1/orders/admin/:id/status` | Admin | Advance order FSM state with audit history log |

---

## 4. STATUS CHECKLIST

- [x] **Done:** Service scaffold and `.env` configured for `orders` PostgreSQL schema.
- [x] **Done:** Multi-schema `prisma/schema.prisma` defined (`Order`, `OrderItem`, `OrderHistory`, `Coupon`).
- [x] **Done:** Indian statutory GST calculation engine (`src/services/gst.service.js`).
- [x] **Done:** Order lifecycle FSM transition matrix (`src/services/fsm.service.js`).
- [x] **Done:** Quotation, snapshot storage, and order management (`src/services/order.service.js`).
- [x] **Done:** Clean native controllers without Zod (`src/controllers/order.controller.js`).
- [x] **Done:** Express routes & server entrypoint on port `3004` (`src/server.js`).
- [x] **Done:** Gateway proxy route `/api/v1/orders/*` enabled in `services/api-gateway`.

---

## 5. CHANGELOG & UPDATES
- **2026-10-06:** Built complete Order Service with Indian GST calculation, immutable snapshots, strict FSM transitions, and zero Zod dependency. Connected to API Gateway.
